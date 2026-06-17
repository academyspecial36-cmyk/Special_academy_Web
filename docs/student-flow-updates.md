# Student Flow — Required Updates

## 1. Content Security & Anti-Sharing Measures

### Problem
Course content (images, PDFs, videos) is served via public Supabase Storage URLs. Students can:
- Right-click and download images
- Download PDFs directly (Google Docs Viewer exposes the original URL)
- Download videos via browser dev tools
- Share URLs with non-enrolled users
- Take screenshots

### Required Changes

#### 1.1 Signed URLs (Time-Limited Access)
- **Replace all public Supabase storage URLs with signed URLs** that expire (e.g. 1 hour)
- Create a new API endpoint: `GET /api/content/signed-url?path=<storage-path>`
- The endpoint must:
  - Verify the student is authenticated and enrolled in the course
  - Call `supabase.storage.from('media').createSignedUrl(path, 3600)`
  - Return the signed URL
- Update `PreviewModal` to fetch signed URLs instead of using public URLs directly
- Store only storage paths (not public URLs) in the `items` table

#### 1.2 Server-Side Access Validation
- Create middleware or an API gateway that validates access to all course content
- Before serving any content, verify:
  - Student is authenticated (`user.role === 'student'`)
  - Student is enrolled in the course that owns the item
  - Item is not hidden
  - Course/subcategory is not hidden
- Apply this to:
  - `GET /api/student-courses` — list only enrolled courses
  - `GET /api/content/signed-url` — validate enrollment
  - Item completion endpoint — validate ownership

#### 1.3 Watermarking
- **Images**: Overlay student info (name, email) on images server-side using `sharp`
  - Create endpoint: `GET /api/content/watermarked-image?path=<path>&studentId=<id>`
  - Watermark text: "Licensed to: {studentName} — {email} — Do not share"
  - Position: diagonal across the image, semi-transparent
  - Cache watermarked images per student (short-lived cache)
- **PDFs**: Use a PDF library (pdf-lib) to stamp each page with student info
  - Create endpoint: `GET /api/content/watermarked-pdf?path=<path>&studentId=<id>`
  - Stamp header/footer with student name and "Confidential — Do not share"
  - Disable printing via PDF metadata flags
- **Videos**: Use HLS (HTTP Live Streaming) with tokenized segments
  - Convert uploaded videos to HLS format (via FFmpeg server-side)
  - Serve video segments via signed URLs
  - Overlay text watermark on video frames (via FFmpeg filter)

### Implementation Priority: HIGH

---

## 2. Legal Warnings & Consent

### Required Changes

#### 2.1 Content Access Warnings
- Show a modal/dialog **before** first content access that warns:
  > "All content on this platform is the intellectual property of Special Academy.
  > You are granted a limited, non-transferable license to view this content for
  > personal educational use only. You may NOT download, record, screenshot,
  > copy, share, or distribute this content to any third party or other platform.
  > Violations may result in account termination and legal action."
- Require student to click "I Understand" to proceed
- Show this warning once per session (store in `sessionStorage`)

#### 2.2 Persistent Banner
- Add a non-dismissible banner at the top of the PreviewModal:
  > "⚠️ This content is for your personal educational use only. Do not share or distribute."

#### 2.3 Terms Acceptance Tracking
- Log when a student accepts the content warning
- Add a `content_terms_accepted` field to the `profiles` or `students` table
- Require acceptance before any content can be viewed

### Implementation Priority: HIGH

---

## 3. Watermark Component (Client-Side)

### Required Changes
- Create `ClientWatermark` overlay component that renders on top of all content:
  - Semi-transparent text overlay: "Licensed to: {studentName}"
  - Rotated diagonal pattern across the content area
  - Uses CSS `pointer-events: none` so it doesn't interfere with interaction
  - Updates dynamically based on student info from auth context
- Integrate into `PreviewModal` for images and PDF iframes
- For videos, overlay via a positioned div above the iframe/player

### Implementation Priority: HIGH

---

## 4. Disable Context Menu & Keyboard Shortcuts

