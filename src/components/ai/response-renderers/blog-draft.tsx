"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface BlogDraftData {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
}

export function BlogDraftRenderer({ data }: { data: BlogDraftData }) {
  const router = useRouter();
  const [title, setTitle] = useState(data.title ?? "");
  const [content, setContent] = useState(data.content ?? "");
  const [excerpt, setExcerpt] = useState(data.excerpt ?? "");
  const [category, setCategory] = useState(data.category ?? "");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (!title.trim()) { toast.error("Please enter a title"); return; }
    if (!content.trim()) { toast.error("Please enter content"); return; }
    setIsCreating(true);
    try {
      const res = await fetch("/api/data/blog_posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          category: category.trim() || "general",
          status: "draft",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create draft");
      }
      toast.success("Blog draft created");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create draft");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Blog Draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog post title" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Excerpt</label>
          <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt" rows={2} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Content</label>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Blog content" rows={6} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Category</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. news, tutorial" />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Draft
        </Button>
        <Button variant="ghost" onClick={() => { setTitle(""); setContent(""); setExcerpt(""); setCategory(""); }}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
