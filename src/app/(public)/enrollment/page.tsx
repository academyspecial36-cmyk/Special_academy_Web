"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  User as UserIcon,
  Lock,
  Mail,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  PenLine,
  BookOpen,
  KeyRound,
  BadgeCheck,
  Sparkles,
  FileText,
  Users,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiList } from "@/lib/api-client";
import { QUALIFICATIONS } from "@/constants";
import { HowToEnrollButton } from "@/components/landing/how-to-enroll-guide";

interface QualificationOption {
  id: string;
  name: string;
}

const steps = [
  {
    label: "Personal Info",
    fields: ["fullName", "email", "phone", "qualificationId"],
  },
  {
    label: "Course & Guardian",
    fields: ["interestedCourse", "guardianName", "guardianContact", "address"],
  },
  { label: "Create Account", fields: ["password", "confirmPassword"] },
  { label: "Verify", fields: [] },
  { label: "Review", fields: [] },
];

export default function EnrollmentPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [qualificationOptions, setQualificationOptions] = useState<
    QualificationOption[]
  >([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    qualificationId: "",
    password: "",
    confirmPassword: "",
    interestedCourse: "",
    guardianName: "",
    guardianContact: "",
    address: "",
    message: "",
  });

  useEffect(() => {
    apiList("courses")
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setCourses(data.map((c: { title: string }) => c.title));
        }
      })
      .catch(() => {});
    apiList("qualifications")
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setQualificationOptions(data as QualificationOption[]);
        }
      })
      .catch(() => {
        setQualificationOptions(
          QUALIFICATIONS.map((name) => ({ id: name, name })),
        );
      });
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleCreateAccount() {
    setCreating(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
        setCreating(false);
        return;
      }

      setAccountCreated(true);
      setCodeSent(true);
      setStep(3);
      toast.success("Verification code sent to your email!");
    } catch {
      toast.error("Network error. Please try again.");
      setCreating(false);
    }
  }

  const handleNext = async () => {
    if (step === 0) {
      if (!formData.fullName) {
        toast.error("Please enter your full name");
        return;
      }
      if (!formData.email) {
        toast.error("Please enter your email");
        return;
      }
      if (!formData.qualificationId) {
        toast.error("Please select your current qualification");
        return;
      }
    }
    if (step === 2) {
      if (accountCreated) {
        setStep(3);
        return;
      }
      if (!formData.password) {
        toast.error("Please enter a password");
        return;
      }
      if (!passwordsMatch) {
        toast.error("Passwords do not match");
        return;
      }
      await handleCreateAccount();
      return;
    }
    if (step === 3) {
      toast.error("Please verify your email first");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleVerify = async () => {
    if (verificationCode.length < 6) {
      toast.error("Please enter the full verification code");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/verify-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        setVerifying(false);
        return;
      }

      setVerified(true);
      toast.success("Email verified successfully!");
    } catch {
      toast.error("Network error. Please try again.");
      setVerifying(false);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  if (submitted) {
    return (
      <PageWrapper>
        <section className="bg-primary py-16 md:py-24 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Enrollment
              </h1>
              <p className="text-lg text-white/70">
                Apply for admission to Cadet Academy.
              </p>
            </div>
          </div>
        </section>
        <section className="py-20 md:py-32 bg-accent">
          <div className="max-w-lg mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              Application Submitted!
            </h2>
            <p className="text-muted mb-8">
              Your email has been verified. Our admissions team will review your
              application and contact you within 2-3 business days.
            </p>
            <Button asChild>
              <Link href="/login">Sign In to Your Account</Link>
            </Button>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Join Cadet Academy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70"
            >
              Follow these 5 easy steps to apply. It only takes a few minutes!
            </motion.p>
          </div>
        </div>
      </section>
      {/* Enrollment Form */}
      <section className="py-12 md:py-20 bg-accent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stepper + How to Apply Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-white my-2"
          >
            <HowToEnrollButton />
          </motion.div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-between gap-1 sm:gap-0 flex-1">
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center flex-1 last:flex-none min-w-0"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                          i <= step
                            ? "bg-primary text-white"
                            : "bg-white text-muted border border-primary/10"
                        }`}
                      >
                        {i < step ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`hidden sm:block text-xs mt-2 font-medium text-center leading-tight ${
                          i <= step ? "text-primary" : "text-muted"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-1 sm:mx-4 ${
                          i < step ? "bg-primary" : "bg-primary/10"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 md:p-10 border border-primary/5 shadow-card"
          >
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <PenLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Your Personal Details
                    </h3>
                    <p className="text-sm text-muted">
                      Tell us about yourself.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Full Name *
                  </label>
                  <Input
                    placeholder="Type your full name here"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Email address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    We will send a verification code here.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+977 98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Qualification *
                  </label>
                  <Select
                    value={formData.qualificationId}
                    onChange={(e) =>
                      updateField("qualificationId", e.target.value)
                    }
                  >
                    <option value="">Choose your current qualification</option>
                    {qualificationOptions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Course & Parent Details
                    </h3>
                    <p className="text-sm text-muted">
                      Pick a course and add your parent&apos;s info.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Which course do you want to join? *
                  </label>
                  <Select
                    value={formData.interestedCourse}
                    onChange={(e) =>
                      updateField("interestedCourse", e.target.value)
                    }
                  >
                    <option value="">Choose a course</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Parent or guardian&apos;s name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      placeholder="Parent or guardian's full name"
                      value={formData.guardianName}
                      onChange={(e) =>
                        updateField("guardianName", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                   Parent&apos;s phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      placeholder="Parent's phone number"
                      value={formData.guardianContact}
                      onChange={(e) =>
                        updateField("guardianContact", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Where do you live? (Full address)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                    <Textarea
                      placeholder="Type your full address here"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Anything else you want to tell us?
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted" />
                    <Textarea
                      placeholder="Write any extra information here..."
                      rows={3}
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Create Your Password
                    </h3>
                    <p className="text-sm text-muted">
                      Make a password to keep your account safe. Remember it!
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Create a password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Type your password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Type the password again *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Type your password one more time"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">
                      Oops! The two passwords do not match. Please type them
                      again.
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Verify Your Email
                    </h3>
                    <p className="text-sm text-muted">
                      Check your email for the secret code.
                    </p>
                  </div>
                </div>
                {codeSent && (
                  <p className="text-sm text-muted bg-blue-50 p-3 rounded-lg">
                    📩 We sent a <strong>6-digit code</strong> to{" "}
                    <strong>{formData.email}</strong>. Open your email, copy the
                    code, and paste it below.
                  </p>
                )}
                {!codeSent && (
                  <p className="text-sm text-muted">
                    ⏳ Preparing to send verification code...
                  </p>
                )}
                <div className="max-w-xs mx-auto pt-4">
                  <label className="text-xs text-muted mb-2 block text-center">
                    Enter the 6-digit code from your email
                  </label>
                  <Input
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    className="text-center text-2xl tracking-[8px] font-mono h-14"
                    maxLength={6}
                  />
                </div>
                {verified && (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      ✅ Verified! Your email is confirmed.
                    </span>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Review Before You Submit
                    </h3>
                    <p className="text-sm text-muted">
                      Check everything carefully. Then click Submit!
                    </p>
                  </div>
                </div>
                {!verified && (
                  <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700 mb-4">
                    ⚠️ Please verify your email before submitting.
                  </div>
                )}
                <div className="space-y-3">
                  {Object.entries(formData).map(([key, value]) => {
                    if (
                      !value ||
                      key === "confirmPassword" ||
                      key === "password"
                    )
                      return null;
                    const labels: Record<string, string> = {
                      fullName: "Full Name",
                      email: "Email",
                      phone: "Phone",
                      qualificationId: "Current Class",
                      interestedCourse: "Course",
                      guardianName: "Parent/Guardian Name",
                      guardianContact: "Parent/Guardian Phone",
                      address: "Address",
                      message: "Additional Message",
                    };
                    const displayValue =
                      key === "qualificationId"
                        ? (qualificationOptions.find((q) => q.id === value)
                            ?.name ?? value)
                        : value;
                    return (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-primary/5"
                      >
                        <span className="text-sm text-muted">
                          {labels[key] || key}
                        </span>
                        <span className="text-sm font-medium text-primary text-right max-w-[60%]">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {verified && (
                  <div className="flex items-center gap-2 text-emerald-600 pt-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      ✅ Email verified
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary/5">
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 3 && verified) {
                    setStep((s) => s - 1);
                  } else {
                    setStep((s) => Math.max(0, s - 1));
                  }
                }}
                disabled={step === 0 || (step === 3 && creating)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step === 0 && (
                <Button onClick={() => setStep(1)}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {step === 1 && (
                <Button onClick={() => setStep(2)}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {step === 2 && (
                <Button
                  onClick={handleNext}
                  disabled={creating || !passwordsMatch || !formData.password}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {step === 3 && !verified && (
                <Button
                  onClick={handleVerify}
                  disabled={verifying || verificationCode.length < 6}
                >
                  {verifying ? "Verifying..." : "Verify Email"}
                </Button>
              )}

              {step === 3 && verified && (
                <Button onClick={() => setStep(4)}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {step === 4 && (
                <Button onClick={handleSubmit} disabled={!verified}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
