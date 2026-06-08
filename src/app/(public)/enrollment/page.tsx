"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft, Send, GraduationCap } from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CLASS_LEVELS } from "@/constants";

const steps = [
  { label: "Personal Info", fields: ["fullName", "email", "phone"] },
  { label: "Academic Info", fields: ["currentClass", "interestedCourse", "previousSchool"] },
  { label: "Guardian Info", fields: ["guardianName", "guardianContact", "address"] },
  { label: "Review", fields: [] },
];

const courses = [
  "Cadet Entrance Preparation",
  "Scholarship Preparation",
  "Foundation Classes",
  "Leadership Development",
  "Spoken English & Communication",
  "Physical Preparation Guidance",
];

export default function EnrollmentPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentClass: "",
    interestedCourse: "",
    guardianName: "",
    guardianContact: "",
    address: "",
    previousSchool: "",
    message: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageWrapper>
        <section className="bg-primary py-16 md:py-24 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Enrollment</h1>
              <p className="text-lg text-white/70">Apply for admission to Special academy.</p>
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
            <h2 className="text-2xl font-bold text-primary mb-3">Application Submitted!</h2>
            <p className="text-muted mb-8">
              Thank you for applying to Special academy. Our admissions team will review your application and contact you within 2-3 business days.
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Enrollment</h1>
            <p className="text-lg text-white/70">
              Apply for admission to Special academy. Fill out the form below to begin your journey.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        i <= step
                          ? "bg-primary text-white"
                          : "bg-white text-muted border border-primary/10"
                      }`}
                    >
                      {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${i <= step ? "text-primary" : "text-muted"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-2 md:mx-4 ${i < step ? "bg-primary" : "bg-primary/10"}`} />
                  )}
                </div>
              ))}
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
                <h3 className="text-lg font-semibold text-primary mb-2">Personal Information</h3>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Full Name *</label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Phone Number *</label>
                  <Input
                    placeholder="+880 1XXX-XXXXXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-primary mb-2">Academic Information</h3>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Current Class *</label>
                  <Select
                    value={formData.currentClass}
                    onChange={(e) => updateField("currentClass", e.target.value)}
                  >
                    <option value="">Select class</option>
                    {CLASS_LEVELS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Interested Course *</label>
                  <Select
                    value={formData.interestedCourse}
                    onChange={(e) => updateField("interestedCourse", e.target.value)}
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Previous School</label>
                  <Input
                    placeholder="Name of your previous/current school"
                    value={formData.previousSchool}
                    onChange={(e) => updateField("previousSchool", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-primary mb-2">Guardian Information</h3>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Guardian Name *</label>
                  <Input
                    placeholder="Guardian's full name"
                    value={formData.guardianName}
                    onChange={(e) => updateField("guardianName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Guardian Contact *</label>
                  <Input
                    placeholder="Guardian's phone number"
                    value={formData.guardianContact}
                    onChange={(e) => updateField("guardianContact", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Address *</label>
                  <Textarea
                    placeholder="Full residential address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Additional Message</label>
                  <Textarea
                    placeholder="Any additional information..."
                    rows={3}
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-primary mb-4">Review Your Application</h3>
                <div className="space-y-4">
                  {Object.entries(formData).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between py-2 border-b border-primary/5">
                        <span className="text-sm text-muted">{label}</span>
                        <span className="text-sm font-medium text-primary">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary/5">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
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
