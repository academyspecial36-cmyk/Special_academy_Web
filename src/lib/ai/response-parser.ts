import type { AIResponseBlock } from "@/types/ai";

export function parseAIResponse(content: string): {
  message: string;
  blocks: AIResponseBlock[];
} | null {
  try {
    const trimmed = content.trim();
    // Try to find JSON object in the response
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed.message === "string" && Array.isArray(parsed.blocks)) {
      return {
        message: parsed.message,
        blocks: parsed.blocks as AIResponseBlock[],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function extractBlocks(content: string): {
  cleanedContent: string;
  blocks: AIResponseBlock[];
} {
  const parsed = parseAIResponse(content);
  if (parsed) {
    return {
      cleanedContent: parsed.message,
      blocks: parsed.blocks,
    };
  }
  return { cleanedContent: content, blocks: [] };
}
