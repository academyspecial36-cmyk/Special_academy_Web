"use client";

import { Modal } from "./modal";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  type: "video" | "pdf";
  title: string;
  url: string;
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

export function PreviewModal({ open, onClose, type, title, url }: PreviewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={type === "video" ? "max-w-3xl" : "max-w-2xl"}>
      {type === "video" ? (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={getYouTubeEmbed(url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      ) : (
        <div className="h-[500px] rounded-lg overflow-hidden border border-primary/5">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-full"
            title={title}
          />
        </div>
      )}
    </Modal>
  );
}
