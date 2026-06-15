"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 md:p-12 text-center space-y-6">
        <div className="text-6xl font-bold text-primary/20">404</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary">Page Not Found</h1>
          <p className="text-muted text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-primary/10 text-primary text-sm font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
