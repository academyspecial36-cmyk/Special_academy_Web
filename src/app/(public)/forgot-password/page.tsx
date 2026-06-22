"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const resetTokenRef = useRef<string>("");

  function startCooldown(seconds = 60) {
    setCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to send code");
        return;
      }

      setStep("code");
      startCooldown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid code");
        return;
      }

      resetTokenRef.current = data.resetToken;
      setStep("password");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resetToken: resetTokenRef.current,
          password,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to resend code");
        return;
      }

      startCooldown();
      setCode("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stepIndicator = (s: Step, icon: React.ReactNode, label: string) => {
    const active = step === s;
    const done = ["code", "password", "success"].includes(step) && s === "email" ||
      ["password", "success"].includes(step) && s === "code" ||
      step === "success" && s === "password";

    return (
      <div className={`flex items-center gap-2 ${done ? "text-emerald-600" : active ? "text-primary" : "text-gray-300"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
          ${done ? "bg-emerald-100 text-emerald-600" :
            active ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-300"}`}>
          {done ? <CheckCircle2 className="w-4 h-4" /> : icon}
        </div>
        <span className="text-sm font-medium hidden sm:inline">{label}</span>
      </div>
    );
  };

  return (
    <PageWrapper>
      <section className="py-20 md:py-28 bg-accent min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto px-4 w-full">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {stepIndicator("email", <Mail className="w-4 h-4" />, "Email")}
            <div className="w-8 h-px bg-gray-200" />
            {stepIndicator("code", <ShieldCheck className="w-4 h-4" />, "Verify")}
            <div className="w-8 h-px bg-gray-200" />
            {stepIndicator("password", <KeyRound className="w-4 h-4" />, "Reset")}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 border border-primary/5 shadow-card"
          >
            {step === "success" ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-primary mb-2">Password Reset!</h1>
                <p className="text-sm text-muted mb-6">
                  Your password has been updated successfully. You can now log in with your new password.
                </p>
                <Button asChild>
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            ) : step === "password" ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-primary">New Password</h1>
                  <p className="text-sm text-muted mt-1">Enter your new password for <strong>{email}</strong></p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
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
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </>
            ) : step === "code" ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-primary">Check Your Email</h1>
                  <p className="text-sm text-muted mt-1">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Verification Code</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                      required
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading || code.length !== 6}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                    className="text-sm text-secondary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setError(""); }}
                    className="text-sm text-muted hover:text-primary inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Use a different email
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-primary">Forgot Password</h1>
                  <p className="text-sm text-muted mt-1">
                    Enter your email and we&apos;ll send a verification code
                  </p>
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}
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
                  <Button type="submit" className="w-full" size="lg" disabled={loading || !email}>
                    {loading ? "Sending..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-sm text-secondary hover:underline inline-flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
