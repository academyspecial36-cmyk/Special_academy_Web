import { NextRequest } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { getServerSession } from "@/lib/auth-utils";
import { executeTool } from "@/lib/ai/tools/registry";
import { streamChat } from "@/lib/ai/openrouter";
import { extractBlocks } from "@/lib/ai/response-parser";
import type { AIResponseBlock } from "@/types/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { conversationId, toolName, toolArgs } = await req.json();
    if (!conversationId || !toolName) {
      return new Response(JSON.stringify({ error: "conversationId and toolName are required" }), { status: 400 });
    }

    const svc = createServiceRoleSupabase();
    const userId = session.user.id;

    // Verify conversation ownership
    const { data: conv } = await svc
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!conv) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }

    // Execute the tool
    const toolResult = await executeTool(toolName, (toolArgs ?? {}) as Record<string, unknown>, userId);

    // Find and UPDATE the pending tool message instead of inserting a new one
    const { data: pendingMessages } = await svc
      .from("ai_messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("role", "tool")
      .eq("tool_name", toolName)
      .eq("metadata->>pending", "true")
      .order("created_at", { ascending: false })
      .limit(1);

    if (pendingMessages && pendingMessages.length > 0) {
      await svc
        .from("ai_messages")
        .update({
          tool_result: toolResult,
          content: JSON.stringify(toolResult),
          metadata: { tool_call_id: pendingMessages[0].id, pending: false },
        })
        .eq("id", pendingMessages[0].id);
    } else {
      await svc.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "tool",
        tool_name: toolName,
        tool_args: toolArgs ?? {},
        tool_result: toolResult,
        content: JSON.stringify(toolResult),
      });
    }

    // Update conversation timestamp
    await svc.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    // Get the follow-up AI response
    try {
      const { data: history } = await svc
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(50);

      const openRouterMessages = (history ?? []).map((m) => ({
        role: m.role as "user" | "assistant" | "tool",
        content: m.content,
        tool_calls: m.tool_calls as Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> | undefined,
        tool_call_id: m.role === "tool" ? (m.metadata as { tool_call_id?: string })?.tool_call_id : undefined,
        name: m.role === "tool" ? m.tool_name : undefined,
      }));

      // Only add a user-like prompt to ask the AI to summarize the result
      const followUp = await streamChat({
        messages: [
          ...openRouterMessages,
          {
            role: "user" as const,
            content: "The tool was confirmed and executed. Please summarize what happened in a brief message.",
          },
        ],
        onStatus: () => {},
      });

      if (followUp.content) {
        const { cleanedContent: followUpClean, blocks: followUpBlocks } = extractBlocks(followUp.content);
        if (followUpClean) {
          await svc.from("ai_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: followUpClean,
          });
        }

        const resultBlocks: AIResponseBlock[] = [
          { type: "action_result", data: { success: true, title: "Action Completed", message: followUpClean || "Action completed" } },
          ...followUpBlocks,
        ];

        return Response.json({ success: true, result: toolResult, followUp: followUpClean, blocks: resultBlocks });
      }
    } catch {
      // Follow-up AI call is optional, don't break the flow
    }

    return Response.json({ success: true, result: toolResult });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
