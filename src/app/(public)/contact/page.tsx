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
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-primary transition-colors"
                      >
                        {settings.address}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">Phone</h4>
                      <a href={`tel:${settings.phone}`} className="text-sm text-muted hover:text-primary transition-colors block">
                        {settings.phone}
                      </a>
                      {settings.secondaryPhone && (
                        <a href={`tel:${settings.secondaryPhone}`} className="text-sm text-muted hover:text-primary transition-colors block">
                          {settings.secondaryPhone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">Email</h4>
                      <a href={`mailto:${settings.email}`} className="text-sm text-muted hover:text-primary transition-colors block">
                        {settings.email}
                      </a>
                      <a href={`mailto:${settings.admissionEmail}`} className="text-sm text-muted hover:text-primary transition-colors block">
                        {settings.admissionEmail}
                      </a>
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

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14128.494958996613!2d85.3354403!3d27.6901084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb191051eb484d%3A0x5bb20af2abcd66f0!2sSPECIAL%20ACADEMY!5e0!3m2!1sen!2snp!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Special Academy Location"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
