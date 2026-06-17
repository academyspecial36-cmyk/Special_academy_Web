# Content Security Recommendations

## Current State Assessment

| Concern | Status | Risk Level |
|---|---|---|
| Public Supabase Storage URLs | **All URLs are public** | 🔴 HIGH |
| Download prevention | **None** — right-click, Ctrl+S, browser dev tools all work | 🔴 HIGH |
| Screenshot prevention | **None** — no visibility blur or detection | 🔴 HIGH |
| PDF protection | **Google Docs Viewer** exposes raw URL, allows print/download | 🔴 HIGH |
| Video protection | **YouTube iframe** — can be downloaded, shared | 🔴 HIGH |
| Image protection | **No watermark**, right-click save works | 🔴 HIGH |
| Access control | **Client-side only** — no server-side validation for content | 🟡 MEDIUM |
| Audit logging | **None** | 🟡 MEDIUM |
| Legal warnings | **None** | 🟡 MEDIUM |
| Rate limiting | **None** on content endpoints | 🟡 MEDIUM |

---

## 1. Supabase Storage Security

### Current Setup
- Buckets `media`, `images`, `pdfs` are **public** — anyone with the URL can access
- No Row Level Security (RLS) policies on storage
- No signed URLs (time-limited access)
- No referrer restrictions

### Recommended Changes

#### 1.1 Make Storage Buckets Private
- In Supabase dashboard, set buckets `media`, `images`, `pdfs` to **private**
- This breaks all existing public URLs — content can only be accessed via:
  - Signed URLs (time-limited)
  - Service role API (server-side)
- Storage RLS policies are NOT sufficient for access control (tied to auth.uid but content access should be based on enrollment)

#### 1.2 Create Storage RLS Policies
Create policies on storage.objects:

```sql
-- Bucket: media
-- Policy: "Students can read files they are enrolled for"
CREATE POLICY "media_select_enrolled" ON storage.objects
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Admin can read all
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      OR
      -- Student must be enrolled in a course that has this file
      EXISTS (
        SELECT 1 FROM items i
        JOIN subcategories s ON i.subcategory_id = s.id
        JOIN courses c ON s.course_id = c.id
        JOIN enrollments e ON e.course_id = c.id
        JOIN students stu ON stu.id = e.student_id
        JOIN profiles p ON p.id = stu.id
        WHERE p.id = auth.uid()
        AND (i.url LIKE '%' || name || '%' OR i.images @> ARRAY[name])
      )
    )
  );

-- Policy: "Only admins can insert/update/delete"
CREATE POLICY "media_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "media_update_admin" ON storage.objects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "media_delete_admin" ON storage.objects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

**Note**: This approach is complex because filename → item matching is fragile. The simpler approach is:
- Keep buckets private
- Use service role for all server-side operations
- Generate signed URLs per request

#### 1.3 Signed URL Generation (Recommended)

```typescript
// src/lib/content-security.ts
import { createServerSupabase } from "./supabase-server";

interface SignedUrlResult {
  url: string;
  expiresAt: number; // epoch seconds
}

export async function getSignedContentUrl(
  storagePath: string,
  bucket: string = "media",
  expirySeconds: number = 3600
): Promise<SignedUrlResult> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expirySeconds);

  if (error || !data) throw new Error("Failed to generate signed URL");
  return {
    url: data.signedUrl,
    expiresAt: Math.floor(Date.now() / 1000) + expirySeconds,
  };
}
```

---

## 2. Server-Side Content Delivery

### Architecture

```
Student clicks content item
  |
  v
Client calls GET /api/content/access?itemId=<id>
  |
  v
Server:
  1. Validates auth token (getUser from Supabase)
  2. Validates student is enrolled in the course
  3. Looks up item.storage_path from items table
  4. Generates signed URL (1-hour expiry)
  5. Returns { signedUrl, expiresAt, watermark, studentInfo }
  |
  v
PreviewModal receives signed URL + metadata
  |
  v
For images: fetch signed URL, apply client watermark overlay
For PDFs: fetch via signed URL, render in secure PDF viewer
For videos: HLS playlist served via signed URLs
```

### Endpoint Implementation

```typescript
// src/app/api/content/access/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getSignedContentUrl } from "@/lib/content-security";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get profile & check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Get item info
  const itemId = request.nextUrl.searchParams.get("itemId");
  const { data: item } = await supabase
    .from("items")
    .select("*, subcategories!inner(courses!inner(id))")
    .eq("id", itemId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // 4. Validate enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", item.subcategories.courses.id)
    .single();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  // 5. Generate signed URL
  const storagePath = extractStoragePath(item.url); // parse URL to get storage path
  const signed = await getSignedContentUrl(storagePath);

  // 6. Log access
  await logContentAccess(item.id, user.id, request);

  // 7. Return
  return NextResponse.json({
    signedUrl: signed.url,
    expiresAt: signed.expiresAt,
    studentInfo: {
      name: profile.name,
      email: profile.email,
    },
    type: item.type,
    title: item.title,
  });
}
```

---

## 3. Client-Side Security Measures

### 3.1 Watermark Overlay Component

```tsx
// src/components/ui/watermark.tsx
"use client";

