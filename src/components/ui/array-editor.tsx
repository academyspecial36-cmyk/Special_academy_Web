import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ArrayItem {
  icon?: string;
  title?: string;
  description?: string;
  time?: string;
  value?: string;
  label?: string;
}

interface ArrayEditorProps {
  items: ArrayItem[];
  onChange: (items: ArrayItem[]) => void;
  fields: { key: string; label: string; type?: "text" | "textarea" }[];
  defaultItem: ArrayItem;
  itemLabel: string;
  gridCols?: number;
  placeholder?: Record<string, string>;
}

export function ArrayEditor({ items, onChange, fields, defaultItem, itemLabel, gridCols = 2, placeholder }: ArrayEditorProps) {
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-${gridCols} gap-4`}>
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">{itemLabel} {i + 1}</span>
            <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <X className="w-3 h-3 mr-1" /> Remove
            </Button>
          </div>
          {fields.map((field) => (
            field.type === "textarea" ? (
              <Textarea
                key={field.key}
                rows={2}
                value={(item as Record<string, string>)[field.key] ?? ""}
                onChange={(e) => onChange(items.map((v, idx) => idx === i ? { ...v, [field.key]: e.target.value } : v))}
                placeholder={placeholder?.[field.key] || field.label}
                className="text-xs"
              />
            ) : (
              <Input
                key={field.key}
                value={(item as Record<string, string>)[field.key] ?? ""}
                onChange={(e) => onChange(items.map((v, idx) => idx === i ? { ...v, [field.key]: e.target.value } : v))}
                placeholder={placeholder?.[field.key] || field.label}
                className="text-xs"
              />
            )
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => onChange([...items, defaultItem])}>
        <Plus className="w-4 h-4 mr-2" /> Add {itemLabel}
      </Button>
    </div>
  );
}
