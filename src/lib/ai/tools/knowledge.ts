import { z } from "zod";
import { hybridSearch } from "@/lib/ai/rag";
import type { AIToolDefinition } from "@/types/ai";

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
      const results = await hybridSearch(query);
      return { success: true, data: results };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to search knowledge base" };
    }
  },
};