import { useAuth } from "@/lib/auth-context";

interface WatermarkProps {
  text?: string;
}

export function Watermark({ text }: WatermarkProps) {
  const { user } = useAuth();
  const displayText = text || `Licensed to: ${user?.name || "Student"} — ${user?.email || ""} — Do not share`;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Diagonal repeating watermark */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute whitespace-nowrap text-xs text-black/10 dark:text-white/10 font-bold"
          style={{
            top: `${i * 12}%`,
            left: `${i % 2 === 0 ? -5 : 10}%`,
            transform: `rotate(-30deg)`,
            transformOrigin: "center",
            userSelect: "none",
          }}
        >
          {displayText}
        </div>
      ))}
    </div>
  );
}
```

### 3.2 Right-Click & Keyboard Prevention

```tsx
// Inside PreviewModal
function preventDefaults(e: React.MouseEvent | KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

// Attach handlers
<div
  onContextMenu={preventDefaults}
  onKeyDown={(e) => {
    const isMac = navigator.platform.includes("Mac");
    const modKey = isMac ? e.metaKey : e.ctrlKey;
    if (modKey && ["s", "p", "S", "P"].includes(e.key)) {
      e.preventDefault();
      toast.warning("Saving/printing is disabled for security.");
    }
  }}
>
  {/* content */}
</div>
```

### 3.3 Visibility Blur

```tsx
// Inside PreviewModal
const [isVisible, setIsVisible] = useState(true);

useEffect(() => {
  function handleVisibility() {
    setIsVisible(!document.hidden);
  }
  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, []);

if (!isVisible) {
  return (
    <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
      <p className="text-muted-foreground text-sm">
        Tab switched — Content hidden for security
      </p>
    </div>
  );
}
```

### 3.4 CSS Protection

```css
.content-area {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.content-area img {
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: none;  /* Prevents drag-and-drop */
}
```

---

## 4. PDF Security

### Current: Google Docs Viewer
```
https://docs.google.com/viewer?url=${publicUrl}&embedded=true
```
- PDF is downloaded to Google's servers
- Raw URL is exposed in HTML source
- Print button is available
- Download button is available

### Recommended: react-pdf Based Viewer

```tsx
// src/components/ui/custom-pdf-viewer.tsx
"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Watermark } from "./watermark";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface CustomPdfViewerProps {
  signedUrl: string;
}

export function CustomPdfViewer({ signedUrl }: CustomPdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div className="relative" onContextMenu={(e) => e.preventDefault()}>
      <Watermark />
      <Document
        file={signedUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p className="text-center py-8">Loading PDF securely...</p>}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}     // Disable text selection
          renderAnnotationLayer={false}
          scale={1.2}
          onContextMenu={(e) => e.preventDefault()}
        />
      </Document>
      {numPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
            Previous
          </button>
          <span>{pageNumber} / {numPages}</span>
          <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### PDF Server-Side Watermarking

For stronger protection, watermark PDFs server-side before serving:

```typescript
// src/app/api/content/watermarked-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();

  // ... auth + enrollment validation ...

  const { data } = await supabase.storage
    .from("media")
    .download(storagePath);

  // Load PDF
  const pdfDoc = await PDFDocument.load(await data.arrayBuffer());
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  // Stamp each page
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(`Licensed to: ${studentName}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });
    page.drawText("Confidential — Do not share", {
      x: width - 200,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });
  }

  // Disable printing
  pdfDoc.setPrinting({ enabled: false });

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
```

---

## 5. Video Security

### Current: YouTube Embed
- Anyone with the YouTube URL can view/download
- No access control
- No watermark

### Recommended: HLS Streaming + Custom Player

#### 5.1 Video Upload Pipeline

```
Admin uploads video
  |
  v
POST /api/upload (file, folder: "videos")
  |
  v
Server receives file
  |
  v
FFmpeg converts to HLS:
  ffmpeg -i input.mp4 \
    -codec: h264 -crf 23 \
    -start_number 0 \
    -hls_time 10 \
    -hls_list_size 0 \
    -hls_key_info_file encryption.keyinfo \
    -hls_playlist_type vod \
    -hls_segment_filename "segments/%03d.ts" \
    output.m3u8
  |
  v
Upload .m3u8 + .ts segments to Supabase Storage
  |
  v
Store HLS playlist path in items table
```

#### 5.2 Encrypted HLS with DRM

```typescript
// Generate AES-128 encryption key for HLS
const crypto = require("crypto");
const key = crypto.randomBytes(16); // 128-bit key
const iv = crypto.randomBytes(16);  // Initialization vector

// Store key in environment or secure key management
// Serve key file via authenticated endpoint only
```

#### 5.3 Custom Video Player

```tsx
// src/components/ui/custom-video-player.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Watermark } from "./watermark";

interface CustomVideoPlayerProps {
  playlistUrl: string;  // Signed URL to .m3u8
}

