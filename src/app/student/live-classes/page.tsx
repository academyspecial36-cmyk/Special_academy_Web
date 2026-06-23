"use client";

import { useEffect, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
import {
  Video, ExternalLink, CalendarDays, Clock, Play, CheckCircle2,
  Monitor, Film, Users, Timer, MapPin, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useFetch } from "@/lib/use-fetch";
import { useBreadcrumbs } from "@/lib/breadcrumb-context";
import type { LiveClass } from "@/types";

function formatDateFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function platformLabel(p: string) {
  const map: Record<string, string> = {
    zoom: "Zoom", google_meet: "Google Meet",
    youtube_live: "YouTube", other: "Other",
  };
  return map[p] || p;
}

function getTimeRemaining(startTime: string): string {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "Starting soon";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 48) return `${Math.floor(hours / 24)}d away`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const COLOR_PALETTE = [
  "border-l-primary-500 bg-primary-50",
  "border-l-primary-600 bg-primary-100",
  "border-l-primary-400 bg-primary-50",
  "border-l-primary-700 bg-primary-200",
  "border-l-secondary bg-secondary/10",
];

function getColorPair(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

function getAccentFromColor(color?: string) {
  if (!color) return null;
  return { border: `border-l-[${color}]`, bg: `bg-[${color}]/10` };
}

export default function StudentLiveClassesPage() {
  const { setSegments } = useBreadcrumbs();
  const { data, loading } = useFetch<LiveClass[]>("/api/student/live-classes");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setSegments([{ label: "Live Classes" }]);
    return () => setSegments([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allClasses = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const upcoming = useMemo(
    () => allClasses
      .filter((c) => c.status === "scheduled" || c.status === "live")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [allClasses]
  );

  const past = useMemo(
    () => allClasses
      .filter((c) => c.status === "completed" || c.status === "cancelled" || new Date(c.startTime) < new Date())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [allClasses]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-4 w-64 bg-primary/10 rounded-md animate-pulse" />
        <div className="grid md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Live Classes</h1>
            <p className="text-xs sm:text-sm text-muted">Attend live sessions and review past recordings.</p>
          </div>
        </div>
      </motion.div>

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
          <h2 className="text-base sm:text-lg font-bold text-primary">Upcoming Classes</h2>
          <span className="text-xs text-muted bg-primary/5 px-2 py-0.5 rounded-full">{upcoming.length}</span>
        </div>
        {upcoming.length === 0 ? (
          <Card className="border-dashed border-2 border-primary/10">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-primary/30" />
              </div>
              <p className="text-sm font-medium text-primary mb-1">No upcoming classes</p>
              <p className="text-xs text-muted">Check back later for scheduled live sessions.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map((cls, i) => {
              const isLive = cls.status === "live";
              const [border, bg] = getColorPair(i).split(" ");
              const timeLeft = getTimeRemaining(cls.startTime);
              return (
                <UpcomingClassCard
                  key={cls.id}
                  cls={cls}
                  i={i}
                  isLive={isLive}
                  border={border}
                  bg={bg}
                  timeLeft={timeLeft}
                  formatDateFull={formatDateFull}
                  formatTime={formatTime}
                  platformLabel={platformLabel}
                  getTimeRemaining={getTimeRemaining}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-muted" />
          <h2 className="text-base sm:text-lg font-bold text-primary">Past Classes</h2>
          <span className="text-xs text-muted bg-primary/5 px-2 py-0.5 rounded-full">{past.length}</span>
        </div>
        {past.length === 0 ? (
          <Card className="border-dashed border-2 border-primary/10">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-primary/30" />
              </div>
              <p className="text-sm font-medium text-primary mb-1">No past classes yet.</p>
              <p className="text-xs text-muted">Past recordings will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {past.map((cls, i) => {
              const chunks = cls.recordingChunks ?? [];
              const [border, bg] = getColorPair(i + upcoming.length).split(" ");
              return (
                <PastClassCard
                  key={cls.id}
                  cls={cls}
                  i={i}
                  border={border}
                  bg={bg}
                  upcomingLength={upcoming.length}
                  chunks={chunks}
                  onPreview={setPreviewUrl}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Recording Preview Modal */}
      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Recording">
        {previewUrl && (
          <video controls className="w-full rounded-lg" src={previewUrl} style={{ maxHeight: "70vh" }} />
        )}
      </Modal>
    </div>
  );
}

const UpcomingClassCard = memo(function UpcomingClassCard({ cls, i, isLive, border, bg, timeLeft, formatDateFull, formatTime, platformLabel, getTimeRemaining }: {
  cls: LiveClass; i: number; isLive: boolean; border: string; bg: string; timeLeft: string;
  formatDateFull: (iso: string) => string; formatTime: (iso: string) => string;
  platformLabel: (p: string) => string; getTimeRemaining: (s: string) => string;
}) {
  return (
    <motion.div
      key={cls.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      <Card className={`border-l-4 ${isLive ? "border-l-green-500" : border} overflow-hidden group hover:shadow-md transition-all duration-300`}>
        <CardContent className="p-0">
          <div className="p-5">
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLive ? "bg-green-500" : bg} shrink-0`}>
                  <Video className={`w-5 h-5 ${isLive ? "text-white animate-pulse" : "text-primary"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-primary text-sm leading-tight">{cls.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3 h-3 text-muted" />
                    <p className="text-xs text-muted">{cls.instructor}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {isLive ? (
                  <Badge className="bg-green-500 text-white border-0 text-[10px] animate-pulse shadow-sm shadow-green-500/30">LIVE</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-primary/5">
                    <Timer className="w-2.5 h-2.5 mr-1" />
                    {timeLeft}
                  </Badge>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                <span className="truncate">{formatDateFull(cls.startTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Clock className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                <span>{formatTime(cls.startTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Timer className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                <span>{cls.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                <span>{platformLabel(cls.platform)}</span>
              </div>
            </div>

            {/* CTA */}
            <a
              href={cls.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLive
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-sm shadow-green-500/30"
                  : "bg-primary text-white hover:bg-primary/90 shadow-sm"
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              {isLive ? "Join Now" : "Join Class"}
              <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

const RecordingChunkButton = memo(function RecordingChunkButton({ chunk, ci, onPreview }: {
  chunk: { url: string }; ci: number; onPreview: (url: string) => void;
}) {
  return (
    <button
      onClick={() => onPreview(chunk.url)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-primary/10 text-xs text-primary font-medium transition-colors border border-primary/5"
    >
      <Play className="w-3 h-3" />
      Chunk {ci + 1}
    </button>
  );
});

const PastClassCard = memo(function PastClassCard({ cls, i, border, bg, upcomingLength, chunks, onPreview }: {
  cls: LiveClass; i: number; border: string; bg: string; upcomingLength: number;
  chunks: { url: string }[]; onPreview: (url: string) => void;
}) {
  return (
    <motion.div
      key={cls.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
    >
      <Card className={`border-l-4 ${cls.status === "cancelled" ? "border-l-red-400" : border} overflow-hidden group hover:shadow-sm transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls.status === "cancelled" ? "bg-red-50" : bg} shrink-0`}>
                <Video className={`w-4 h-4 ${cls.status === "cancelled" ? "text-red-400" : "text-primary"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-primary truncate">{cls.title}</p>
                  <Badge variant={cls.status === "cancelled" ? "destructive" : "secondary"} className="text-[9px] capitalize shrink-0">
                    {cls.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                  <CalendarDays className="w-3 h-3" />
                  {formatDateFull(cls.startTime)} · {cls.instructor}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {chunks.length > 0 && (
                <button
                  onClick={() => onPreview(chunks[0].url)}
                  className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                  title="View recording"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              {cls.recordingUrl && !chunks.length && (
                <a
                  href={cls.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                  title="View Recording"
                >
                  <Play className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          {chunks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/5">
              <div className="flex items-center gap-1.5 mb-2">
                <Film className="w-3.5 h-3.5 text-muted" />
                <span className="text-xs text-muted font-medium">{chunks.length} recording chunk{chunks.length > 1 ? "s" : ""}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chunks.map((chunk, ci) => (
                  <RecordingChunkButton key={ci} chunk={chunk} ci={ci} onPreview={onPreview} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
