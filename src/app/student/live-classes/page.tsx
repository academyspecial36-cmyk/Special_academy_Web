"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Video, ExternalLink, CalendarDays, Clock, Play, CheckCircle2, Monitor, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useFetch } from "@/lib/use-fetch";
import { useBreadcrumbs } from "@/lib/breadcrumb-context";
import type { LiveClass } from "@/types";

function formatDateFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function platformLabel(p: string) {
  const map: Record<string, string> = {
    zoom: "Zoom",
    google_meet: "Google Meet",
    youtube_live: "YouTube",
    other: "Other",
  };
  return map[p] || p;
}

export default function StudentLiveClassesPage() {
  const { setSegments } = useBreadcrumbs();
  const { data, loading } = useFetch<LiveClass[]>("/api/student/live-classes");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setSegments([{ label: "Live Classes" }]);
    return () => setSegments([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allClasses = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const upcoming = useMemo(
    () => allClasses
      .filter((c) => c.status === "scheduled" || c.status === "live")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [allClasses]
  );

  const past = useMemo(
    () => {
      const now = new Date();
      return allClasses
        .filter((c) => c.status === "completed" || c.status === "cancelled" || new Date(c.startTime) < now)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    },
    [allClasses]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-4 w-64 bg-primary/10 rounded-md animate-pulse" />
        <div className="grid md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Live Classes</h1>
        <p className="text-sm text-muted">View upcoming and past live sessions.</p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Upcoming Classes
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Monitor className="w-10 h-10 mx-auto text-muted/40 mb-2" />
              <p className="text-sm text-muted">No upcoming classes scheduled.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map((cls, i) => {
              const isLive = cls.status === "live";
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`overflow-hidden ${isLive ? "ring-2 ring-green-400" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLive ? "bg-green-500 animate-pulse" : "bg-primary/10"}`}>
                            <Video className={`w-4 h-4 ${isLive ? "text-white" : "text-primary"}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary text-sm">{cls.title}</h3>
                            <p className="text-xs text-muted">{cls.instructor}</p>
                          </div>
                        </div>
                        {isLive && (
                          <Badge className="bg-green-500 text-white border-0 text-[10px] animate-pulse">LIVE</Badge>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-4 text-xs text-muted">
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDateFull(cls.startTime)}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(cls.startTime)} · {cls.durationMinutes} min · {platformLabel(cls.platform)}
                        </p>
                      </div>

                      <a
                        href={cls.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Class
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-muted" />
          Past Classes
        </h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted">No past classes yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {past.map((cls) => {
              const chunks = cls.recordingChunks ?? [];
              return (
                <Card key={cls.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{cls.title}</p>
                          <p className="text-xs text-muted">
                            {formatDateFull(cls.startTime)} · {cls.instructor}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={cls.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                          {cls.status}
                        </Badge>
                        {cls.recordingUrl && (
                          <a
                            href={cls.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
                            title="View Recording"
                          >
                            <Play className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    {chunks.length > 0 && (
                      <div className="border-t border-primary/5 pt-3 space-y-1.5">
                        <p className="text-xs text-muted flex items-center gap-1.5 mb-2">
                          <Film className="w-3.5 h-3.5" />
                          {chunks.length} recording chunk{chunks.length > 1 ? "s" : ""}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {chunks.map((chunk, i) => (
                            <button
                              key={i}
                              onClick={() => setPreviewUrl(chunk.url)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-primary/5 text-xs text-primary font-medium transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              Chunk {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Recording">
        {previewUrl && (
          <video controls className="w-full rounded-lg" src={previewUrl} style={{ maxHeight: "70vh" }} />
        )}
      </Modal>
    </div>
  );
}
