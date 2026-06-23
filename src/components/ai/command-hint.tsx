"use client";

import { Keyboard } from "lucide-react";

export function CommandHint() {
  return (
    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[11px] text-muted">
      <Keyboard className="w-3 h-3" />
      <span>
        Type <kbd className="px-1 py-0.5 text-[10px] font-semibold bg-white border rounded shadow-sm text-foreground">/</kbd> to open command palette for fast navigation or search
      </span>
    </div>
  );
}
