"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";
import type { BlogPost } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogSection() {
  const { settings } = useAppContext();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const labels = settings.config.sectionLabels?.blog;
  const btns = settings.config.buttonLabels || {} as Record<string, string>;

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/data/blog_posts");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const published = (Array.isArray(data) ? data as BlogPost[] : [])
          .filter((p) => p.status === "published")
          .sort((a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime()
          )
          .slice(0, 3);
        setPosts(published);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (settings.enableBlog === false) return null;

  if (loading && posts.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={labels?.label || "From Our Blog"}
            title={labels?.title || "Latest Articles & Tips"}
            description={labels?.description || ""}
          />
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden border border-primary/5 p-5 space-y-4 flex flex-col h-[300px]">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "From Our Blog"}
          title={labels?.title || "Latest Articles & Tips"}
          description={labels?.description || ""}
        />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-xl overflow-hidden border border-primary/5 hover:border-primary/10 hover:shadow-elevated transition-all duration-300 h-full"
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
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
                  <div className="flex items-center gap-3 text-xs text-muted mb-2">
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
                  <h3 className="font-semibold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/blog">
              {btns.viewAllArticles || "View All Articles"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
