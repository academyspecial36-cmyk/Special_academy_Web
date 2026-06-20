import { NextRequest } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { getServerSession } from "@/lib/auth-utils";
import { streamChat } from "@/lib/ai/openrouter";
import { getToolsForModel, executeTool, getTool } from "@/lib/ai/tools/registry";
import { buildContext, getContextSummary } from "@/lib/ai/context";
import { AI_SYSTEM_PROMPT } from "@/constants/ai";
import { extractBlocks } from "@/lib/ai/response-parser";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AIResponseBlock } from "@/types/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSystemPrompt(context: string): string {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return AI_SYSTEM_PROMPT
    .replace("{{CURRENT_DATE}}", now)
    .replace("{{PAGE_CONTEXT}}", context);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      return new Response(JSON.stringify({ error: "conversationId is required" }), { status: 400 });
    }

    const svc = createServiceRoleSupabase();

    // Verify ownership
    const { data: conv } = await svc
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!conv) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }

    const { data: messages } = await svc
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);

    return Response.json(messages ?? []);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userId = session.user.id;
    const rateCheck = checkRateLimit(`ai:${userId}`, { maxRequests: 20, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), { status: 429 });
    }

    const { conversationId, message, pathname } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    const svc = createServiceRoleSupabase();
    const context = buildContext(pathname || "/dashboard");
    const contextSummary = getContextSummary(context);

    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv } = await svc.from("ai_conversations").insert({
        user_id: userId,
        title: message.slice(0, 100),
      }).select().single();
      convId = conv?.id;
    } else {
      // Update conversation timestamp
      await svc.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    }

    // Save user message
    await svc.from("ai_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Load conversation history
    const { data: history } = await svc
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(50);

    const openRouterMessages = [
      { role: "system" as const, content: getSystemPrompt(contextSummary) },
      ...(history ?? []).map((m) => ({
        role: m.role as "user" | "assistant" | "tool",
        content: m.content,
        tool_calls: m.tool_calls as Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> | undefined,
        tool_call_id: m.role === "tool" ? (m.metadata as { tool_call_id?: string })?.tool_call_id : undefined,
        name: m.role === "tool" ? m.tool_name : undefined,
      })),
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = "";

          // First response from AI
          const result = await streamChat({
            messages: openRouterMessages,
            tools: getToolsForModel(),
            onToken: (token) => {
              fullContent += token;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`));
            },
            onToolCall: (tc) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "tool_call", toolCall: tc })}\n\n`));
            },
            onStatus: (status) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "status", status })}\n\n`));
            },
          });

          // Save assistant message
          const { cleanedContent: cleanContent, blocks: responseBlocks } = extractBlocks(result.content || "");
          const assistantMsg: Record<string, unknown> = {
            conversation_id: convId,
            role: "assistant",
            content: cleanContent || null,
          };

          if (result.toolCalls.length > 0) {
            assistantMsg.tool_calls = result.toolCalls;
          }

          await svc.from("ai_messages").insert(assistantMsg).select().single();

          // Emit blocks from the first response
          for (const block of responseBlocks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "block", block })}\n\n`));
          }

          // Execute tools and collect results
          const toolResults: Array<{ name: string; id: string; result: unknown }> = [];
          for (const tc of result.toolCalls) {
            let toolArgs: Record<string, unknown> = {};
            try {
              toolArgs = JSON.parse(tc.function.arguments);
            } catch {
              toolArgs = {};
            }

            const toolDef = getTool(tc.function.name);

            // Check if this tool requires user confirmation
            if (toolDef?.requiresConfirmation) {
              let previewData: Record<string, unknown> = {};
              try {
                // Try to fetch a preview of the entity from DB
                const tableMap: Record<string, string> = {
                  deleteStudent: "students", updateStudent: "students",
                  deleteNotice: "notices", updateNotice: "notices",
                  deleteCourse: "courses", updateCourse: "courses",
                  deleteExam: "exams", updateExam: "exams",
                  deleteFAQ: "faqs", updateFAQ: "faqs",
                  deleteBlog: "blog_posts",
                  rejectEnrollment: "enrollments",
                };
                const table = tableMap[tc.function.name];
                const id = toolArgs.id as string | undefined;
                if (table && id) {
                  const { data } = await svc.from(table).select("*").eq("id", id).maybeSingle();
                  if (data) previewData = data as Record<string, unknown>;
                }
              } catch {
                // Preview fetching should never break the flow
              }

              const isDestructive = tc.function.name.startsWith("delete") || tc.function.name === "rejectEnrollment";
              const humanAction = isDestructive ? "delete" : "update";
              const entityType = tc.function.name.replace(/^(delete|update)/, "").toLowerCase();

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: "status", status: "confirming",
              })}\n\n`));

              const confirmationBlock: AIResponseBlock = {
                type: "confirmation_card",
                data: {
                  title: isDestructive ? "Confirm Deletion" : "Confirm Update",
                  message: `Are you sure you want to ${humanAction} this ${entityType}?`,
                  item: previewData?.name ?? previewData?.title ?? previewData?.question ?? toolArgs.id ?? tc.function.name,
                  action: tc.function.name,
                  payload: toolArgs,
                  destructive: isDestructive,
                  _toolName: tc.function.name,
                  _toolArgs: toolArgs,
                  _conversationId: convId,
                },
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "block", block: confirmationBlock })}\n\n`));

              const placeholder = { success: true, __pending: true, message: `Awaiting confirmation for ${tc.function.name}` };

              await svc.from("ai_messages").insert({
                conversation_id: convId,
                role: "tool",
                tool_name: tc.function.name,
                tool_args: toolArgs,
                tool_result: placeholder,
                content: JSON.stringify(placeholder),
                metadata: { tool_call_id: tc.id, pending: true },
              });

              toolResults.push({ name: tc.function.name, id: tc.id, result: placeholder });

              continue;
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "status", status: "executing" })}\n\n`));

            const toolResult = await executeTool(tc.function.name, toolArgs, userId);

            // Save tool result message
            await svc.from("ai_messages").insert({
              conversation_id: convId,
              role: "tool",
              tool_name: tc.function.name,
              tool_args: toolArgs,
              tool_result: toolResult,
              content: JSON.stringify(toolResult),
              metadata: { tool_call_id: tc.id },
            });

            toolResults.push({ name: tc.function.name, id: tc.id, result: toolResult });

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: "tool_result",
              toolCall: { name: tc.function.name, id: tc.id },
              result: toolResult,
            })}\n\n`));
          }

          const allBlocks: AIResponseBlock[] = [...responseBlocks];

          // If tools were executed, get AI's follow-up response with actual results
          // Skip follow-up if ALL tool calls are pending confirmation — AI should not see placeholders
          const allPending = toolResults.length > 0 && toolResults.every((tr) => (tr.result as Record<string, unknown>)?.__pending);
          if (result.toolCalls.length > 0 && !allPending) {
            const followUpMessages = [
              ...openRouterMessages,
              { role: "assistant" as const, content: result.content, tool_calls: result.toolCalls },
              ...toolResults.map((tr) => ({
                role: "tool" as const,
                tool_call_id: tr.id,
                content: JSON.stringify(tr.result),
                name: tr.name,
              })),
            ];

            const followUp = await streamChat({
              messages: followUpMessages as typeof openRouterMessages,
              onToken: (token) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`));
              },
              onStatus: (status) => {
                // Don't resend "completed" on follow-up
              },
            });

            const { cleanedContent: followUpClean, blocks: followUpBlocks } = extractBlocks(followUp.content || "");
            await svc.from("ai_messages").insert({
              conversation_id: convId,
              role: "assistant",
              content: followUpClean || null,
            });

            for (const block of followUpBlocks) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "block", block })}\n\n`));
            }

            allBlocks.push(...followUpBlocks);
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "done",
            conversationId: convId,
            content: cleanContent,
            blocks: allBlocks,
          })}\n\n`));
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
