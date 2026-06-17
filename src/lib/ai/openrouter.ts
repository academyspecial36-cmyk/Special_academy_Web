import {
  AI_PRIMARY_MODEL,
  AI_FALLBACK_MODEL,
  AI_SECOND_FALLBACK_MODEL,
  AI_MAX_TOKENS,
  AI_TEMPERATURE,
  OPENROUTER_BASE_URL,
} from "@/constants/ai";

const MODELS = [AI_PRIMARY_MODEL, AI_FALLBACK_MODEL, AI_SECOND_FALLBACK_MODEL];

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
}

interface ChatOptions {
  messages: Message[];
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
  onToken?: (token: string) => void;
  onToolCall?: (toolCall: { id: string; type: "function"; function: { name: string; arguments: string } }) => void;
  onStatus?: (status: string) => void;
  signal?: AbortSignal;
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not configured");
  return key;
}

async function tryModel(
  model: string,
  messages: Message[],
  tools: ChatOptions["tools"],
  signal?: AbortSignal
): Promise<Response> {
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: AI_MAX_TOKENS,
    temperature: AI_TEMPERATURE,
    stream: true,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Special Academy AI",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`OpenRouter ${model}: ${res.status} ${errText}`);
  }

  return res;
}

function extractToolCall(accumulated: string): {
  name: string;
  arguments: string;
} | null {
  try {
    const parsed = JSON.parse(accumulated);
    if (parsed.name && parsed.arguments) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function streamChat(options: ChatOptions): Promise<{
  content: string;
  toolCalls: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
}> {
  const { messages, tools, onToken, onToolCall, onStatus, signal } = options;
  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      onStatus?.("thinking");
      const res = await tryModel(model, messages, tools, signal);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      const toolCallMap = new Map<number, {
        id: string;
        name: string;
        arguments: string;
      }>();
      const toolCalls: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const choices = parsed.choices?.[0];
            const delta = choices?.delta;

            if (delta?.content) {
              fullContent += delta.content;
              onToken?.(delta.content);
            }

            if (delta?.tool_calls) {
              onStatus?.("generating");
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                let entry = toolCallMap.get(idx);
                if (tc.id) {
                  entry = { id: tc.id, name: "", arguments: "" };
                  toolCallMap.set(idx, entry);
                }
                if (entry) {
                  if (tc.function?.name) entry.name += tc.function.name;
                  if (tc.function?.arguments) entry.arguments += tc.function.arguments;
                }
              }
            }

            const finishReason = choices?.finish_reason;
            if (finishReason === "tool_calls") {
              for (const [, call] of toolCallMap) {
                const fullToolCall = {
                  id: call.id,
                  type: "function" as const,
                  function: {
                    name: call.name,
                    arguments: call.arguments,
                  },
                };
                toolCalls.push(fullToolCall);
                onToolCall?.(fullToolCall);
              }
              toolCallMap.clear();
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      onStatus?.("completed");
      return { content: fullContent, toolCalls };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown error");
      if (signal?.aborted) throw lastError;
      console.warn(`Model ${model} failed:`, lastError.message);
      continue;
    }
  }

  throw lastError || new Error("All models failed");
}
