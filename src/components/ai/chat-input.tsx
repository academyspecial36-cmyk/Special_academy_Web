import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  error: string | null;
  onSend: () => void;
  onDismissError: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({ input, setInput, isStreaming, error, onSend, onDismissError, textareaRef }: ChatInputProps) {
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [textareaRef]);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-primary/5 p-4 shrink-0">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 mb-3 rounded-lg bg-red-50 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={onDismissError} className="ml-auto text-red-400 hover:text-red-600 text-xs font-medium">
            Dismiss
          </button>
        </motion.div>
      )}
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your command..."
            rows={1}
            disabled={isStreaming}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 pr-12 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:opacity-50 transition-all min-h-[44px] max-h-[160px]"
            )}
          />
        </div>
        <Button
          onClick={onSend}
          disabled={!input.trim() || isStreaming}
          size="icon"
          className="shrink-0 h-[44px] w-[44px] rounded-xl"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
