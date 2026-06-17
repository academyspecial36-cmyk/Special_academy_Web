"use client";

import { useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { MessageSquare, Plus, Search, X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AIConversation } from "@/types/ai";

interface ConversationHistoryProps {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && date.getDate() === now.getDate()) return "Today";
  if (diff < 2 * dayMs && (date.getDate() === now.getDate() - 1 || (now.getDate() === 1 && date.getDate() === new Date(now.getFullYear(), now.getMonth(), 0).getDate()))) return "Yesterday";
  if (diff < 7 * dayMs) {
    const days = Math.floor(diff / dayMs);
    return `${days} days ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupConversations(conversations: AIConversation[]): { label: string; items: AIConversation[] }[] {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  const groups: Record<string, AIConversation[]> = { Today: [], Yesterday: [], Older: [] };

  for (const conv of conversations) {
    const created = new Date(conv.createdAt).toDateString();
    if (created === today) groups["Today"].push(conv);
    else if (created === yesterday) groups["Yesterday"].push(conv);
    else groups["Older"].push(conv);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export function ConversationHistory({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  isMobile,
}: ConversationHistoryProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, search]);

  const groups = useMemo(() => groupConversations(filtered), [filtered]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-primary/5">
      <div className="p-4 border-b border-primary/5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primary">History</h2>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          onClick={onNew}
          variant="default"
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <LayoutGroup>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="w-8 h-8 text-muted mb-2" />
              <p className="text-sm text-muted">
                {search ? "No conversations found" : "No conversations yet"}
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="px-3 pt-3 first:pt-3">
                <p className="text-xs font-medium text-muted px-2 pb-1.5 uppercase tracking-wider">
                  {group.label}
                </p>
                <LayoutGroup>
                  {group.items.map((conv) => (
                    <div
                      key={conv.id}
                      className="group relative"
                    >
                      <motion.button
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onSelect(conv.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5",
                          activeId === conv.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        <span className="block truncate pr-6">{conv.title}</span>
                        <span className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          {formatRelativeDate(conv.createdAt)}
                        </span>
                      </motion.button>
                      {onDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 hover:bg-red-50"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </LayoutGroup>
              </div>
            ))
          )}
        </LayoutGroup>
      </div>
    </div>
  );
}
