"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "./empty-state";
import type { LucideIcon } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: { label: string; href: string };
  };
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({ title, columns, data, emptyState, keyExtractor }: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/5 bg-accent/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left text-xs font-medium text-muted py-3 px-6 ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <motion.tr
                  key={keyExtractor(item)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-4 px-6 ${col.className || ""}`}>
                      {col.render(item, i)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
