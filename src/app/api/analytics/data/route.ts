import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleSupabase();
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7";

    let dateFilterGte: string;
    let dateFilterCol = "occurred_at";
    if (range === "today") {
      dateFilterGte = "current_date";
    } else if (range === "7") {
      dateFilterGte = "now() - interval '7 days'";
    } else if (range === "30") {
      dateFilterGte = "now() - interval '30 days'";
    } else if (range === "90") {
      dateFilterGte = "now() - interval '90 days'";
    } else {
      dateFilterGte = "now() - interval '7 days'";
    }

    const rangeDays = range === "today" ? 1 : parseInt(range) || 7;

    const [
      totalViewsResult,
      uniqueVisitorsResult,
      viewsTodayResult,
      registrationsResult,
      examStartsResult,
      examSubmitsResult,
      pageViewsResult,
      topPagesResult,
      topExamsResult,
      loginEventsResult,
      pdfImportEventsResult,
      questionsSavedEventsResult,
      landingViewsResult,
      examPageViewsResult,
    ] = await Promise.all([
      supabase.from("analytics_events").select("id", { count: "exact", head: true }),
      supabase.from("analytics_events").select("visitor_id"),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).gte(dateFilterCol, "current_date"),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "registration_completed").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "exam_started").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "exam_submitted").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("path, occurred_at").eq("event_type", "page_view").gte(dateFilterCol, dateFilterGte).order("occurred_at", { ascending: true }),
      supabase.from("analytics_events").select("path, occurred_at").eq("event_type", "page_view").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("exam_id, event_type, occurred_at").in("event_type", ["exam_started", "exam_submitted"]).gte(dateFilterCol, dateFilterGte).not("exam_id", "is", null),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "login_completed").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "pdf_imported").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "questions_saved").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "landing_page_view").gte(dateFilterCol, dateFilterGte),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "exam_page_view").gte(dateFilterCol, dateFilterGte),
    ]);

    const totalPageViews = totalViewsResult.count ?? 0;
    const viewsToday = viewsTodayResult.count ?? 0;
    const newRegistrations = registrationsResult.count ?? 0;
    const examStarts = examStartsResult.count ?? 0;
    const examSubmits = examSubmitsResult.count ?? 0;
    const logins = loginEventsResult.count ?? 0;
    const pdfImports = pdfImportEventsResult.count ?? 0;
    const questionsSaved = questionsSavedEventsResult.count ?? 0;
    const landingViews = landingViewsResult.count ?? 0;
    const examPageViews = examPageViewsResult.count ?? 0;

    const uniqueVisitors = new Set((uniqueVisitorsResult.data ?? []).map((r) => r.visitor_id)).size;

    const completionRate = examStarts > 0 ? Math.round((examSubmits / examStarts) * 100) : 0;

    const pageViewData = pageViewsResult.data ?? [];
    const dailyViews: Record<string, number> = {};
    const now = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyViews[d.toISOString().slice(0, 10)] = 0;
    }
    for (const row of pageViewData) {
      const day = new Date(row.occurred_at).toISOString().slice(0, 10);
      if (dailyViews[day] !== undefined) dailyViews[day]++;
    }
    const chartDays = Object.entries(dailyViews).map(([date, views]) => ({ date, views }));

    const topPagesMap: Record<string, number> = {};
    for (const row of topPagesResult.data ?? []) {
      const p = row.path || "/";
      topPagesMap[p] = (topPagesMap[p] || 0) + 1;
    }
    const topPages = Object.entries(topPagesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    const examMap: Record<string, { started: number; submitted: number }> = {};
    for (const row of topExamsResult.data ?? []) {
      const eid = row.exam_id;
      if (!eid) continue;
      if (!examMap[eid]) examMap[eid] = { started: 0, submitted: 0 };
      if (row.event_type === "exam_started") examMap[eid].started++;
      else if (row.event_type === "exam_submitted") examMap[eid].submitted++;
    }

    const { data: examCategories } = await supabase
      .from("exam_categories")
      .select("id, title")
      .in("id", Object.keys(examMap));

    const examTitleMap: Record<string, string> = {};
    for (const cat of examCategories ?? []) {
      examTitleMap[cat.id] = cat.title;
    }

    const topExams = Object.entries(examMap)
      .sort((a, b) => b[1].started - a[1].started)
      .slice(0, 10)
      .map(([id, counts]) => ({
        id,
        title: examTitleMap[id] || "Unknown Exam",
        started: counts.started,
        submitted: counts.submitted,
        rate: counts.started > 0 ? Math.round((counts.submitted / counts.started) * 100) : 0,
      }));

    // Get totals from regular DB tables
    const [{ count: totalStudents }, { count: totalCourses }, { count: totalExams }, { count: totalQuestions }, { count: totalEnrollments }] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("exam_categories").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase.from("enrollments").select("id", { count: "exact", head: true }),
    ]);

    // Previous period comparisons
    let prevDateFilter: string;
    if (range === "today") {
      prevDateFilter = "current_date - interval '1 day'";
    } else {
      const prevRange = rangeDays * 2;
      prevDateFilter = `now() - interval '${prevRange} days'`;
      dateFilterGte = `now() - interval '${rangeDays} days'`;
    }

    const [{ count: prevViews }] = await Promise.all([
      supabase.from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "page_view")
        .gte(dateFilterCol, prevDateFilter)
        .lt(dateFilterCol, dateFilterGte),
    ]);

    const prevViewsCount = prevViews ?? 0;
    const viewsGrowth = prevViewsCount > 0 ? Math.round(((totalPageViews - prevViewsCount) / prevViewsCount) * 100) : 0;

    return NextResponse.json({
      totalPageViews,
      uniqueVisitors,
      viewsToday,
      viewsGrowth,
      newRegistrations,
      logins,
      examStarts,
      examSubmits,
      completionRate,
      pdfImports,
      questionsSaved,
      landingViews,
      examPageViews,
      chartDays,
      topPages,
      topExams,
      totalStudents: totalStudents ?? 0,
      totalCourses: totalCourses ?? 0,
      totalExams: totalExams ?? 0,
      totalQuestions: totalQuestions ?? 0,
      totalEnrollments: totalEnrollments ?? 0,
    });
  } catch (e) {
    console.error("GET /api/analytics/data error:", e);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
