import { Sparkles, Megaphone, Users, ClipboardCheck, FileQuestion } from "lucide-react";

interface ChatEmptyStateProps {
  sendMessage: (text: string) => void;
}

const STARTERS: { label: string; icon: React.ElementType }[] = [
  { label: "Create a holiday notice", icon: Megaphone },
  { label: "Show active students", icon: Users },
  { label: "Generate MCQs", icon: FileQuestion },
  { label: "Approve pending enrollments", icon: ClipboardCheck },
];

export function ChatEmptyState({ sendMessage }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto px-4">
      <Sparkles className="w-10 h-10 text-muted mb-4" />
      <h2 className="text-lg font-semibold text-primary mb-1">How can I help you today?</h2>
      <p className="text-sm text-muted mb-6">
        Try a suggestion below, or type your own command.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {STARTERS.map((starter) => {
          const Icon = starter.icon;
          return (
            <button
              key={starter.label}
              onClick={() => sendMessage(starter.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {starter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
