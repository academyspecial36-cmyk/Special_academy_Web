"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function handleOnline() { setOffline(false); }
    function handleOffline() { setOffline(true); }

    setOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 md:p-12 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-orange-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary">No Internet Connection</h1>
          <p className="text-muted text-sm leading-relaxed">
            You appear to be offline. Please check your internet connection and try again.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
