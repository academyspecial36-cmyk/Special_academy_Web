import { z } from "zod";
import { hybridSearch } from "@/lib/ai/rag";
import type { AIToolDefinition } from "@/types/ai";
import { sections as guideSections } from "@/app/dashboard/guide/guide-data";

function searchGuideDataInMemory(query: string): Array<{ title: string; content: string; source_type: string; score: number }> {
  const q = query.toLowerCase();
  const results: Array<{ title: string; content: string; source_type: string; score: number }> = [];

  for (const section of guideSections) {
    const stepText = section.steps
      ? section.steps.map((s) => `Step ${s.step}: ${s.title}\n${s.desc}`).join("\n")
      : "";
    const tipsText = section.tips ? `Tips:\n${section.tips.map((t: string) => `- ${t}`).join("\n")}` : "";
    const warnsText = section.warns ? `Warnings:\n${section.warns.map((w: string) => `- ${w}`).join("\n")}` : "";
    const itemsText = section.items ? `Key points:\n${section.items.map((i: string) => `- ${i}`).join("\n")}` : "";
    const content = [section.title, stepText, tipsText, warnsText, itemsText].filter(Boolean).join("\n\n");

    const searchable = [
      section.title,
      ...(section.steps ?? []).flatMap((s) => [s.title, s.desc]),
      ...(section.tips ?? []),
      ...(section.warns ?? []),
      ...(section.items ?? []),
    ].join(" ").toLowerCase();

    let score = 0;
    const qWords = q.split(/\s+/).filter(Boolean);
    for (const word of qWords) {
      if (searchable.includes(word)) score++;
    }
    if (content.toLowerCase().includes(q)) score += 3;

    if (score > 0) {
      results.push({ title: `Guide: ${section.title}`, content, source_type: "guide", score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

export const searchKnowledgeTool: AIToolDefinition = {
  name: "searchKnowledge",
  description: "Search the academy's documentation, guides, and knowledge base. Call this when the user asks HOW TO do something, wants instructions, or asks about academy settings/configuration. Returns relevant guide entries and documentation.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query about how to do something or what they need help with" },
    },
    required: ["query"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const { query } = z.object({ query: z.string().min(1) }).parse(args);

      // Try database search first
      const dbResults = await hybridSearch(query);
      if (dbResults.length > 0) {
        return { success: true, data: dbResults };
      }

      // Fallback: search guide data in-memory
      const fallbackResults = searchGuideDataInMemory(query);
      if (fallbackResults.length > 0) {
        return { success: true, data: fallbackResults };
      }

      return { success: true, data: [] };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to search knowledge base" };
    }
  },
};
