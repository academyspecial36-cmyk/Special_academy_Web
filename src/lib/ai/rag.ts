import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { AI_RAG_TOP_K, AI_EMBEDDING_MODEL, OPENROUTER_BASE_URL } from "@/constants/ai";
import type { AIDocument } from "@/types/ai";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not configured");
  return key;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: AI_EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);

  const data = await res.json();
  return data.data?.[0]?.embedding || [];
}

export async function hybridSearch(
  query: string,
  sourceType?: string,
  topK: number = AI_RAG_TOP_K
): Promise<AIDocument[]> {
  const svc = createServiceRoleSupabase();

  try {
    const embedding = await generateEmbedding(query);

    let rpcQuery = svc.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: topK,
    });

    if (sourceType) {
      rpcQuery = rpcQuery.filter("source_type", "eq", sourceType);
    }

    const { data: vectorResults } = await rpcQuery;

    // Also do a keyword search as fallback
    const { data: keywordResults } = await svc
      .from("ai_documents")
      .select("*")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(topK);

    // Merge results (deduplicate by id)
    const seen = new Set<string>();
    const merged: AIDocument[] = [];

    for (const doc of [...(vectorResults ?? []), ...(keywordResults ?? [])]) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        merged.push(doc as AIDocument);
      }
    }

    return merged.slice(0, topK);
  } catch {
    // Fallback to keyword-only search if vector search fails
    const { data } = await svc
      .from("ai_documents")
      .select("*")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(topK);

    return (data ?? []) as AIDocument[];
  }
}

export async function seedDocuments(): Promise<number> {
  const svc = createServiceRoleSupabase();

  const sources: Array<{ title: string; content: string; source_type: AIDocument["source_type"] }> = [];

  // Fetch guide pages
  const { data: guideContent } = await svc.from("settings").select("*").eq("key", "guide_content");
  if (guideContent?.length) {
    sources.push({
      title: "Admin Guide",
      content: JSON.stringify(guideContent),
      source_type: "guide",
    });
  }

  // Fetch FAQs
  const { data: faqs } = await svc.from("faqs").select("question, answer");
  for (const faq of faqs ?? []) {
    sources.push({
      title: `FAQ: ${faq.question}`,
      content: `${faq.question}\n${faq.answer}`,
      source_type: "faq",
    });
  }

  // Fetch courses
  const { data: courses } = await svc.from("courses").select("title, description, duration, price, features");
  for (const course of courses ?? []) {
    sources.push({
      title: `Course: ${course.title}`,
      content: `Title: ${course.title}\nDescription: ${course.description}\nDuration: ${course.duration}\nPrice: ${course.price}\nFeatures: ${(course.features as string[])?.join(", ")}`,
      source_type: "course",
    });
  }

  // Generate embeddings and insert
  let count = 0;
  for (const source of sources) {
    try {
      const embedding = await generateEmbedding(source.content);
      await svc.from("ai_documents").upsert({
        title: source.title,
        content: source.content,
        source_type: source.source_type,
        embedding,
      });
      count++;
    } catch {
      console.warn(`Failed to embed document: ${source.title}`);
    }
  }

  return count;
}
