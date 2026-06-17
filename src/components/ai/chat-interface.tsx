"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ThinkingIndicator } from "./thinking-indicator";
import { ResponseRenderer } from "./response-renderers/renderer";
import { ChatHeader } from "./chat-header";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatInput } from "./chat-input";
import type { AIStreamChunk, AIResponseBlock } from "@/types/ai";
import { toast } from "sonner";

interface ChatInterfaceProps {
  pathname: string;
  conversationId?: string;
  onConversationChange?: (id: string) => void;
  pendingCommand?: string | null;
  onCommandConsumed?: () => void;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string | null;
  tool_name?: string;
  tool_result?: unknown;
  blocks?: AIResponseBlock[];
}

export function ChatInterface({ pathname, conversationId, onConversationChange, pendingCommand, onCommandConsumed }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingTool, setStreamingTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const toolNameRef = useRef<string | null>(null);
  const loadedConvRef = useRef<string | null>(null);

  useEffect(() => {
    const targetId = conversationId ?? null;
    if (targetId === loadedConvRef.current) return;
    loadedConvRef.current = targetId;

    setConvId(conversationId);
    if (conversationId) {
      setMessages([]);
      setError(null);
      setStreamingMessage("");
      setStreamingTool(null);
      fetch(`/api/ai/chat?conversationId=${conversationId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load messages");
          return res.json();
        })
        .then((data: Array<{ id: string; role: string; content: string | null; tool_name?: string; tool_result?: unknown }>) => {
          const loaded: DisplayMessage[] = data
            .filter((m) => m.role !== "tool")
            .map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              ...(m.tool_name ? { tool_name: m.tool_name } : {}),
              ...(m.tool_result !== undefined ? { tool_result: m.tool_result } : {}),
            }));
          setMessages(loaded);
        })
        .catch((err) => console.error("Failed to load conversation messages:", err));
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage, status]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text || isStreaming) return;

    setInput("");
    setError(null);
    setStatus(null);
    setStreamingTool(null);
    toolNameRef.current = null;

    const userMessage: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsStreaming(true);
    setStreamingMessage("");

    const controller = new AbortController();
    abortRef.current = controller;

    let currentConvId = convId;
    let fullContent = "";
    let pendingBlocks: AIResponseBlock[] = [];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConvId,
          message: text,
          pathname,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? `Request failed (${res.status})`);
      }

      const convIdFromHeader = res.headers.get("X-Conversation-Id");
      if (convIdFromHeader && !currentConvId) {
        currentConvId = convIdFromHeader;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      const decoder = new TextDecoder();
      let buffer = "";
      let finalContent = "";
      let finalBlocks: AIResponseBlock[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const data: AIStreamChunk & {
              conversationId?: string;
              content?: string;
              blocks?: AIResponseBlock[];
            } = JSON.parse(trimmed.slice(6));

            switch (data.type) {
              case "status":
                setStatus(data.status ?? null);
                break;
              case "token":
                fullContent += data.content ?? "";
                setStreamingMessage(fullContent);
                break;
              case "tool_call":
                toolNameRef.current = data.toolCall?.function.name ?? null;
                setStreamingTool(toolNameRef.current);
                break;
              case "tool_result": {
                const tr = data.toolResult as { name: string; result: unknown } | undefined;
                if (tr) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: fullContent || null,
                      tool_name: tr.name,
                      tool_result: tr.result,
                    },
                  ]);
                  fullContent = "";
                  setStreamingMessage("");
                  toolNameRef.current = null;
                  setStreamingTool(null);
                }
                break;
              }
              case "block":
                if (data.block) {
                  finalBlocks.push(data.block);
                }
                break;
              case "done":
                finalContent = data.content || fullContent;
                if (data.conversationId && !currentConvId) {
                  currentConvId = data.conversationId;
                }
                break;
              case "error":
                setError(data.error ?? "An error occurred");
                toast.error(data.error ?? "An error occurred");
                break;
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      if (currentConvId) {
        setConvId(currentConvId);
        loadedConvRef.current = currentConvId;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: finalContent || null,
            tool_name: toolNameRef.current ?? undefined,
            blocks: finalBlocks.length > 0 ? finalBlocks : undefined,
          },
        ]);
        if (onConversationChange) {
          onConversationChange(currentConvId);
        }
        const resultBlock = finalBlocks.find((b) => b.type === "action_result");
        if (resultBlock?.data) {
          const d = resultBlock.data as { success?: boolean; error?: string };
          if (d.success) toast.success("Action completed");
          else if (d.error) toast.error(String(d.error));
        }
      }

      setStreamingMessage("");
      setStreamingTool(null);
      toolNameRef.current = null;
      setStatus(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, convId, pathname, onConversationChange]);

  useEffect(() => {
    if (pendingCommand && !isStreaming) {
      sendMessage(pendingCommand);
      onCommandConsumed?.();
    }
  }, [pendingCommand, sendMessage, onCommandConsumed, isStreaming]);

  const handleSend = useCallback(() => {
    sendMessage(input.trim());
  }, [input, sendMessage]);

  const handleConfirmTool = useCallback((result: { success: boolean; message: string; result?: unknown }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        tool_name: result.success ? undefined : "error",
        blocks: result.success
          ? [{ type: "action_result", data: { success: true, title: "Action Completed", message: result.message } }]
          : [{ type: "action_result", data: { success: false, title: "Action Failed", message: result.message } }],
      },
    ]);
  }, []);

  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {showEmptyState ? (
          <ChatEmptyState sendMessage={sendMessage} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                <ChatMessage message={msg} />
                {msg.blocks && msg.blocks.length > 0 && (
                  <div className="space-y-3 pl-2">
                    {msg.blocks.map((block, bi) => (
                      <ResponseRenderer key={bi} block={block} onConfirmTool={handleConfirmTool} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isStreaming && (
              <div className="space-y-2">
                {streamingMessage && (
                  <ChatMessage
                    message={{ role: "assistant", content: streamingMessage, tool_name: streamingTool ?? undefined }}
                    isLoading
                  />
                )}
                {!streamingMessage && status && <ThinkingIndicator status={status} />}
                {!streamingMessage && !status && <ThinkingIndicator />}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        error={error}
        onSend={handleSend}
        onDismissError={() => setError(null)}
        textareaRef={textareaRef}
      />
    </div>
  );
}
