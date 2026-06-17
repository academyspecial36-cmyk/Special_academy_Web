import { Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onExport?: () => void;
  hasConversation?: boolean;
}

export function ChatHeader({ onExport, hasConversation }: ChatHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-primary/5 shrink-0">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-primary">AI Command Center</h1>
          <p className="text-xs text-muted">Ask me anything about managing your academy</p>
        </div>
        {hasConversation && onExport && (
          <Button variant="ghost" size="sm" onClick={onExport} title="Export conversation">
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
