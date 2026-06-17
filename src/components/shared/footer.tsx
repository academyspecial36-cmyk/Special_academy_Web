"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { NAV_ITEMS } from "@/constants";
import { useAppContext } from "@/lib/app-context";
import { SocialLinks } from "./social-links";

export function Footer() {
  const { settings } = useAppContext();
  return (
    <footer className="bg-primary text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 relative">
                <Image src={settings.appIcon || "/icon-image.png"} alt={settings.academyName} width={36} height={36} className="object-contain bg-transparent" />
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-tight block">
                  {settings.academyName}
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-6">
              {settings.description}
            </p>
            <SocialLinks
              links={settings.socialLinks}
              baseColor="bg-white/10 text-white/80"
              hoverColor="hover:bg-secondary hover:text-white"
            />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/enrollment" className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  Enrollment
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  User Guide
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-white font-semibold mb-5">Programs</h4>
            <ul className="space-y-3">
              {[
                "Cadet Entrance Preparation",
                "Scholarship Preparation",
                "Foundation Classes",
                "Leadership Development",
                "Spoken English",
                "Physical Training",
              ].map((program) => (
                <li key={program}>
                  <Link
                    href="/courses"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {program}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary shrink-0" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {settings.address}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <a href={`tel:${settings.phone}`} className="text-sm text-white/60 hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-sm text-white/60 hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-secondary shrink-0" />
                <span className="text-sm text-white/60">
                  {settings.officeHours}<br />
                  {settings.holiday}
                </span>
              </li>
            </ul>

            {/* Mini Map */}
            <div className="mt-5 rounded-lg overflow-hidden border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14128.494958996613!2d85.3354403!3d27.6901084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb191051eb484d%3A0x5bb20af2abcd66f0!2sSPECIAL%20ACADEMY!5e0!3m2!1sen!2snp!4v1"
                width="100%"
                height="140"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Academy Location"
                className="block"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2026 {settings.academyName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
