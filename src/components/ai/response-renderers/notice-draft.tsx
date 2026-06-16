"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pin, Loader2, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NoticeDraftData {
  title?: string;
  content?: string;
  category?: string;
  isPinned?: boolean;
}

export function NoticeDraftRenderer({ data }: { data: NoticeDraftData }) {
  const router = useRouter();
  const [title, setTitle] = useState(data.title ?? "");
  const [content, setContent] = useState(data.content ?? "");
  const [category, setCategory] = useState(data.category ?? "announcement");
  const [isPinned, setIsPinned] = useState(data.isPinned ?? false);
  const [isPublishing, setIsPublishing] = useState(false);

  async function handlePublish() {
    if (!title.trim()) {
      toast.error("Please enter a notice title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter notice content");
      return;
    }
    setIsPublishing(true);
    try {
      const res = await fetch("/api/data/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category, isPinned, qualification: "all" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to publish notice");
      }
      toast.success("Notice published successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish notice");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Notice Draft
          {isPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Content</label>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Notice content" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="admission">Admission</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="event">Event</option>
              <option value="announcement">Announcement</option>
            </Select>
          </div>
          <div className="space-y-1.5 flex items-end">
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-1.5", isPinned && "bg-primary/5 border-primary/30")}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Pin className={cn("w-3.5 h-3.5", isPinned && "fill-primary text-primary")} />
              {isPinned ? "Pinned" : "Pin Notice"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handlePublish} disabled={isPublishing}>
          {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
          Publish Notice
        </Button>
        <Button variant="outline" asChild>
          <a href="/dashboard/notices" className="gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Edit in Notices
          </a>
        </Button>
        <Button variant="ghost" onClick={() => { setTitle(""); setContent(""); }}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
