import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("API: AI Chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a message and receive a stream", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"token","content":"Hello"}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"token","content":" world"}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"done","content":"Hello world"}\n\n'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map(),
      body: stream,
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello", conversationId: undefined }),
    });

    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith("/api/ai/chat", expect.objectContaining({
      method: "POST",
      body: expect.stringContaining("Hello"),
    }));

    const reader = response.body?.getReader();
    expect(reader).toBeTruthy();

    let fullText = "";
    const decoder = new TextDecoder();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.type === "token") fullText += parsed.content;
        }
      }
    }
    expect(fullText).toBe("Hello world");
  });

  it("should handle tool calls in stream", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"tool_call","toolCall":{"id":"call1","function":{"name":"searchStudents","arguments":"{}"}}}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"tool_result","toolResult":{"name":"searchStudents","result":[{"id":"1","name":"John"}]}}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"done","content":"Found 1 student"}\n\n'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map(),
      body: stream,
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Find students" }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let toolCall = null;
    let toolResult = null;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.type === "tool_call") toolCall = parsed.toolCall;
          if (parsed.type === "tool_result") toolResult = parsed.toolResult;
        }
      }
    }

    expect(toolCall?.function.name).toBe("searchStudents");
    expect(toolResult?.name).toBe("searchStudents");
    expect(toolResult?.result).toEqual([{ id: "1", name: "John" }]);
  });

  it("should handle error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "Rate limit exceeded" }),
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Hello" }),
    });

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe("Rate limit exceeded");
  });

  it("should handle stream errors gracefully", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"error","error":"Internal server error"}\n\n'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map(),
      body: stream,
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Test" }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let errorMsg = null;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.type === "error") errorMsg = parsed.error;
        }
      }
    }

    expect(errorMsg).toBe("Internal server error");
  });

  it("should handle conversationId from header", async () => {
    const headers = new Map();
    headers.set("X-Conversation-Id", "conv-123");
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"done","content":"Done"}\n\n'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers,
      body: stream,
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Hi", conversationId: undefined }),
    });

    const convId = response.headers.get("X-Conversation-Id");
    expect(convId).toBe("conv-123");
  });

  it("should send correct request body format", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"done","content":"Done"}\n\n'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({ ok: true, headers: new Map(), body: stream });

    await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: undefined, message: "Test", pathname: "/dashboard" }),
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody).toHaveProperty("message", "Test");
    expect(callBody).toHaveProperty("pathname", "/dashboard");
  });

  it("should reject empty messages", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "Message is required" }),
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Message is required");
  });
});
