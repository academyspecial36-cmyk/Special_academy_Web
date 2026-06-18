"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

const PageWrapper = dynamic(() => import("@/components/shared/page-wrapper").then(m => ({ default: m.PageWrapper })), { ssr: false });

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.role === "student") {
        try {
          const res = await fetch("/api/enrollment-status");
          if (res.ok) {
            const data = await res.json();
            if (data.status !== "approved") {
              const { getSupabase } = await import("@/lib/supabase");
              await getSupabase()?.auth.signOut();
              setError("Your account is not yet approved. Please contact 986-0302036 for assistance.");
              return;
            }
          }
        } catch {
          const { getSupabase } = await import("@/lib/supabase");
          await getSupabase()?.auth.signOut();
          setError("Unable to verify enrollment status. Please try again.");
          return;
        }
        window.location.href = "/student";
      } else {
        const { getSupabase } = await import("@/lib/supabase");
        await getSupabase()?.auth.signOut();
        setError("Access denied. Student account required.");
      }
    } else {
      setError(result.error || "Invalid credentials");
    }
  }

  return (
    <PageWrapper>
      <section className="py-20 md:py-28 bg-accent min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 border border-primary/5 shadow-card"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
              <p className="text-sm text-muted mt-1">
                Sign in to your student account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-primary/20 text-primary focus:ring-primary" />
                  <span className="text-muted">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-secondary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-primary/5 text-center">
              <p className="text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/enrollment" className="text-secondary hover:underline font-medium inline-flex items-center gap-1">
                  Create Account
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
