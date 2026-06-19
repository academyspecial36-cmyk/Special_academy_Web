"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine,
  BookOpen,
  KeyRound,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Check,
  ChevronRight,
  User,
  GraduationCap,
  ShieldCheck,
  MailCheck,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "../ui/modal";

const guideSteps = [
  {
    icon: User,
    title: "Step 1: Fill Your Personal Details",
    shortTitle: "Your Details",
    desc: "Provide your basic information so we can identify you and keep you updated throughout the admission process.",
    whatToDo: [
      "Enter your full legal name exactly as it appears on your government-issued ID or academic certificates.",
      "Provide a valid and active email address. All important updates, including your verification code and admission decision, will be sent here.",
      "Add your mobile phone number with the correct country code (for example: +977 98XXXXXXXX for Nepal, +91 9XXXXXXXXX for India).",
      "Select your highest completed qualification or current academic level from the dropdown menu.",
    ],
    whyItMatters: "Accurate personal details ensure smooth communication between you and our admissions team. Any errors in your name or contact information may cause delays in processing your application.",
    tip: "Use a personal email address that you check daily. Avoid using temporary or shared email accounts, as you will need ongoing access to receive course materials and notifications.",
  },
  {
    icon: GraduationCap,
    title: "Step 2: Select Your Course & Provide Contact Preferences",
    shortTitle: "Course & Contact",
    desc: "Choose the program you wish to enroll in and provide an emergency contact for official correspondence.",
    whatToDo: [
      "Review the list of available courses and select the one that aligns with your academic goals and career interests.",
      "Provide the name of a trusted contact person — this can be a parent, guardian, spouse, or close relative.",
      "Enter their phone number. This will be used only for urgent matters related to your enrollment.",
      "Enter your complete residential address including street name, city, and postal code for any physical correspondence.",
      "Use the optional message field to mention any special requirements, prior experience, or questions you may have.",
    ],
    whyItMatters: "Selecting the correct course ensures you are placed in the right academic track. An emergency contact helps us reach someone close to you in case we cannot contact you directly regarding time-sensitive admission matters.",
    tip: "If you are uncertain about which course suits you best, read the course descriptions on our website or contact our counseling team before submitting. Changing courses after admission may require additional paperwork.",
  },
  {
    icon: ShieldCheck,
    title: "Step 3: Create a Secure Password",
    shortTitle: "Create Password",
    desc: "Set up a strong password to protect your account and all your personal data.",
    whatToDo: [
      "Create a password that is at least 8 characters long.",
      "Combine uppercase letters, lowercase letters, numbers, and special characters for maximum security. Example: SpecialAcademy2024! or MySecurePass#9.",
      "Avoid using easily guessable information such as your name, birthdate, phone number, or common words like 'password' or '123456'.",
      "Type the same password again in the confirmation field to ensure there are no typing errors.",
      "Click the eye icon next to the password field if you want to temporarily reveal the characters you are typing.",
    ],
    whyItMatters: "Your password is the only barrier protecting your personal information, academic records, and payment details. A weak password puts your entire account at risk of unauthorized access.",
    tip: "Consider using a password manager app to generate and store complex passwords securely. If you prefer to write it down, keep it in a private, locked location — never share your password with anyone, including academy staff.",
  },
  {
    icon: MailCheck,
    title: "Step 4: Verify Your Email Address",
    shortTitle: "Verify Email",
    desc: "Confirm ownership of your email address by entering the verification code we send you.",
    whatToDo: [
      "After completing Step 3, our system will automatically send a 6-digit verification code to the email address you provided.",
      "Open your email inbox in a new browser tab or on your mobile device.",
      "Look for an email from Special Academy with the subject line: 'Your Email Verification Code'.",
      "If you do not see the email within 2 minutes, check your Spam, Junk, or Promotions folder. Email filters sometimes misclassify automated messages.",
      "Copy the 6-digit code exactly as shown and paste it into the verification input field on this page.",
      "Click the 'Verify Email' button. A green confirmation message will appear if the code is correct.",
    ],
    whyItMatters: "Email verification is a security measure that confirms the email address belongs to you. It prevents unauthorized individuals from creating accounts using someone else's email and ensures all official communications reach the right person.",
    tip: "The verification code expires after 15 minutes for security reasons. If your code expires, refresh the page or click 'Resend Code' to receive a new one. Make sure your email inbox is not full, as this can block incoming messages.",
  },
  {
    icon: FileCheck,
    title: "Step 5: Review Your Application & Submit",
    shortTitle: "Review & Submit",
    desc: "Carefully review all the information you have entered before finalizing your application.",
    whatToDo: [
      "Read through every field carefully. Verify that your name, email, phone number, and course selection are accurate.",
      "Double-check your emergency contact's name and phone number for any spelling or digit errors.",
      "Confirm your address is complete and correctly formatted for postal delivery if needed.",
      "Ensure the green 'Email Verified' badge is visible. If it is missing, return to Step 4 before proceeding.",
      "When you are confident everything is correct, click the 'Submit Application' button to complete the process.",
    ],
    whyItMatters: "Submitting accurate information reduces processing time and prevents administrative delays. Errors discovered after submission may require you to contact support and resubmit documents, which can postpone your enrollment.",
    tip: "After successful submission, you will receive a confirmation email with your application reference number. Save this email. You can log into your account at any time using your email and password to track your application status or update your details.",
  },
];

