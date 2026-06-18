"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Calendar, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
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

      <div className="mb-4 lg:mb-6 relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-40 bg-primary/10 rounded-xl animate-pulse" />
              <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-primary/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No posts found.</p>
          {posts.length === 0 && (
            <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/blog/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group"
            >
              <div
                className="rounded-xl border border-primary/5 overflow-hidden bg-white hover:shadow-md hover:border-primary/10 transition-all cursor-pointer h-full"
                onClick={() => router.push(`/dashboard/blog/${post.id}`)}
              >
                <div className="relative h-36 sm:h-40 overflow-hidden">
                  <Image
                    src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <Badge className={post.status === "published" ? "bg-emerald-500 text-white border-0 text-[10px]" : "bg-amber-500 text-white border-0 text-[10px]"}>
                      {post.status === "published" ? <><Eye className="w-3 h-3 mr-0.5" /> Published</> : <><EyeOff className="w-3 h-3 mr-0.5" /> Draft</>}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[9px]">{tag}</Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2 mb-2 group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-muted line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      <Calendar className="w-3 h-3" />
                      {formatShortDate(post.createdAt)}
                      {post.author && <span>· {post.author}</span>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/blog/${post.id}`); }}
                        className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(post); setDeleteOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
