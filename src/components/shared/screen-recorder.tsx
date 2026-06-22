"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Video, Square, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUpload } from "@/lib/api-client";
import type { RecordingChunk } from "@/types";

const CHUNK_INTERVAL_MS = 10_000;

interface ScreenRecorderProps {
  onChunksReady: (chunks: RecordingChunk[]) => void;
  disabled?: boolean;
}

export function ScreenRecorder({ onChunksReady, disabled }: ScreenRecorderProps) {
  const [state, setState] = useState<"idle" | "recording" | "uploading">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<RecordingChunk[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopTracks]);

  async function startRecording() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080, frameRate: 30 },
        audio: true,
      });

      let audioStream: MediaStream | null = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        // mic permission denied — record without audio
      }

      const tracks = [...screenStream.getVideoTracks()];
      if (audioStream) tracks.push(...audioStream.getAudioTracks());

      const combined = new MediaStream(tracks);
      streamRef.current = combined;

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(combined, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();
      setChunkCount(0);
      setElapsed(0);

      recorder.ondataavailable = async (event) => {
        if (event.data.size === 0) return;
        const blob = event.data;
        const chunkIndex = chunksRef.current.length;
        const file = new File([blob], `chunk_${String(chunkIndex).padStart(4, "0")}.webm`, { type: "video/webm" });

        setChunkCount((c) => c + 1);
        setState("uploading");

        try {
          const { url } = await apiUpload(file, "recordings");
          chunksRef.current.push({
            url,
            duration: CHUNK_INTERVAL_MS / 1000,
            createdAt: new Date().toISOString(),
            size: blob.size,
          });
        } catch {
          // chunk upload failed — continue recording
        }

        setState("recording");
      };

      recorder.start(CHUNK_INTERVAL_MS);

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });

      setState("recording");
    } catch {
      setState("idle");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    stopTracks();

    setState("uploading");
    // small delay for the final chunk to upload
    setTimeout(() => {
      onChunksReady(chunksRef.current);
      setState("idle");
      setElapsed(0);
      setChunkCount(0);
    }, 2000);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {state === "recording" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Recording {formatTime(elapsed)}
          </span>
          <span className="text-xs text-red-500">({chunkCount} chunks)</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={stopRecording}
            className="ml-auto"
          >
            <Square className="w-3.5 h-3.5 mr-1.5" /> Stop
          </Button>
        </div>
      )}

      {state === "uploading" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
          <span className="text-sm text-amber-700">
            Uploading recording chunks ({chunkCount})...
          </span>
        </div>
      )}

      {state === "idle" && (
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          disabled={disabled}
          className="w-full"
        >
          <Video className="w-4 h-4 mr-2" />
          Start Recording
        </Button>
      )}
    </div>
  );
}
