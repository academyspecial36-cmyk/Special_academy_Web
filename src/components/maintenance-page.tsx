"use client";

import { useAppContext } from "@/lib/app-context";
import { Wrench, Mail, Phone, MapPin, Clock } from "lucide-react";

export function MaintenancePage() {
  const { settings } = useAppContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-elevated p-8 md:p-12 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Wrench className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Under Maintenance
          </h1>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            We are currently performing scheduled maintenance to improve your experience.
            Please check back soon.
          </p>
        </div>

        <div className="border-t border-primary/5 pt-6 space-y-3">
          <h2 className="font-semibold text-primary text-sm uppercase tracking-wider">
            Contact Us
          </h2>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-secondary shrink-0" />
              <span>{settings.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-secondary shrink-0" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-secondary shrink-0" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-secondary shrink-0" />
              <span>{settings.officeHours}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted">
          {settings.academyName} &mdash; {settings.tagline}
        </div>
      </div>
    </div>
  );
}
