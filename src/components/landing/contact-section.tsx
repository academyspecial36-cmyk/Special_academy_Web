"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Youtube,
  Instagram,
  Send,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Get in Touch"
          title="Contact Special academy"
          description="Have questions? We would love to hear from you. Reach out to us for admission inquiries, course details, or campus visits."
        />

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Address</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    M8RP+363 New baneshwor, Devkota Sadak<br />
                    Kathmandu 44600
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Phone</h4>
                  <p className="text-sm text-muted">986-0302036</p>
                  <p className="text-sm text-muted">986-0302036</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Email</h4>
                  <p className="text-sm text-muted">info@cadetacademy.edu</p>
                  <p className="text-sm text-muted">admission@cadetacademy.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Office Hours</h4>
                  <p className="text-sm text-muted">Sat - Thu: 7:00 AM - 5:00 PM</p>
                  <p className="text-sm text-muted">Friday: Closed</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-primary mb-3">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
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
            <div className="bg-accent rounded-xl p-6 md:p-8 border border-primary/5">
              <h3 className="text-lg font-semibold text-primary mb-6">
                Send us a Message
              </h3>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">
                      Full Name
                    </label>
                    <Input placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">
                      Email
                    </label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">
                      Phone
                    </label>
                    <Input placeholder="98XXXXXXXX" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">
                      Subject
                    </label>
                    <Input placeholder="How can we help?" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us about your inquiry..."
                    rows={5}
                  />
                </div>
                <Button className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