### Required Changes
- In `PreviewModal`, prevent:
  - Right-click context menu (`onContextMenu` → `e.preventDefault()`)
  - Common save shortcuts: `Ctrl+S`, `Cmd+S`
  - Print shortcuts: `Ctrl+P`, `Cmd+P`
  - Save-as shortcuts: `Ctrl+Shift+S`, `Cmd+Shift+S`
- Via CSS:
  - `user-select: none` on content areas
  - `-webkit-user-drag: none` on images
  - `pointer-events: none` on overlay elements

### Implementation Priority: MEDIUM

---

## 5. Screenshot Detection & Prevention

### Required Changes

#### 5.1 Visibility Blur
- When the browser tab loses focus (`visibilitychange` event), blur/replace content
- Show a placeholder: "Tab switched — Content hidden for security"
- Re-render content when tab regains focus

#### 5.2 Fullscreen API
- For videos, use the Fullscreen API to detect when user exits fullscreen
- Pause video playback when user exits fullscreen (common screen recording pattern)

#### 5.3 Clipboard Monitoring
- Warn/detect attempts to copy content (images, text from PDFs)
- Not fully preventable but visible warnings act as deterrent

### Implementation Priority: MEDIUM

---

## 6. PDF Viewer — Replace Google Docs Viewer

### Problem
Google Docs Viewer:
- Downloads the PDF to Google's servers (privacy concern)
- Exposes the raw URL in the page source
- Allows printing and downloading
- Does not enforce any access control

### Required Changes
- Build or integrate a custom PDF viewer:
  - **Option A**: Use `react-pdf` / `pdfjs-dist` to render PDFs client-side
    - Render each page as a canvas element
    - Disable right-click on canvas
    - Disable text selection
    - Disable printing
    - Load PDF via signed URL
  - **Option B**: Use a server-side PDF renderer
    - Convert PDF pages to images server-side (via `sharp` or ImageMagick)
    - Serve pages as images with watermark overlay
    - Prevents all text copying
  - **Recommended**: Option A (react-pdf) + watermark overlay

### Implementation Priority: HIGH

---

## 7. Video Player — Custom Build

### Problem
Current implementation uses a raw YouTube iframe. Students can:
- Download via third-party tools
- Share the YouTube URL
- Access the underlying video file URL

### Required Changes
- **Self-host video content** — upload videos to Supabase Storage (not YouTube)
- **HLS streaming** — Convert uploaded videos to HLS (`.m3u8` + `.ts` segments)
  - Use FFmpeg server-side on upload
  - Store HLS playlist in Supabase Storage
- **Custom video player** using `hls.js`:
  - Serve segments via signed/expiring URLs
  - Disable right-click on player
  - Disable native context menu
  - Overlay student watermark
  - Remove download button
  - Disable picture-in-picture (via `disablePictureInPicture` attribute)
  - Detect and prevent screen recording (visibility change blur)
- **Replace YouTube embeds** — migrate existing YouTube links to self-hosted HLS

### Implementation Priority: HIGH (for self-hosted) / LOW (for YouTube-only)

---

## 8. Audit Logging & Monitoring

