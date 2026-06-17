# Student Flow — Mobile App (React Native / Expo)

## 1. Authentication & Session

### 1.1 Token-Based Auth
- Replace cookie/session auth with **JWT tokens** from Supabase
- Store access token + refresh token in `expo-secure-store` (not AsyncStorage)
- Automatic token refresh on 401 responses
- Biometric unlock option (fingerprint / face ID) via `expo-local-authentication`

### 1.2 API Client Layer
- Create a shared API client (`src/mobile/lib/api-client.ts`) that:
  - Attaches `Authorization: Bearer <token>` header to every request
  - Handles 401 → silent refresh → retry
  - Uses a base URL from env (`EXPO_PUBLIC_API_URL`)
- All API calls go through this client, not through Next.js routes

### 1.3 Mobile API Endpoints (new)
| Endpoint | Purpose |
|---|---|
| `POST /api/mobile/auth/login` | Login with email/password, returns JWT |
| `POST /api/mobile/auth/refresh` | Refresh expired token |
| `POST /api/mobile/auth/logout` | Invalidate token server-side |
| `GET /api/mobile/student/profile` | Student profile (name, email, enrolled courses) |

---

## 2. Content Display — Mobile-Specific

### 2.1 Course List & Detail
- **`GET /api/mobile/student/courses`** — enrolled courses with progress
- **`GET /api/mobile/student/courses/:id`** — single course with chapters + items
- Response is pure JSON (no SSR), mobile renders native screens
- Items include `storagePath` instead of public URLs — mobile fetches signed URLs

### 2.2 Content Viewing
- **`GET /api/mobile/content/signed-url?path=<path>`** — signed URL with enrollment check
  - Returns `{ url: string, expiresAt: number }`
  - Mobile caches the URL until expiry
