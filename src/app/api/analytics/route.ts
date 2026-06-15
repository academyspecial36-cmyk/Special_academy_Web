import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

function getMonthLabel(d: string) {
  const date = new Date(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function groupByMonth<T extends Record<string, unknown>>(
  items: T[],
  dateKey: string,
  valueKey: string
): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const d = item[dateKey] as string | undefined;
    if (!d) continue;
    const month = getMonthLabel(d);
    map.set(month, (map.get(month) || 0) + Number(item[valueKey] ?? 1));
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      const da = new Date(a.month);
      const db = new Date(b.month);
      return da.getTime() - db.getTime();
    });
}

function groupByField<T extends Record<string, unknown>>(
  items: T[],
  field: string,
  labelKey: string
): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const val = String(item[field] ?? "Unknown");
    map.set(val, (map.get(val) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function countByField(items: Record<string, unknown>[], field: string): Record<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const val = String(item[field] ?? "Unknown");
    map.set(val, (map.get(val) || 0) + 1);
  }
  return Object.fromEntries(map);
}

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  const cleaned = price.replace(/[^0-9.]/g, "");
  return Number.parseFloat(cleaned) || 0;
}

function calculateGrowth(current: number, previous: number): { change: string; up: boolean } {
  if (previous === 0) return { change: `+${current}`, up: true };
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  return {
    change: `${diff >= 0 ? "+" : ""}${pct}%`,
    up: diff >= 0,
  };
}

export async function GET() {
  try {
    const supabase = createServiceRoleSupabase();

    const [
      { data: students },
      { data: enrollments },
      { data: courses },
      { data: notices },
      { data: blogPosts },
      { data: examAttempts },
      { data: examCategories },
      { data: contactSubmissions },
      { data: testimonials },
    ] = await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*"),
      supabase.from("notices").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*"),
      supabase.from("exam_attempts").select("*"),
      supabase.from("exam_categories").select("*"),
      supabase.from("contact_submissions").select("*"),
      supabase.from("testimonials").select("*"),
    ]);

    const allStudents = students ?? [];
    const allEnrollments = enrollments ?? [];
    const allCourses = courses ?? [];
    const allNotices = notices ?? [];
    const allBlogPosts = blogPosts ?? [];
    const allExamAttempts = examAttempts ?? [];
    const allExamCategories = examCategories ?? [];
    const allContactSubmissions = contactSubmissions ?? [];
    const allTestimonials = testimonials ?? [];

    const totalStudents = allStudents.length;
    const activeCourses = allCourses.length;
    const totalEnrollments = allEnrollments.length;
    const pendingNotices = allNotices.filter((n: Record<string, unknown>) => n.is_pinned === true).length;
    const totalBlogPosts = allBlogPosts.length;
    const totalContactSubmissions = allContactSubmissions.length;
    const totalTestimonials = allTestimonials.length;

    const publishedPosts = allBlogPosts.filter((p: Record<string, unknown>) => (p as { status?: string }).status === "published").length;

    const unreadMessages = allContactSubmissions.filter((s: Record<string, unknown>) => (s as { is_read?: boolean }).is_read === false).length;

    const studentGrowth = groupByMonth(allStudents, "join_date", "count");

    const enrollmentTrends = groupByMonth(allEnrollments, "created_at", "count");

    const coursePopularity = groupByField(allEnrollments, "interested_course", "interested_course");

    const coursePriceMap = new Map<string, number>();
    for (const c of allCourses) {
      coursePriceMap.set((c as Record<string, unknown>).title as string, parsePrice((c as Record<string, unknown>).price as string));
    }

    const revenueByMonth = new Map<string, number>();
    for (const e of allEnrollments) {
      const rec = e as Record<string, unknown>;
      const d = rec.created_at as string | undefined;
      if (!d) continue;
      const month = getMonthLabel(d);
      const courseName = rec.interested_course as string | undefined;
      const price = courseName ? coursePriceMap.get(courseName) || 0 : 0;
      revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + price);
    }
    const revenue = Array.from(revenueByMonth.entries())
      .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const studentsByClass = groupByField(allStudents, "class", "class");

    const noticesByCategory = countByField(allNotices, "category");

    const categoryNames = new Map<string, string>();
    for (const ec of allExamCategories) {
      const rec = ec as Record<string, unknown>;
      categoryNames.set(rec.id as string, rec.name as string);
    }
    const examScoresByCategory = new Map<string, { totalScore: number; totalPossible: number; count: number }>();
    for (const ea of allExamAttempts) {
      const rec = ea as Record<string, unknown>;
      const catId = rec.category_id as string;
      if (!catId) continue;
      const entry = examScoresByCategory.get(catId) || { totalScore: 0, totalPossible: 0, count: 0 };
      entry.totalScore += Number(rec.score ?? 0);
      entry.totalPossible += Number(rec.total ?? 0);
      entry.count += 1;
      examScoresByCategory.set(catId, entry);
    }
    const examPerformance = Array.from(examScoresByCategory.entries())
      .map(([catId, data]) => ({
        category: categoryNames.get(catId) || "Unknown",
        averageScore: data.count > 0 ? Math.round((data.totalScore / data.totalPossible) * 100) : 0,
        totalAttempts: data.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const months = studentGrowth.map((s) => s.month);
    const currentMonthStudents = studentGrowth.length > 0 ? studentGrowth[studentGrowth.length - 1].count : 0;
    const prevMonthStudents = studentGrowth.length > 1 ? studentGrowth[studentGrowth.length - 2].count : 0;
    const studentGrowthData = calculateGrowth(currentMonthStudents, prevMonthStudents);

    const currentMonthEnrollments = enrollmentTrends.length > 0 ? enrollmentTrends[enrollmentTrends.length - 1].count : 0;
    const prevMonthEnrollments = enrollmentTrends.length > 1 ? enrollmentTrends[enrollmentTrends.length - 2].count : 0;
    const enrollmentGrowth = calculateGrowth(currentMonthEnrollments, prevMonthEnrollments);

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

    const recentEnrollments = allEnrollments.slice(0, 5).map((e: Record<string, unknown>) => ({
      id: e.id,
      fullName: e.full_name,
      email: e.email,
      course: e.interested_course,
      status: e.status,
      createdAt: e.created_at,
    }));

    const latestNotices = allNotices.slice(0, 4).map((n: Record<string, unknown>) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      date: n.date,
      isPinned: n.is_pinned,
    }));

    return NextResponse.json({
      stats: {
        totalStudents,
        activeCourses,
        totalEnrollments,
        pendingNotices,
        totalBlogPosts,
        publishedPosts,
        totalContactSubmissions,
        unreadMessages,
        totalTestimonials,
        totalRevenue,
        studentGrowth: studentGrowthData,
        enrollmentGrowth: enrollmentGrowth,
      },
      studentGrowth,
      enrollmentTrends,
      coursePopularity,
      revenue,
      studentsByClass,
      noticesByCategory,
      examPerformance,
      recentEnrollments,
      latestNotices,
      months,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
