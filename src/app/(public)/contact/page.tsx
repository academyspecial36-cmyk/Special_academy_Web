"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
} from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/app-context";
import { SocialLinks } from "@/components/shared/social-links";

export default function ContactPage() {
  const { settings } = useAppContext();

  return (
    <PageWrapper>
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-white/70">
              We are here to help. Reach out for admissions, inquiries, or campus visits.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold text-primary mb-6">Get in Touch</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">Address</h4>
                      <p className="text-sm text-muted">{settings.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">Phone</h4>
                      <p className="text-sm text-muted">{settings.phone}</p>
                      {settings.secondaryPhone && (
                        <p className="text-sm text-muted">{settings.secondaryPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">Email</h4>
                      <p className="text-sm text-muted">{settings.email}</p>
                      <p className="text-sm text-muted">{settings.admissionEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">Office Hours</h4>
                      <p className="text-sm text-muted">{settings.officeHours}</p>
                      <p className="text-sm text-muted">{settings.holiday}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-3">Follow Us</h4>
                <SocialLinks
                  links={settings.socialLinks}
                  baseColor="bg-white border border-primary/5 text-primary"
                  hoverColor="hover:bg-primary hover:text-white"
                  size="lg"
                />
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl p-6 md:p-10 border border-primary/5 shadow-card">
                <h3 className="text-xl font-bold text-primary mb-2">Send a Message</h3>
                <p className="text-sm text-muted mb-8">
                  Fill out the form below and we will get back to you within 24 hours.
                </p>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Full Name *</label>
                      <Input placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Email *</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Phone *</label>
                      <Input placeholder="98XXXXXXXX" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Subject</label>
                      <Input placeholder="How can we help?" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Message *</label>
                    <Textarea placeholder="Tell us about your inquiry..." rows={6} />
                  </div>
                  <Button className="w-full" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden h-[400px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary/20 mx-auto mb-3" />
                <p className="text-muted text-sm">Map integration placeholder</p>
                <p className="text-xs text-muted/60 mt-1">{settings.address}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
