const API_URL = "/api/analytics/track";

function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sendTrackEvent(payload: Record<string, unknown>): void {
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API_URL, blob);
    } else {
      fetch(API_URL, { method: "POST", body: blob, keepalive: true }).catch(() => {});
    }
  } catch {
  }
}

export function trackPageView(pathname: string): void {
  if (typeof window === "undefined") return;
  const bucket = Math.floor(Date.now() / 30000);
  const storageKey = `analytics:${pathname}:${bucket}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
  }

  let eventType = "page_view";
  if (pathname === "/" || pathname === "") {
    eventType = "landing_page_view";
  } else if (pathname.startsWith("/dashboard") || pathname === "/dashboard") {
    eventType = "student_dashboard_view";
  } else if (pathname.startsWith("/exams/")) {
    eventType = "exam_page_view";
  }

  sendTrackEvent({
    eventId: generateEventId(),
    eventType,
    path: pathname,
  });
}

export function trackEvent(
  eventType: string,
  payload?: { eventId?: string; examId?: string; attemptId?: string; importId?: string; metadata?: Record<string, unknown> }
): void {
  if (typeof window === "undefined") return;
  sendTrackEvent({
    eventId: payload?.eventId || generateEventId(),
    eventType,
    path: window.location.pathname,
    examId: payload?.examId,
    attemptId: payload?.attemptId,
    importId: payload?.importId,
    metadata: payload?.metadata,
  });
}
