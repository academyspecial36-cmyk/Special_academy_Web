"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, KeyRound, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminAuthModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"passcode" | "login">("passcode");
  const [passcode, setPasscode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shortcutKey = (process.env.NEXT_PUBLIC_ADMIN_SHORTCUT_KEY || "").toUpperCase();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === shortcutKey) {
      e.preventDefault();
      setOpen((prev) => !prev);
      setStep("passcode");
      setPasscode("");
      setUsername("");
      setPassword("");
      setError("");
    }
  }, [shortcutKey]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function close() {
    setOpen(false);
    setStep("passcode");
    setPasscode("");
    setUsername("");
    setPassword("");
    setError("");
  }

  async function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.valid) {
        setStep("login");
        setPasscode("");
      } else {
        setError("Invalid passcode");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        close();
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-primary/5 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-primary p-6 text-white text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                  {step === "passcode" ? (
                    <KeyRound className="w-7 h-7" />
                  ) : (
                    <Shield className="w-7 h-7" />
                  )}
                </div>
                <h2 className="text-xl font-bold">
                  {step === "passcode" ? "Admin Access" : "Admin Login"}
                </h2>
                <p className="text-sm text-white/70 mt-1">
                  {step === "passcode"
                    ? "Enter the admin passcode to continue"
                    : "Sign in with your admin credentials"}
                </p>
                <button
                  onClick={close}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {step === "passcode" ? (
                  <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Passcode</label>
                      <Input
                        type="password"
                        placeholder="Enter admin passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={loading || !passcode}>
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? "Verifying..." : "Verify Passcode"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Username</label>
                      <Input
                        placeholder="Admin username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Password</label>
                      <Input
                        type="password"
                        placeholder="Admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={loading || !username || !password}>
                      <LogIn className="w-4 h-4 mr-2" />
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setStep("passcode"); setError(""); }}
                      className="text-xs text-muted hover:text-primary w-full text-center transition-colors"
                    >
                      ← Back to passcode
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