export function HowToEnrollButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <HelpCircle className="w-4 h-4" />
        How to Apply Guide
      </Button>

      <HowToEnrollGuide open={open} onClose={() => setOpen(false)} />
    </>
  );
}

interface HowToEnrollGuideProps {
  open: boolean;
  onClose: () => void;
}

export function HowToEnrollGuide({ open, onClose }: HowToEnrollGuideProps) {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = guideSteps[activeStep];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (activeStep < guideSteps.length - 1) setActiveStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  return (
    <Modal open={open} onClose={onClose} title="How to Apply — Step by Step Guide" maxWidth="max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary/60">
            Step {activeStep + 1} of {guideSteps.length}
          </span>
          <span className="text-xs font-medium text-primary">
            {Math.round(((activeStep + 1) / guideSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((activeStep + 1) / guideSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Navigation Dots */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {guideSteps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`h-2 rounded-full transition-all ${
              i === activeStep
                ? "bg-primary w-6 sm:w-8"
                : i < activeStep
                ? "bg-primary/50 w-2"
                : "bg-primary/15 w-2"
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Active Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step Header */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-primary/50 uppercase tracking-wide">
                Step {activeStep + 1}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-primary leading-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-primary/60 mt-1">{currentStep.desc}</p>
            </div>
          </div>

          {/* What To Do */}
          <div className="bg-primary/[0.03] rounded-xl p-4 sm:p-5 mb-3 sm:mb-4">
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary/40 shrink-0" />
              What you need to do:
            </h4>
            <ol className="space-y-2.5 sm:space-y-3">
              {currentStep.whatToDo.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                  <span className="w-5 h-5 rounded-full bg-white border border-primary/15 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-primary/70 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-primary/80 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Why It Matters */}
          <div className="bg-primary/[0.03] rounded-xl p-4 sm:p-5 mb-3 sm:mb-4">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary/40 shrink-0" />
              Why this step is important:
            </h4>
            <p className="text-xs sm:text-sm text-primary/70 leading-relaxed">
              {currentStep.whyItMatters}
            </p>
          </div>

          {/* Tip */}
          <div className="border border-primary/10 bg-primary/[0.02] rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              <span className="text-sm sm:text-base shrink-0">💡</span>
              Helpful Tip:
            </h4>
            <p className="text-xs sm:text-sm text-primary/70 leading-relaxed">
              {currentStep.tip}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step List (Quick Jump) */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary/10">
        <p className="text-[10px] sm:text-xs font-medium text-primary/40 uppercase tracking-wide mb-2 sm:mb-3">
          Jump to any step:
        </p>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {guideSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-lg transition-all text-center ${
                  i === activeStep
                    ? "bg-primary text-white shadow-sm"
                    : i < activeStep
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-white border border-primary/10 text-primary/40 hover:bg-primary/[0.02]"
                }`}
              >
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md flex items-center justify-center">
                  {i < activeStep ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium leading-tight hidden sm:block">
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-4 border-t border-primary/10">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={activeStep === 0}
          className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
          size="sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Previous
        </Button>

        {activeStep === guideSteps.length - 1 ? (
          <Button onClick={onClose} className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10" size="sm">
            I Understand
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10" size="sm">
            Next Step
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        )}
      </div>
    </Modal>
  );
}