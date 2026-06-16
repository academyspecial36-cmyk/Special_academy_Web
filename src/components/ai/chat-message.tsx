"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    role: string;
    content: string | null;
    tool_name?: string;
  };
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-white rounded-br-md"
            : "bg-accent text-foreground rounded-bl-md"
        )}
      >
        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
        {isLoading && (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs text-muted">Generating...</span>
          </span>
        )}
        {message.tool_name && (
          <div className="mt-2">
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Used: {message.tool_name}
            </Badge>
          </div>
        )}
      </div>
    </motion.div>
  );
}
