"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pin, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notice {
  id?: string;
  title?: string;
  category?: string;
  date?: string;
  createdAt?: string;
  isPinned?: boolean;
}

interface NoticeTableData {
  notices: Notice[];
  title?: string;
}

export function NoticeTableRenderer({ data }: { data: NoticeTableData }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const notices = data.notices ?? [];

  function toggleAll() {
    if (selected.size === notices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notices.map((n) => n.id!).filter(Boolean)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleDeleteSelected() {
    setIsDeleting(true);
    try {
      const promises = Array.from(selected).map((id) =>
        fetch(`/api/data/notices/${id}`, { method: "DELETE" }),
      );
      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        toast.error(`${failed.length} notice(s) failed to delete`);
      } else {
        toast.success(`${selected.size} notice(s) deleted successfully`);
      }
      setSelected(new Set());
      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete notices");
    } finally {
      setIsDeleting(false);
    }
  }

  if (notices.length === 0) {
    return (
      <Card className="border-primary/5">
        <CardContent className="p-6 text-center text-sm text-muted">No notices found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">{data.title ?? "Notices"}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-accent/50">
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.size === notices.length && notices.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Title</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Category</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Date</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Pinned</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice, i) => (
                <tr key={notice.id ?? i} className={cn("border-b last:border-0", i % 2 === 0 && "bg-white", i % 2 !== 0 && "bg-accent/30")}>
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(notice.id ?? "")}
                      onChange={() => toggleOne(notice.id ?? "")}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium">{notice.title ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {notice.category && (
                      <Badge variant="secondary" className="text-[10px]">{notice.category}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted">{notice.createdAt ?? notice.date ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {notice.isPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {selected.size > 0 && (
        <CardFooter className="border-t pt-4 flex items-center justify-between">
          <span className="text-xs text-muted">{selected.size} notice(s) selected</span>
          {!showConfirm ? (
            <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Are you sure?</span>
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isDeleting}>
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
