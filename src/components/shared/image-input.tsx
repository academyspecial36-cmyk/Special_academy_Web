"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { apiUpload } from "@/lib/api-client";

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  onBrowseMedia?: () => void;
}

export function ImageInput({ value, onChange, placeholder = "https://...", onBrowseMedia }: ImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleUrlChange(url: string) {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setLocalPreview(null);
    onChange(url);
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const blobUrl = URL.createObjectURL(file);
    previewRef.current = blobUrl;
    setLocalPreview(blobUrl);
    try {
      const { url } = await apiUpload(file, "images");
      onChange(url);
    } catch {
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleFileUpload(file);
        }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-3.5 h-3.5 mr-2" /> Upload</>
          )}
        </Button>
        {onBrowseMedia && (
          <Button type="button" variant="outline" size="sm" onClick={onBrowseMedia}>
            <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Browse Media
          </Button>
        )}
        <span className="text-xs text-muted">or paste URL</span>
      </div>
      <Input
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleUrlChange(e.target.value)}
      />
      {(localPreview || value) && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden" style={{ backgroundImage: "repeating-conic-gradient(hsl(var(--primary) / 0.08) 0% 25%, transparent 0% 50%)", backgroundSize: "16px 16px" }}>
          <Image
            src={localPreview || value}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
