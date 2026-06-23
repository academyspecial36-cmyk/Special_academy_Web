"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/data/blog_posts");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const published = (Array.isArray(data) ? data : [])
          .filter((p: BlogPost) => p.status === "published")
          .sort((a: BlogPost, b: BlogPost) =>
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime()
          );
        setPosts(published);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-24 bg-primary/10 rounded-md animate-pulse mx-auto mb-4" />
          <div className="h-10 w-96 bg-primary/10 rounded-md animate-pulse mx-auto mb-3" />
          <div className="h-5 w-64 bg-primary/10 rounded-md animate-pulse mx-auto mb-12" />
          <div className="max-w-md mx-auto mb-12">
            <div className="h-12 w-full bg-primary/10 rounded-lg animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-primary/10 rounded-xl animate-pulse" />
                <div className="h-5 w-3/4 bg-primary/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-primary/10 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-primary/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Our Blog"
          title="Latest Articles & Insights"
          description="Tips, guides, and updates from Special Academy to help you prepare for cadet college admission."
        />

        <div className="max-w-md mx-auto mb-12 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">No articles found.</p>
            {search && (
              <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block bg-accent rounded-xl overflow-hidden border border-primary/5 hover:border-primary/10 hover:shadow-elevated transition-all duration-300 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                     
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {post.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} className="bg-white/90 text-primary border-0 text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(post.publishedAt || post.createdAt)}
                      </span>
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.author}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