### Required Changes
- Create an `audit_log` table in Supabase:
  ```sql
  CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id),
    item_id UUID NOT NULL REFERENCES items(id),
    action TEXT NOT NULL, -- 'view', 'download_attempt', 'screenshot_attempt'
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- Log events:
  - Content viewed (item_id, student_id, timestamp)
  - Download attempts (right-click, Ctrl+S usage)
  - Tab switch events (potential recording)
  - Share attempts (URL copy detection)
- Create an admin dashboard view for audit logs
- Flag suspicious activity (e.g., >100 items viewed in 10 minutes)

### Implementation Priority: MEDIUM

---

## 9. API Security Hardening

### Required Changes

#### 9.1 Student Courses API
- Add server-side enrollment validation
- Return only courses the student is enrolled in
- Hide content URLs for unenrolled students

#### 9.2 Media API
- Add authentication checks to `/api/media/*` (currently uses service role bypass)
- Restrict media access to enrolled students only
- Create a separate read-only endpoint for student content access

#### 9.3 Rate Limiting
- Add rate limiting to content access endpoints
- Prevent bulk download/scraping attempts

### Implementation Priority: MEDIUM

---

## 10. Environment & Configuration

### Required Changes
- Add to `.env.example`:
  ```
  CONTENT_SIGNED_URL_EXPIRY=3600          # seconds
  WATERMARK_ENABLED=true
  WATERMARK_TEXT="Licensed to: {name} — {email} — Do not share"
  HLS_ENABLED=true
  AUDIT_LOGGING_ENABLED=true
  MAX_CONTENT_ACCESS_PER_HOUR=100
  ```

### Implementation Priority: LOW

---

## Files That Need Changes

### Student Portal
| File | Changes Required |
|---|---|
| `src/components/ui/preview-modal.tsx` | Signed URLs, watermark overlay, right-click prevention, keyboard shortcut blocking, visibility blur, custom PDF viewer, custom video player |
| `src/app/student/courses/[id]/page.tsx` | Server-side enrollment validation, audit logging, content warning modal |
| `src/app/student/courses/page.tsx` | Server-side filtering of enrolled courses |
| `src/app/student/layout.tsx` | Terms acceptance check, global content warning |
| `src/app/student/page.tsx` | Dashboard stats with secure content counts |

### Admin Dashboard
| File | Changes Required |
|---|---|
| `src/app/dashboard/media/page.tsx` | Add watermark configuration per file, signed URL toggle |
| `src/app/dashboard/courses/[id]/page.tsx` | Add content security settings (watermark, HLS toggle), video conversion trigger |
| `src/app/dashboard/courses/page.tsx` | Content security status indicators |

### New Files Needed
| File | Purpose |
|---|---|
| `src/lib/content-security.ts` | Signed URL generation, watermark helpers, HLS utilities |
| `src/components/ui/watermark.tsx` | Reusable watermark overlay component |
| `src/components/ui/custom-pdf-viewer.tsx` | Secure PDF viewer using pdfjs-dist |
| `src/components/ui/custom-video-player.tsx` | Secure video player using hls.js |
| `src/components/ui/content-warning.tsx` | First-access legal warning modal |
| `src/app/api/content/signed-url/route.ts` | Signed URL generation endpoint |
| `src/app/api/content/watermarked-image/route.ts` | Watermarked image serving |
| `src/app/api/content/watermarked-pdf/route.ts` | Watermarked PDF serving |
| `src/app/api/content/audit-log/route.ts` | Audit logging endpoint |
| `src/middleware.ts` | Route protection middleware |
| `src/app/dashboard/audit-log/page.tsx` | Admin audit log viewer |

### API Routes
| Route | Changes Required |
|---|---|
| `src/app/api/student-courses/route.ts` | Add enrollment validation, hide URLs for non-enrolled |
| `src/app/api/media/route.ts` | Add auth checks (admin only for management) |
| `src/app/api/upload/route.ts` | Add video-to-HLS conversion on upload |
| `src/lib/api/crud-handlers.ts` | Add access control checks for content tables |

### Context
| File | Changes Required |
|---|---|
| `src/lib/context/courses-context.tsx` | Add secure URL fetching, audit logging integration |

---

## Implementation Order

1. **Phase 1 — Immediate (Security)**:
   - Signed URLs (1.1)
   - Legal warnings (2.1, 2.2)
   - Right-click prevention (4)
   - Watermark overlay component (3)

2. **Phase 2 — Access Control**:
   - Server-side enrollment validation (1.2)
   - API security hardening (9)
   - Audit logging (8)

3. **Phase 3 — Deep Security**:
   - Watermarking server-side (1.3)
   - Custom PDF viewer (6)
   - Custom video player with HLS (7)
   - Screenshot detection (5)

4. **Phase 4 — Polish**:
   - Admin dashboards (audit log viewer)
   - Environment configuration (10)
   - Terms acceptance tracking (2.3)