export function CustomVideoPlayer({ playlistUrl }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Visibility blur
  useEffect(() => {
    function handleVisibility() {
      setIsVisible(!document.hidden);
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playlistUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl; // Native HLS support (Safari)
    }
  }, [playlistUrl]);

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center h-64 bg-black rounded-lg">
        <p className="text-white/60 text-sm">Content hidden for security</p>
      </div>
    );
  }

  return (
    <div className="relative" onContextMenu={(e) => e.preventDefault()}>
      <Watermark />
      <video
        ref={videoRef}
        controls
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        className="w-full rounded-lg"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
```

---

## 6. Audit Logging

### Database Schema

```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id),
  item_id UUID REFERENCES items(id),
  action TEXT NOT NULL CHECK (action IN (
    'content_view',
    'content_access_denied',
    'screenshot_attempt',
    'download_attempt',
    'tab_switch',
    'terms_accepted'
  )),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_student ON audit_log(student_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
```

### Logging Function

```typescript
// src/lib/audit.ts
import { createServerSupabase } from "./supabase-server";

interface AuditEvent {
  studentId: string;
  itemId?: string;
  action: "content_view" | "content_access_denied" | "screenshot_attempt" | "download_attempt" | "tab_switch" | "terms_accepted";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(
  event: AuditEvent,
  request?: Request
): Promise<void> {
  if (process.env.NEXT_PUBLIC_AUDIT_LOGGING_ENABLED !== "true") return;

  const supabase = createServerSupabase();
  await supabase.from("audit_log").insert({
    student_id: event.studentId,
    item_id: event.itemId,
    action: event.action,
    ip_address: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip"),
    user_agent: request?.headers.get("user-agent"),
    metadata: event.metadata,
  });
}
```

---

## 7. Rate Limiting

```typescript
// src/lib/rate-limit-content.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    parseInt(process.env.MAX_CONTENT_ACCESS_PER_HOUR || "100"),
    "1 h"
  ),
  analytics: true,
});

export async function checkContentRateLimit(studentId: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(
    `content:${studentId}`
  );
  return { success, limit, remaining, reset };
}
```

---

## 8. Legal Warning Modal

```tsx
// src/components/ui/content-warning.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface ContentWarningProps {
  studentName: string;
  onAccept: () => void;
}

export function ContentWarning({ studentName, onAccept }: ContentWarningProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show once per session
    const accepted = sessionStorage.getItem("content_terms_accepted");
    if (!accepted) {
      setOpen(true);
    } else {
      onAccept();
    }
  }, [onAccept]);

  function handleAccept() {
    sessionStorage.setItem("content_terms_accepted", "true");
    setOpen(false);
    onAccept();
  }

  return (
    <Modal open={open} onClose={() => {}} title="Content Usage Agreement">
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 leading-relaxed">
            All content on this platform is the intellectual property of
            <strong> Special Academy</strong>. You are granted a limited,
            non-transferable license to view this content for personal
            educational use only.
          </p>
          <p className="text-sm text-amber-800 leading-relaxed mt-2">
            You may <strong>NOT</strong> download, record, screenshot, copy,
            share, or distribute this content to any third party or other
            platform. Violations may result in account termination and legal
            action.
          </p>
        </div>
        <p className="text-xs text-muted text-center">
          Licensed to: {studentName}
        </p>
        <Button className="w-full" onClick={handleAccept}>
          I Understand
        </Button>
      </div>
    </Modal>
  );
}
```

---

## 9. Implementation Checklist

### Phase 1 — High Priority
- [ ] Make Supabase storage buckets private (media, images, pdfs)
- [ ] Create signed URL generation utility
- [ ] Create `/api/content/access` endpoint
- [ ] Create Watermark overlay component
- [ ] Add right-click prevention to PreviewModal
- [ ] Add keyboard shortcut blocking (Ctrl+S, Ctrl+P)
- [ ] Add visibility blur to PreviewModal
- [ ] Create ContentWarning legal modal
- [ ] Add "Do not share" banner in PreviewModal

### Phase 2 — Medium Priority
- [ ] Add server-side enrollment validation to content access
- [ ] Create audit_log table and logging
- [ ] Add rate limiting to content endpoints
- [ ] Add auth checks to `/api/media/*` routes
- [ ] Create `/dashboard/audit-log` admin page
- [ ] Add CSS protection (user-select, user-drag)

### Phase 3 — Low Priority
- [ ] Build custom PDF viewer with react-pdf
- [ ] Build custom video player with hls.js
- [ ] Add HLS conversion on video upload
- [ ] Add server-side PDF watermarking
- [ ] Add server-side image watermarking
- [ ] Add content usage API endpoint

---

## 10. Key Dependencies

```json
{
  "dependencies": {
    "react-pdf": "^9.0.0",
    "pdfjs-dist": "^4.0.0",
    "hls.js": "^1.5.0",
    "pdf-lib": "^1.17.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "@upstash/ratelimit": "^2.0.0",
    "@upstash/redis": "^1.0.0"
  }
}
```

> **Note**: `sharp` is already a dependency (used in `/api/media/optimize`).
> `react-pdf`, `hls.js`, `pdf-lib` need to be added.
> `@upstash/ratelimit` is optional — can implement in-memory rate limiting instead.
