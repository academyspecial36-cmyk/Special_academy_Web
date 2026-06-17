"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (val: string) => void;
}

export function FilterBar({
  search, onSearchChange, placeholder = "Search...",
  filters, activeFilter, onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {filters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <Badge
              key={f.value}
              variant={activeFilter === f.value ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => onFilterChange?.(f.value)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