- **`GET /api/mobile/content/watermarked-image?path=<path>`** — server-rendered watermark
  - `sharp` overlays student info diagonally
  - Returns image blob, not redirect (mobile can't follow redirects reliably)

### 2.3 Offline Support
- Download content for offline viewing via `expo-file-system`
- Track offline downloads in local SQLite (via `expo-sqlite`)
- Sync completion data when back online
- Expire offline content after 72 hours

---

## 3. Anti-Sharing — Mobile Security

### 3.1 Screenshot Detection
- Android: `expo-screen-capture` → `addScreenshotListener` → blur content + log
- iOS: `UIScreenCapturedDidChange` notification (detect screen recording too)
- On detection: replace content with "Content hidden for security" + log to `audit_log`

### 3.2 Screen Recording Prevention
- iOS: `UIScreen.isCaptured` polling (React Native `AppState` listener)
- Android: `MediaProjection` detection (limited API support)
- Pause video on recording detection
- Log all recording attempts to `audit_log`

### 3.3 Block Saving to Gallery
- Long-press / save-gesture prevention on images
- Use `Image` with `shouldHide` for native image components
- Disable `expo-media-library` write permissions in app config

### 3.4 Share Sheet Prevention
- Prevent system share sheet from appearing on content screens
- iOS: `UIActivityViewController` blocking via native module
- Android: `Intent` filtering to block share intents on content Activity

### 3.5 Clipboard Blocking
- Prevent copy/paste in text fields and on content views
- Remove `selectable` prop from `Text` components
- Use custom `TextInput` that disables clipboard actions

### 3.6 App State Blur
- `AppState` listener: on `background` / `inactive` → blur content
- Show overlay: "App switched — Content hidden for security"
- Clear content from memory when backgrounded for > 30 seconds

---

## 4. Watermark — Mobile Client

### 4.1 Native Watermark Overlay
- No CSS `pointer-events: none` — use React Native `pointerEvents="none"`
- Diagonal repeating text: "Licensed to: {studentName}" using `react-native-svg`
- Apply over images, PDF renders, and video players
- Harder to remove than CSS overlays

### 4.2 Server-Side Watermark (Fallback)
- Same API as web (`GET /api/mobile/content/watermarked-image?path=...`)
- Used when device doesn't support overlay rendering
- Cached per student for performance

---

## 5. Push Notifications

### 5.1 Notice & Announcement Push
- Expo Push Notifications (`expo-notifications`)
- Register device token on login → `POST /api/mobile/notifications/register`
- Server sends push when admin creates/publishes a notice
- Notification data includes `{ noticeId, title, type: "notice" }`
- Tap notification → deep link to notice detail

### 5.2 Course Update Push
- Push when new content is added to an enrolled course
- Push when exam results are published
- Silent push for content sync triggers

### 5.3 Notification Preferences
- `PATCH /api/mobile/student/notifications/preferences`
- Per-category toggle: notices, course updates, exam results, promotions

---

## 6. Deep Linking

### 6.1 Link Structure
```
cadetacademy://courses/{courseId}
cadetacademy://courses/{courseId}/chapter/{subcategoryId}
cadetacademy://notices/{noticeId}
cadetacademy://exams/{examId}/result
```

### 6.2 Configuration (app.json)
- `"scheme": "cadetacademy"` in Expo config
- Handle incoming links via `Linking.addEventListener`
- Verify authenticated session before navigating

---

## 7. Audit Logging — Mobile

### 7.1 Local Audit Queue
- Queue audit events locally when offline
- Sync to `POST /api/mobile/audit/log` when online
- Events: `view`, `screenshot_attempt`, `recording_attempt`, `share_attempt`, `download_attempt`

### 7.2 `POST /api/mobile/audit/log`
```json
{
  "events": [
    { "action": "view", "itemId": "uuid", "timestamp": "ISO" },
    { "action": "screenshot_attempt", "itemId": "uuid", "timestamp": "ISO" }
  ]
}
```

---

## 8. API Design (Mobile-Optimized)

### 8.1 Batch Endpoints
- Combine multiple small requests into one:
  - `GET /api/mobile/bootstrap` — returns courses, notices, profile, progress in single call
- Reduce number of round-trips (mobile networks are slower)

### 8.2 Pagination
- All list endpoints use cursor-based pagination
- Response includes `{ data: [...], nextCursor: string | null }`
- Default page size: 20

### 8.3 Caching Headers
- Server returns `Cache-Control: private, max-age=60` for content lists
- Signed URLs: client caches until `expiresAt`
- `ETag` support for conditional requests

### 8.4 Error Responses
- Standardized: `{ error: string, code: string, details?: any }`
- Codes: `TOKEN_EXPIRED`, `NOT_ENROLLED`, `CONTENT_HIDDEN`, `RATE_LIMITED`

---

## 9. Mobile-Sensitive Files (Project Map)

### New Mobile Files
| File | Purpose |
|---|---|
| `src/mobile/lib/api-client.ts` | JWT auth client with refresh + retry |
| `src/mobile/lib/offline-storage.ts` | Local SQLite for offline content + queue |
| `src/mobile/lib/push-notifications.ts` | Registration, handler, deep link routing |
| `src/mobile/lib/screenshot-detector.ts` | Screenshot + screen recording detection |
| `src/mobile/components/watermark.tsx` | Native SVG diagonal watermark overlay |
| `src/mobile/components/content-blur-overlay.tsx` | App state blur overlay |
| `src/mobile/components/pdf-viewer.tsx` | react-native-pdf wrapper with security |
| `src/mobile/components/video-player.tsx` | expo-av / react-native-video with watermark |
| `src/mobile/screens/courses/[id].tsx` | Course detail screen (native) |
| `src/mobile/screens/courses/index.tsx` | Enrolled courses list |
| `src/mobile/screens/notices/index.tsx` | Notices list with push-tap handling |
| `src/mobile/screens/auth/login.tsx` | Login screen with biometric opt |

### Shared API Routes (Mobile-Facing)
| Route | Purpose |
|---|---|
| `src/app/api/mobile/auth/login/route.ts` | Login, return JWT + profile |
| `src/app/api/mobile/auth/refresh/route.ts` | Token refresh |
| `src/app/api/mobile/student/courses/route.ts` | Enrolled courses with progress |
| `src/app/api/mobile/student/profile/route.ts` | Student profile |
| `src/app/api/mobile/content/signed-url/route.ts` | Signed URL with enrollment check |
| `src/app/api/mobile/content/watermarked-image/route.ts` | Server-watermarked image |
| `src/app/api/mobile/audit/log/route.ts` | Batch audit log ingestion |
| `src/app/api/mobile/notifications/register/route.ts` | Push token registration |
| `src/app/api/mobile/notifications/preferences/route.ts` | Notification preferences |
| `src/app/api/mobile/bootstrap/route.ts` | All data in one call |

### Database
| Table | Mobile-Specific Changes |
|---|---|
| `audit_log` | Same schema, mobile sends batch events |
| `notifications` | Add `push_sent_at`, `push_opened_at` columns |
| `profiles` | Add `push_token`, `biometric_enabled`, `offline_preferences` (JSONB) |

---

## 10. Implementation Order (Mobile-Facing)

1. **Phase 1 — Core**:
   - JWT auth + API client
   - Mobile bootstrap endpoint
   - Course list + detail screens
   - Signed URL content delivery

2. **Phase 2 — Security**:
   - Screenshot + recording detection
   - App state blur
   - Server-side watermark
   - Share sheet / clipboard blocking

3. **Phase 3 — Engagement**:
   - Push notifications (notices, course updates)
   - Deep linking
   - Audit logging

4. **Phase 4 — Offline**:
   - Offline content download + sync
   - Local audit queue
   - Biometric auth
