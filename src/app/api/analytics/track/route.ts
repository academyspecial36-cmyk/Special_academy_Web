import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase-server";

const EXCLUDED_PREFIXES = ["/admin", "/api", "/_next", "/favicon", "/icon", "/robots", "/sitemap"];

function shouldExclude(path: string): boolean {
  if (!path || path === "") return true;
  return EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, eventType, path, examId, attemptId, importId, metadata } = body;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }
    if (!eventType || typeof eventType !== "string") {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }
    if (path && shouldExclude(path)) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createServiceRoleSupabase();
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    const userId = user?.id ?? null;

    let visitorId = request.cookies.get("analytics_visitor_id")?.value;
    let sessionId = request.cookies.get("analytics_session_id")?.value;

    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    if (!sessionId) {
      const { data: session } = await supabase
        .from("analytics_sessions")
        .insert({ visitor_id: visitorId, user_id: userId })
        .select("id")
        .single();
      sessionId = session?.id ?? null;
    } else {
      await supabase
        .from("analytics_sessions")
        .update({ last_seen_at: new Date().toISOString(), user_id: userId })
        .eq("id", sessionId);
    }

    const { error: insertError } = await supabase
      .from("analytics_events")
      .insert({
        event_id: eventId,
        event_type: eventType,
        session_id: sessionId,
        visitor_id: visitorId,
        user_id: userId,
        path: path ?? null,
        exam_id: examId ?? null,
        attempt_id: attemptId ?? null,
        import_id: importId ?? null,
        metadata: metadata ?? {},
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ ok: true });
      }
      console.error("Analytics insert error:", insertError);
      return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });

    if (!request.cookies.get("analytics_visitor_id")) {
      response.cookies.set("analytics_visitor_id", visitorId, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
    }
    if (sessionId && !request.cookies.get("analytics_session_id")) {
      response.cookies.set("analytics_session_id", sessionId, {
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (e) {
    console.error("POST /api/analytics/track error:", e);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
