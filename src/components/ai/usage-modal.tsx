"use client";

import { useEffect, useState } from "react";
import { X, MessageSquare, Activity, Zap } from "lucide-react";

interface UsageData {
  totalConversations: number;
  totalMessages: number;
  totalActions: number;
  todayMessages: number;
}

export function UsageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/ai/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-elevated w-full max-w-sm mx-4 p-5 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-primary">Chat Usage</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : usage ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Total Conversations</p>
                <p className="text-lg font-semibold">{usage.totalConversations}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted">Messages Today</p>
                <p className="text-lg font-semibold">{usage.todayMessages}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted">Total AI Actions</p>
                <p className="text-lg font-semibold">{usage.totalActions}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">Failed to load usage data</p>
        )}
      </div>
    </div>
  );
}
