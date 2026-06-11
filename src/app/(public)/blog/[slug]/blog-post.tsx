"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowLeft, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export function BlogPostPage({ slugPromise }: { slugPromise: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { slug } = await slugPromise;
        const res = await fetch("/api/data/blog_posts");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const posts = Array.isArray(data) ? data : [];
        const found = posts.find((p: BlogPost) => p.slug === slug);
        setPost(found || null);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slugPromise]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-primary mb-4">Post Not Found</h1>
          <p className="text-muted mb-8">The article you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {post.image && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted mb-6 leading-relaxed">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted pb-6 mb-6 border-b border-primary/5">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatShortDate(post.publishedAt || post.createdAt)}
            </span>
          </div>

          <div
            className="prose prose-sm md:prose-base max-w-none prose-headings:text-primary prose-p:text-muted prose-a:text-secondary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-primary prose-code:text-secondary prose-pre:bg-primary/5 prose-pre:border prose-pre:border-primary/10 overflow-x-auto break-words"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.div>
      </div>
    </article>
  );
}
