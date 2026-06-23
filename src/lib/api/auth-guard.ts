import { NextResponse } from "next/server";
import { createServerSupabase } from "../supabase-server";

export async function requireAuth() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { supabase, user, error: null };
}

export async function requireAdmin() {
  const { supabase, user, error: authError } = await requireAuth();
  if (authError) return { supabase: null as any, user: null, error: authError };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { supabase: null as any, user: null, error: NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 }) };
  }

  return { supabase, user, error: null, profile };
}
