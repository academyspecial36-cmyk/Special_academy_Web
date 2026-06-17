import { Sparkles } from "lucide-react";

interface ChatEmptyStateProps {
  sendMessage: (text: string) => void;
}

const STARTERS = ["Create a holiday notice", "Show active students", "Generate MCQs", "Approve pending enrollments"];

export function ChatEmptyState({ sendMessage }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
      <Sparkles className="w-10 h-10 text-muted mb-4" />
      <h2 className="text-lg font-semibold text-primary mb-1">How can I help you today?</h2>
      <p className="text-sm text-muted mb-6">
        Try a suggestion below, or type your own command. All quick actions are on the right panel.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {STARTERS.map((starter) => (
          <button
            key={starter}
            onClick={() => sendMessage(starter)}
            className="px-3 py-1.5 text-sm rounded-full border border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}
