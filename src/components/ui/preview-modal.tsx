"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw, ShieldAlert } from "lucide-react";
import { Modal } from "./modal";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  type: "video" | "pdf" | "image";
  title: string;
  url: string;
  images?: string[];
  studentName?: string;
}

function getYouTubeEmbed(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return url;
}

function isGoogleDriveUrl(url: string): boolean {
  return url.includes("drive.google.com");
}

function getGoogleDriveEmbed(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url;
}

function WatermarkOverlay({ studentName }: { studentName?: string }) {
  const text = `Licensed to: ${studentName || "Student"} — Do not share`;
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute whitespace-nowrap text-xs text-black/10 dark:text-white/10 font-bold"
          style={{
            top: `${i * 10}%`,
            left: `${(i * 7) % 30}%`,
            transform: `rotate(-25deg)`,
            transformOrigin: "center",
            userSelect: "none",
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

function SecurityBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium">
      <ShieldAlert className="w-4 h-4 shrink-0" />
      <span>This content is for your personal educational use only. Do not share or distribute.</span>
    </div>
  );
}

function preventDefaults(e: React.MouseEvent | React.KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function useKeyboardBlock() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.includes("Mac");
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && ["s", "p", "S", "P"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);
}

export function PreviewModal({ open, onClose, type, title, url, images, studentName }: PreviewModalProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useKeyboardBlock();

  const allImages = (images && images.length > 0 ? images : (type === "image" && url ? [url] : [])).filter(Boolean);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsFullscreen(false);
  }, [imageIndex, open]);

  function handleWheel(e: React.WheelEvent) {
    if (type !== "image") return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoom((prev) => Math.max(1, Math.min(5, prev + delta)));
  }

  function zoomIn() {
    setZoom((prev) => Math.min(5, prev + 0.5));
  }

  function zoomOut() {
    setZoom((prev) => {
      const next = prev - 0.5;
      if (next < 1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  }

  function resetZoom() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }

  function handleMouseUp() {
    setIsPanning(false);
  }

  function getMaxWidth() {
    if (type === "image" && !isFullscreen) return "max-w-4xl";
    if (type === "image" && isFullscreen) return "max-w-full";
    if (type === "video") return "max-w-3xl";
    return "max-w-2xl";
  }

  const imageContent = (
    <div
      ref={imageRef}
      className={`relative overflow-hidden bg-accent rounded-lg ${isFullscreen ? "flex-1" : "max-h-[60vh] min-h-[250px] sm:aspect-video sm:max-h-none sm:min-h-0"}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
    >
      <WatermarkOverlay studentName={studentName} />
      {allImages.length > 0 ? (
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          <Image
            src={allImages[imageIndex]}
            alt={`${title} ${imageIndex + 1}`}
            width={isFullscreen ? 1200 : 800}
            height={isFullscreen ? 900 : 600}
            className="max-w-full max-h-full object-contain"
            unoptimized
            draggable={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          No images available
        </div>
      )}
    </div>
  );

  return (
    <>
      {isFullscreen ? (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80">
            <div className="flex items-center gap-2 text-white">
              <span className="font-medium truncate max-w-[300px]">{title}</span>
              {allImages.length > 1 && (
                <span className="text-sm text-white/60">
                  {imageIndex + 1} / {allImages.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={resetZoom} className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors" title="Reset zoom">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={zoomOut} className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors" title="Zoom out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/60 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors" title="Zoom in">
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-2" />
              <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors" title="Exit fullscreen">
                <Minimize className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white hover:text-white transition-colors" title="Close">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div
            className="flex-1 relative overflow-hidden bg-neutral-900"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
          >
            <WatermarkOverlay studentName={studentName} />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {allImages.length > 0 ? (
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                }}
              >
                <Image src={allImages[imageIndex]} alt={`${title} ${imageIndex + 1}`} width={1200} height={900} className="max-w-full max-h-full object-contain" unoptimized draggable={false} style={{ width: "auto", height: "auto" }} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">No images available</div>
            )}
          </div>
        </div>
      ) : (
        <Modal open={open} onClose={onClose} title={title} maxWidth={getMaxWidth()}>
          <div onContextMenu={preventDefaults}>
            {studentName && <SecurityBanner />}

            {type === "video" ? (
              <div className="relative aspect-video sm:aspect-video rounded-lg overflow-hidden bg-black">
                <WatermarkOverlay studentName={studentName} />
                <iframe
                  src={getYouTubeEmbed(url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              </div>
            ) : type === "image" ? (
              <div className="space-y-3" onContextMenu={preventDefaults}>
                <div className="flex items-center justify-center gap-3" onContextMenu={preventDefaults}>
                  <button onClick={zoomOut} className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors disabled:opacity-30" disabled={zoom <= 1}>
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-muted w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                  <button onClick={zoomIn} className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors disabled:opacity-30" disabled={zoom >= 5}>
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {zoom > 1 && (
                    <button onClick={resetZoom} className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors ml-2">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-px h-4 bg-primary/10 mx-1" />
                  <button onClick={() => setIsFullscreen(true)} className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>

                {allImages.length > 0 ? (
                  <div className="relative">
                    {imageContent}
                    {allImages.length > 1 && (
                      <>
                        <button onClick={() => setImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {allImages.map((_, i) => (
                            <button key={i} onClick={() => setImageIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? "bg-white" : "bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-accent flex items-center justify-center text-muted">No images available</div>
                )}
              </div>
            ) : (
              <div className="relative h-[60vh] sm:h-[500px] min-h-[300px] rounded-lg overflow-hidden border border-primary/5">
                <WatermarkOverlay studentName={studentName} />
                {isGoogleDriveUrl(url) ? (
                  <iframe src={getGoogleDriveEmbed(url)} className="w-full h-full" title={title} allowFullScreen />
                ) : url.endsWith(".pdf") || url.includes("pdf") ? (
                  <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`} className="w-full h-full" title={title} />
                ) : (
                  <iframe src={url} className="w-full h-full" title={title} />
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
