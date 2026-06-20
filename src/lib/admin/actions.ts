import "server-only";

import { createServiceRoleSupabase } from "@/lib/supabase-server";

const sb = createServiceRoleSupabase();

export async function getAdminProfile(userId: string) {
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Failed to fetch profile");
  return data;
}

export async function getAdminUsers() {
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch users");
  return data;
}

export async function getAdminSettings() {
  const { data, error } = await sb
    .from("settings")
    .select("*")
    .single();

  if (error) throw new Error("Failed to fetch settings");
  return data;
}
