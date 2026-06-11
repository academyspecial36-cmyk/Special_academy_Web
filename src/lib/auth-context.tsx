"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) { setUser(null); setIsLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUser(null); setIsLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        role: profile?.role ?? "student",
        name: session?.user?.user_metadata?.name,
        avatar_url: profile?.avatar_url ?? undefined,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshSession(); }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = profile?.role ?? "student";
      setUser({
        id: data.user.id,
        email: data.user.email ?? "",
        role,
        name: profile?.name,
        avatar_url: profile?.avatar_url ?? undefined,
      });

      return { success: true, role };
    }

    return { success: false, error: "Login failed" };
  }, []);

  const register = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) return { success: false, error: error.message };

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        role: "student",
      });
      setUser({
        id: data.user.id,
        email: data.user.email ?? "",
        role: "student",
        name,
      });
      return { success: true };
    }

    return { success: false, error: "Registration failed" };
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
