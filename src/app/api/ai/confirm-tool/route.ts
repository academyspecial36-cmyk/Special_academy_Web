import { NextRequest } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { getServerSession } from "@/lib/auth-utils";
import { executeTool } from "@/lib/ai/tools/registry";

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

    // Save tool result message
    await svc.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "tool",
      tool_name: toolName,
      tool_args: toolArgs ?? {},
      tool_result: toolResult,
      content: JSON.stringify(toolResult),
    });

    // Update conversation timestamp
    await svc.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return Response.json({ success: true, result: toolResult });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
