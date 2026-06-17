import { Sparkles } from "lucide-react";

export function ChatHeader() {
  return (
    <div className="px-6 py-4 border-b border-primary/5 shrink-0">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold text-primary">AI Command Center</h1>
          <p className="text-xs text-muted">Ask me anything about managing your academy</p>
        </div>
      </div>
    </div>
  );
}
