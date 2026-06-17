"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Save, Loader2, ArrowLeft, Upload,
  Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { apiGet, apiCreate, apiUpdate, apiUpload } from "@/lib/api-client";
import type { BlogPost } from "@/types";

const RichEditor = dynamic(
  () => import("@/components/ui/rich-editor").then((m) => m.RichEditor),
  {
    ssr: false,
    loading: () => <div className="h-[300px] border border-primary/10 rounded-md animate-pulse bg-primary/5" />,
  }
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      try {
        const post = await apiGet("blog_posts", id) as BlogPost;
        if (!post) { toast.error("Post not found"); router.push("/dashboard/blog"); return; }
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setExcerpt(post.excerpt || "");
        setAuthor(post.author || "");
        setImage(post.image || "");
        setStatus(post.status);
        setTagsInput(post.tags?.join(", ") || "");
        setSlugManuallyEdited(true);
      } catch {
        toast.error("Failed to load post");
        router.push("/dashboard/blog");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew, router]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(publishStatus: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    setSaving(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        setImageUploading(true);
        const { url } = await apiUpload(imageFile, "images");
        imageUrl = url;
        setImageUploading(false);
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim() || null,
        author: author.trim() || null,
        image: imageUrl || null,
        status: publishStatus,
        tags,
        ...(publishStatus === "published" && status !== "published"
          ? { publishedAt: new Date().toISOString() }
          : {}),
      };

      if (isNew) {
        await apiCreate("blog_posts", payload);
        toast.success(publishStatus === "published" ? "Post published" : "Draft saved");
      } else {
        await apiUpdate("blog_posts", id, payload);
        setStatus(publishStatus);
        toast.success("Post updated");
      }
      router.push("/dashboard/blog");
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-8 w-32 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-10 w-full bg-primary/10 rounded-md animate-pulse" />
        <div className="h-10 w-full bg-primary/10 rounded-md animate-pulse" />
        <div className="h-[300px] w-full bg-primary/10 rounded-md animate-pulse" />
        <div className="h-20 w-full bg-primary/10 rounded-md animate-pulse" />
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-primary/10 rounded-md animate-pulse" />
          <div className="h-10 w-28 bg-primary/10 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/blog")} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Button>
          <h1 className="text-2xl font-bold text-primary">
            {isNew ? "New Post" : "Edit Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title..."
                  />
                </div>
                <div>
                  <RichEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your blog post..."
                    minHeight={400}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted shrink-0">/blog/</span>
                    <Input
                      value={slug}
                      onChange={(e) => { setSlug(slugify(e.target.value)); setSlugManuallyEdited(true); }}
                      placeholder="post-url-slug"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Status</label>
                  <Badge className={status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {status === "published" ? <><Eye className="w-3 h-3 mr-1" /> Published</> : <><EyeOff className="w-3 h-3 mr-1" /> Draft</>}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Excerpt</label>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description for preview..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Author</label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Admin"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Tags (comma separated)</label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. cadet, preparation, tips"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-primary/10 bg-accent mb-3">
                  {(imagePreview || image) ? (
                    <Image
                      src={imagePreview || image}
                      alt="Featured"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted text-sm">
                      No image selected
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="featured-image"
                  onChange={handleImageUpload}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={imageUploading}
                    onClick={() => document.getElementById("featured-image")?.click()}
                  >
                    {imageUploading ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-3.5 h-3.5 mr-2" /> {image ? "Change" : "Upload"}</>
                    )}
                  </Button>
                  {(imagePreview || image) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => { setImage(""); setImageFile(null); setImagePreview(null); }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {!imageFile && !imagePreview && (
                  <div className="mt-2">
                    <Input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
