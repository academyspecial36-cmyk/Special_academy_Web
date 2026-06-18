"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/app-context";
import { SocialLinks } from "@/components/shared/social-links";
import { toast } from "sonner";

export function ContactSection() {
  const { settings } = useAppContext();
  const labels = settings.config.sectionLabels?.contact;
  const btns = (settings.config.buttonLabels || {}) as Record<string, string>;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in name, email, and message.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSent(true);

      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section className="bg-white py-16 md:py-24 lg:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg py-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-primary">Thank You!</h2>

            <p className="text-muted">
              Your message has been received. Our team will review it and get
              back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const contactItems = [
    {
      icon: MapPin,
      title: "Address",
      content: (
        <p className="break-words text-sm leading-relaxed text-muted">
          {settings.address}
        </p>
      ),
    },
    {
      icon: Phone,
      title: "Phone",
      content: (
        <>
          <p className="break-words text-sm text-muted">{settings.phone}</p>

          {settings.secondaryPhone && (
            <p className="break-words text-sm text-muted">
              {settings.secondaryPhone}
            </p>
          )}
        </>
      ),
    },
    {
      icon: Mail,
      title: "Email",
      content: (
        <>
          <p className="break-words text-sm text-muted">{settings.email}</p>

          {settings.admissionEmail && (
            <p className="break-words text-sm text-muted">
              {settings.admissionEmail}
            </p>
          )}
        </>
      ),
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: (
        <>
          <p className="break-words text-sm text-muted">
            {settings.officeHours}
          </p>

          <p className="break-words text-sm text-muted">{settings.holiday}</p>
        </>
      ),
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Get in Touch"}
          title={labels?.title || `Contact ${settings.academyName}`}
          description={labels?.description || ""}
        />

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8 lg:col-span-2"
          >
            {/* Mobile Card Layout */}
            <div className="grid gap-4 sm:gap-5">
              {contactItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-primary/5 bg-accent p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 font-semibold text-primary">
                      {item.title}
                    </h4>

                    {item.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="mb-3 font-semibold text-primary">Follow Us</h4>

              <div className="overflow-hidden">
                <SocialLinks
                  links={settings.socialLinks}
                  baseColor="bg-primary/5 text-primary"
                  hoverColor="hover:bg-primary hover:text-white"
                  size="lg"
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="rounded-xl border border-primary/5 bg-accent p-4 sm:p-6 md:p-8">
              <h3 className="mb-6 text-lg font-semibold text-primary">
                Send us a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      Full Name *
                    </label>

                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      Email *
                    </label>

                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      Phone
                    </label>

                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      Subject
                    </label>

                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    Message *
                  </label>

                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your inquiry..."
                    rows={5}
                    required
                    className="resize-none"
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}

                  {sending ? "Sending..." : btns.sendMessage || "Send Message"}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
