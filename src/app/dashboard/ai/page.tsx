"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChatInterface } from "@/components/ai/chat-interface";
import { ConversationHistory } from "@/components/ai/conversation-history";
import { ContextPanel } from "@/components/ai/context-panel";
import { CommandPalette } from "@/components/ai/command-palette";
import { DeleteModal } from "@/components/ui/delete-modal";
import { apiList, apiDelete } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Menu, X, PanelRightOpen, PanelRightClose } from "lucide-react";
import type { AIConversation, PageContext } from "@/types/ai";

export default function AICommandCenterPage() {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const [mobileHistory, setMobileHistory] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const context: PageContext = {
    route: pathname,
    pageName: "AI Command Center",
  };

  useEffect(() => {
    apiList("ai_conversations").then((data) => {
      if (Array.isArray(data)) {
        setConversations(data as AIConversation[]);
      }
    }).catch((err) => {
      console.error("Failed to load conversations:", err);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNew = useCallback(() => {
    setActiveId(null);
    setMobileHistory(false);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setMobileHistory(false);
  }, []);

  const handleConversationChange = useCallback((id: string) => {
    setActiveId(id);
    apiList("ai_conversations").then((data) => {
      if (Array.isArray(data)) {
        setConversations(data as AIConversation[]);
      }
    }).catch((err) => console.error("Failed to refresh conversations:", err));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleting(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleting) return;
    const id = deleting;
    apiDelete("ai_conversations", id).then(() => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
      setDeleting(null);
    }).catch((err) => {
      console.error("Failed to delete conversation:", err);
      setDeleting(null);
    });
  }, [deleting, activeId]);

  const handleCommand = useCallback((command: string) => {
    setCmdOpen(false);
    setPendingCommand(command);
  }, []);

  const handleQuickCommand = useCallback((prompt: string) => {
    setPendingCommand(prompt);
  }, []);

  const handleCommandConsumed = useCallback(() => {
    setPendingCommand(null);
  }, []);

  return (
    <>
      <div className="h-[calc(100vh-4rem)] -m-4 lg:-m-8 flex overflow-hidden bg-white">
        {/* Desktop History Sidebar */}
        <div
          className={cn(
            "hidden lg:flex border-r border-primary/5 bg-white transition-all duration-200 shrink-0",
            showHistory ? "w-80" : "w-0 overflow-hidden"
          )}
        >
          <div className="w-80 shrink-0">
            <ConversationHistory
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              onNew={handleNew}
              onDelete={handleDelete}
              onClose={() => setShowHistory(false)}
            />
          </div>
        </div>

        {/* Mobile History Drawer */}
        {mobileHistory && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setMobileHistory(false)} />
            <div className="relative w-80 max-w-[80vw] bg-white shadow-elevated z-10">
              <ConversationHistory
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={handleDelete}
                onClose={() => setMobileHistory(false)}
                isMobile
              />
            </div>
          </div>
        )}

        {/* Main Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile top bar */}
          <div className="flex lg:hidden items-center gap-2 px-3 py-2 border-b border-primary/5 bg-white shrink-0">
            <button
              onClick={() => setMobileHistory(true)}
              className="p-1.5 rounded-lg hover:bg-accent text-muted hover:text-primary transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-primary truncate">
              {activeId ? "AI Command" : "New Chat"}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setShowActions((p) => !p)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted hover:text-primary transition-colors lg:hidden"
              >
                {showActions ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex">
            <div className="flex-1 min-w-0">
              <ChatInterface
                pathname={pathname}
                conversationId={activeId || undefined}
                onConversationChange={handleConversationChange}
                pendingCommand={pendingCommand}
                onCommandConsumed={handleCommandConsumed}
              />
            </div>

            {/* Quick Actions Panel - Desktop */}
            <div
              className={cn(
                "hidden lg:block border-l border-primary/5 bg-white transition-all duration-200 shrink-0",
                showActions ? "w-72" : "w-0 overflow-hidden"
              )}
            >
              <div className="w-72 shrink-0 h-full overflow-y-auto">
                <ContextPanel
                  pathname={pathname}
                  context={context}
                  onCommand={handleQuickCommand}
                />
              </div>
            </div>

            {/* Quick Actions Sheet - Mobile */}
            {showActions && (
              <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                <div className="fixed inset-0 bg-black/40" onClick={() => setShowActions(false)} />
                <div className="relative w-72 max-w-[80vw] bg-white shadow-elevated z-10 h-full overflow-y-auto">
                  <div className="flex items-center justify-between p-3 border-b border-primary/5">
                    <span className="text-sm font-semibold text-primary">Quick Actions</span>
                    <button
                      onClick={() => setShowActions(false)}
                      className="p-1 rounded-lg hover:bg-accent text-muted hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ContextPanel
                    pathname={pathname}
                    context={context}
                    onCommand={(p) => { handleQuickCommand(p); setShowActions(false); }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop toggle buttons */}
      <div className="hidden lg:flex fixed bottom-6 left-6 z-40 gap-2">
        <button
          onClick={() => setShowHistory((p) => !p)}
          className="w-9 h-9 rounded-lg bg-white border border-primary/10 shadow-sm flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-colors"
          title="Toggle history"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => setShowActions((p) => !p)}
          className="w-9 h-9 rounded-lg bg-white border border-primary/10 shadow-sm flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-colors"
          title="Toggle quick actions"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onCommand={handleCommand}
      />

      <DeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Conversation"
        message="Delete this conversation and all its messages?"
        onConfirm={confirmDelete}
      />
    </>
  );
}
