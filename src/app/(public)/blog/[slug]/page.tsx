import { BlogPostPage } from "./blog-post";

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/data/blog_posts`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = Array.isArray(data) ? data : [];
    return posts
      .filter((p: { status: string }) => p.status === "published")
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default function BlogSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogPostPage slugPromise={params} />;
}
