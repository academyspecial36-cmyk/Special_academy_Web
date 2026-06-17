import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

function createMockSupabase() {
  const methods = ["select", "insert", "update", "delete", "eq", "single", "order", "limit", "or", "filter", "maybeSingle", "from"];
  const mocks: Record<string, Mock> = {};

  let resolveValue: any = { data: null, error: null };

  const query: Record<string, any> = {};

  for (const m of methods) {
    const fn = vi.fn(() => query);
    mocks[m] = fn;
    query[m] = fn;
  }

  query.then = (resolve: (value: any) => void) => resolve(resolveValue);

  return {
    supabase: query as any,
    chain: mocks,
    resolveNext: (data: any, error: any = null) => {
      resolveValue = { data, error };
    },
  };
}

vi.mock("@/lib/supabase-server", () => ({
  createServiceRoleSupabase: () => {
    const { supabase } = createMockSupabase();
    return supabase;
  },
}));

describe("API: CRUD Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/data/[table]", () => {
    it("should list records", async () => {
      const { supabase, chain, resolveNext } = createMockSupabase();
      const mockData = [{ id: "1", name: "Test" }];
      resolveNext(mockData);

      const { data } = await supabase.from("students").select("*");
      expect(data).toEqual(mockData);
      expect(chain.from).toHaveBeenCalledWith("students");
    });

    it("should return empty array when no records", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext([]);

      const { data } = await supabase.from("students").select("*");
      expect(data).toEqual([]);
    });

    it("should handle database error", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext(null, { message: "DB error", code: "PGRST116" });

      const { error } = await supabase.from("students").select("*");
      expect(error?.message).toBe("DB error");
    });

    it("should support ordering", async () => {
      const { supabase, chain, resolveNext } = createMockSupabase();
      resolveNext([]);

      await supabase.from("students").select("*").order("name", { ascending: true });
      expect(chain.order).toHaveBeenCalledWith("name", { ascending: true });
    });

    it("should support eq filter", async () => {
      const { supabase, chain, resolveNext } = createMockSupabase();
      resolveNext([{ id: "1" }]);

      const { data } = await supabase.from("students").select("*").eq("id", "1");
      expect(data).toEqual([{ id: "1" }]);
      expect(chain.eq).toHaveBeenCalledWith("id", "1");
    });
  });

  describe("POST /api/data/[table]", () => {
    it("should insert a record", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      const newRecord = { name: "New Student", email: "test@test.com" };
      resolveNext({ id: "123", ...newRecord });

      const { data } = await supabase.from("students").insert(newRecord).select().single();
      expect(data).toMatchObject(newRecord);
    });

    it("should reject duplicate records", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext(null, { message: "Duplicate key value violates unique constraint", code: "23505" });

      const { error } = await supabase.from("students").insert({ email: "dup@test.com" });
      expect(error?.code).toBe("23505");
    });

    it("should handle missing required fields", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext(null, { message: "null value in column 'name' violates not-null constraint", code: "23502" });

      const { error } = await supabase.from("students").insert({});
      expect(error?.code).toBe("23502");
    });
  });

  describe("PATCH /api/data/[table]/[id]", () => {
    it("should update a record", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      const updates = { name: "Updated Name" };
      resolveNext({ id: "1", ...updates });

      const { data } = await supabase.from("students").update(updates).eq("id", "1").select().single();
      expect(data).toMatchObject(updates);
    });

    it("should return error for non-existent record", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext(null, { message: "No rows found", code: "PGRST116" });

      const { error } = await supabase.from("students").update({ name: "X" }).eq("id", "nonexistent");
      expect(error?.code).toBe("PGRST116");
    });
  });

  describe("DELETE /api/data/[table]/[id]", () => {
    it("should delete a record", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext({ id: "1" });

      const { data } = await supabase.from("students").delete().eq("id", "1");
      expect(data).toEqual({ id: "1" });
    });

    it("should return error for non-existent record", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext(null, { message: "No rows found", code: "PGRST116" });

      const { error } = await supabase.from("students").delete().eq("id", "nonexistent");
      expect(error?.code).toBe("PGRST116");
    });

    it("should handle foreign key constraint violations", async () => {
      const { supabase, resolveNext } = createMockSupabase();
      resolveNext(null, { message: "violates foreign key constraint", code: "23503" });

      const { error } = await supabase.from("courses").delete().eq("id", "1");
      expect(error?.code).toBe("23503");
    });
  });
});
