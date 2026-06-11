"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Calendar, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/components/ui/delete-modal";
import { formatShortDate } from "@/lib/utils";
import { apiList, apiDelete } from "@/lib/api-client";
import type { BlogPost } from "@/types";

export default function DashboardBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  async function loadPosts() {
    try {
      const data = await apiList("blog_posts");
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!selected) return;
    try {
      await apiDelete("blog_posts", selected.id);
      setPosts((prev) => prev.filter((p) => p.id !== selected.id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Blog Posts</h1>
          <p className="text-sm text-muted">Create and manage blog articles.</p>
        </div>
        <Button size="sm" onClick={() => router.push("/dashboard/blog/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="mb-4 lg:mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No posts found.</p>
          {posts.length === 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/blog/new")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first post
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {post.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={post.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                          {post.status === "published" ? (
                            <><Eye className="w-3 h-3 mr-1" /> Published</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                          )}
                        </Badge>
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3
                        className="font-semibold text-primary text-sm truncate cursor-pointer hover:text-secondary transition-colors"
                        onClick={() => router.push(`/dashboard/blog/${post.id}`)}
                      >
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(post.createdAt)}
                        </span>
                        {post.author && <span>By {post.author}</span>}
                        {post.excerpt && <span className="truncate hidden sm:inline">{post.excerpt}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => router.push(`/dashboard/blog/${post.id}`)}
                        className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setSelected(post); setDeleteOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Post?"
        message={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
