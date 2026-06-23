"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { type AuthChangeEvent, type Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { trackEvent } from "@/lib/analytics/client";

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfileServer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      const data = await res.json();
      return data?.user ?? null;
    } catch {
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) { setUser(null); setIsLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUser(null); setIsLoading(false); return; }

      // Remember-me check: if session exists in a fresh tab without remember-me flag, sign out
      const hasPersist = localStorage.getItem("persist_session") === "true";
      const hasTemp = sessionStorage.getItem("temp_session") === "true";
      if (!hasPersist && !hasTemp) {
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
        return;
      }

      const profileUser = await fetchProfileServer();
      if (profileUser) {
        setUser(profileUser);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          role: profile?.role ?? "student",
          name: profile?.name,
          avatar_url: profile?.avatar_url ?? undefined,
        });
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfileServer]);

  useEffect(() => { refreshSession(); }, [refreshSession]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
          sessionStorage.removeItem("admin_session");
          return;
        }
        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
          // Remember-me check: only set user if flags are present
          const hasPersist = localStorage.getItem("persist_session") === "true";
          const hasTemp = sessionStorage.getItem("temp_session") === "true";
          if (!hasPersist && !hasTemp) {
            if (event !== "SIGNED_IN") {
              await supabase.auth.signOut();
              setUser(null);
              setIsLoading(false);
              return;
            }
            // SIGNED_IN during login: flags are being set by the login function, still allow
          }

          const profileUser = await fetchProfileServer();
          if (profileUser) {
            setUser(profileUser);
          } else {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            setUser({
              id: session.user.id,
              email: session.user.email ?? "",
              role: profile?.role ?? "student",
              name: profile?.name,
              avatar_url: profile?.avatar_url ?? undefined,
            });
          }
          setIsLoading(false);
        }
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [fetchProfileServer]);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    // Check student status BEFORE calling Supabase auth — no session created, no race
    if (email) {
      try {
        const res = await fetch(`/api/check-student-status?email=${encodeURIComponent(email)}`);
        const status = await res.json();
        if (status.blocked) {
          return { success: false, error: status.error };
        }
      } catch {
        return { success: false, error: "Unable to verify account status. Please try again." };
      }
    }

    const supabase = getSupabase();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    // Set flags BEFORE signInWithPassword because onAuthStateChange fires synchronously during the call
    if (!rememberMe) {
      localStorage.removeItem("persist_session");
      sessionStorage.setItem("temp_session", "true");
    } else {
      localStorage.setItem("persist_session", "true");
      sessionStorage.removeItem("temp_session");
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      localStorage.removeItem("persist_session");
      sessionStorage.removeItem("temp_session");
      return { success: false, error: error.message };
    }

    if (data.user) {
      const profileUser = await fetchProfileServer();
      let role = "student";
      if (profileUser) {
        setUser(profileUser);
        role = profileUser.role;
        if (role === "admin") {
          sessionStorage.setItem("admin_session", "true");
        }
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        role = profile?.role ?? "student";
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          role,
          name: profile?.name,
          avatar_url: profile?.avatar_url ?? undefined,
        });

        if (role === "admin") {
          sessionStorage.setItem("admin_session", "true");
        }
      }

      if (role !== "admin") {
        const today = new Date().toISOString().slice(0, 10);
        trackEvent("login_completed", { eventId: `login:${data.user.id}:${today}` });
      }

      return { success: true, role };
    }

    return { success: false, error: "Login failed" };
  }, [fetchProfileServer]);

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
      trackEvent("registration_completed", { eventId: `registration:${data.user.id}` });
      return { success: true };
    }

    return { success: false, error: "Registration failed" };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    }
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem("admin_session");
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
