"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, Keyboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

const COMMANDS = [
  "Create a holiday notice",
  "Show inactive students",
  "Generate MCQs for exam",
  "Approve pending enrollments",
  "Publish blog post",
  "Enable maintenance mode",
  "Create backup",
];

const SHORTCUTS = [
  { keys: ["Enter"], description: "Run command" },
  { keys: ["Esc"], description: "Close" },
  { keys: ["↑", "↓"], description: "Navigate" },
];

export function CommandPalette({ open, onClose, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMANDS.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        onCommand(filtered[selectedIndex]);
        onClose();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex, onCommand, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg"
            >
              <Card className="border shadow-elevated overflow-hidden">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input
                    ref={inputRef}
                    placeholder="Search or type a command..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 rounded-none h-12 pl-10 pr-4 text-sm focus-visible:ring-0 focus-visible:border-0 shadow-none"
                  />
                </div>
                <CardContent className="p-2 pt-0 space-y-0.5 max-h-64 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted text-center py-6">No commands found</p>
                  ) : (
                    filtered.map((command, index) => (
                      <button
                        key={command}
                        onClick={() => {
                          onCommand(command);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                          index === selectedIndex
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <Command className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{command}</span>
                      </button>
                    ))
                  )}
                </CardContent>
                <div className="flex items-center gap-4 px-4 py-3 border-t border-primary/5 bg-accent/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Shortcuts:</span>
                  </div>
                  {SHORTCUTS.map((shortcut) => (
                    <div key={shortcut.description} className="flex items-center gap-1.5">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="px-1.5 py-0.5 text-[10px] font-medium bg-white border rounded shadow-sm text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                      <span className="text-xs text-muted-foreground">{shortcut.description}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
