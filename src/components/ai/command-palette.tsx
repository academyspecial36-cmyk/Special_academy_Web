"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Command, Keyboard, ArrowRight, LayoutDashboard, BarChart3, Users,
  FileText, MessageSquare, BookOpen, StickyNote, ClipboardCheck, Video,
  Bell, HelpCircle, Image as ImageIcon, HardDrive, Megaphone, Settings,
  Tags, Sparkles, GraduationCap, User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  section: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CommandItem) => void;
  items: CommandItem[];
}

const SHORTCUTS = [
  { keys: ["Enter"], description: "Run" },
  { keys: ["Esc"], description: "Close" },
  { keys: ["↑", "↓"], description: "Navigate" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, BarChart3, Users, FileText, MessageSquare, BookOpen,
  StickyNote, ClipboardCheck, Video, Bell, HelpCircle, ImageIcon, HardDrive,
  Megaphone, Settings, Tags, Sparkles, GraduationCap, User, Search, Command,
};

function CommandIcon({ icon }: { icon?: string }) {
  if (!icon) return <Command className="w-3.5 h-3.5 text-muted shrink-0" />;
  const Icon = ICON_MAP[icon];
  if (!Icon) return <Command className="w-3.5 h-3.5 text-muted shrink-0" />;
  return <Icon className="w-3.5 h-3.5 text-muted shrink-0" />;
}

export function CommandPalette({ open, onClose, onSelect, items }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.section.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, items]);

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
        onSelect(filtered[selectedIndex]);
        onClose();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex, onSelect, onClose]);

  const grouped = useMemo(() => {
    const groups: { section: string; items: CommandItem[] }[] = [];
    const seen = new Set<string>();
    for (const item of filtered) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      let group = groups.find((g) => g.section === item.section);
      if (!group) {
        group = { section: item.section, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [filtered]);

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
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
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
                    placeholder="Search pages or commands..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 rounded-none h-12 pl-10 pr-4 text-sm focus-visible:ring-0 focus-visible:border-0 shadow-none"
                  />
                </div>
                <CardContent className="p-2 pt-0 space-y-1 max-h-72 overflow-y-auto">
                  {grouped.length === 0 ? (
                    <p className="text-sm text-muted text-center py-6">No results found</p>
                  ) : (
                    grouped.map((group) => (
                      <div key={group.section}>
                        <div className="flex items-center gap-2 px-3 py-1.5 mt-1 first:mt-0">
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                            {group.section}
                          </span>
                          <div className="flex-1 h-px bg-primary/5" />
                        </div>
                        {group.items.map((item, index) => {
                          const globalIndex = filtered.indexOf(item);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                onSelect(item);
                                onClose();
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                globalIndex === selectedIndex
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground hover:bg-accent"
                              )}
                            >
                              <CommandIcon icon={item.icon} />
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.href && (
                                <ArrowRight className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </CardContent>
                <div className="flex items-center gap-4 px-4 py-3 border-t border-primary/5 bg-accent/50 overflow-x-auto">
                  <div className="flex items-center gap-1.5 text-xs text-muted shrink-0">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Shortcuts:</span>
                  </div>
                  {SHORTCUTS.map((shortcut) => (
                    <div key={shortcut.description} className="flex items-center gap-1.5 shrink-0">
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
