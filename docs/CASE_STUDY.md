# Cadet Academy — Full-Stack Admin & Student Portal Case Study

## Overview

Cadet Academy is a comprehensive education management platform built for a cadet preparation institute in Nepal. The platform serves two primary user roles — **admins** who manage the academy's operations and **students** who consume learning content and track their progress — all within a single Next.js application backed by Supabase.

The goal was to replace manual, paper-based workflows with a modern, responsive web application that handles the entire enrollment-to-graduation lifecycle, live classes with browser-based recording, email communications, content management, analytics tracking, and an AI-powered assistant for admin operations.

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password) |
| **Storage** | Supabase Storage (images, PDFs, recordings) |
| **Email** | Resend |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |

---

## Phase 1: Core Infrastructure & Enrollment Lifecycle

### Challenge

The academy had no digital enrollment system. Students applied via paper forms, admins manually verified and approved applicants, and there was no way to track status across the funnel: apply → verify → approve/reject → enroll.

### Solution

We built a complete enrollment lifecycle:

- **Multi-step enrollment form** (`/enrollment`): Personal info → qualification → documents → verification code. All errors display inline, never as toasts.
- **Verification code flow**: 6-digit code sent via email, 60-second resend cooldown, service-role API to generate and store codes securely.
- **Pre-auth student check**: Before `signInWithPassword()` runs, a service-role endpoint (`/api/check-student-status`) queries the `students` table by email. Blocked students receive an error with a clickable phone link (`dangerouslySetInnerHTML`). Admin logins skip this check entirely.
- **Admin review dashboard**: Approve/reject with confirmation modal + mandatory rejection reason. On approval, a `students` record is created (using `qualification_id` FK), the `profiles` table is synced (name/email/phone), and an email notification is sent.
- **Bulk operations**: Multi-select checkboxes on both Enrollments and Students pages, bulk delete with `DeleteModal` confirmation, dedicated `DELETE` endpoints for single and bulk operations.

### Key Decisions

- `enrollments` uses `qualification_id` (not `class`) after a prior migration aligned the schema.
- Student status check fires **before** Supabase auth to prevent blocked users from ever creating a session.
- Inline errors keep users in context rather than forcing them to find a toast notification.

---

## Phase 2: Content Management System

### Challenge

The academy needed a structured way to organize learning materials — courses with chapters and items, exams with categories and subcategories, faculty profiles, notices, FAQs, testimonials, blog posts, and a gallery — all manageable by non-technical staff.

### Solution

- **Courses**: CRUD with dynamic category/qualification fields sourced from context via `useMemo`. Reorderable subcategories (chapters) and items within each chapter. Rich media support (images, PDFs).
- **Exams**: Two-level hierarchy (category → subcategory). Question bank with CRUD, add questions in bulk, track attempts with scoring.
- **File management**: Media Library with upload/download. A "My Storage" page lists all Supabase buckets dynamically, shows storage usage against a 1 GB limit, and flags files as "In Use" (referenced by content) vs "Orphaned" (deletable).
- **Breadcrumbs**: Context-based (`BreadcrumbProvider`) so each page supplies resolved names (course title, category name) instead of raw IDs.

---

## Phase 3: Live Classes with Browser Recording

### Challenge

The academy conducts live online classes via Zoom/Google Meet, but there was no way to track sessions, notify students, or record them for later review within the platform.

### Solution

- **Admin CRUD**: Card grid with search + status filter (`scheduled`/`live`/`completed`/`cancelled`), add/edit via `FormModal` with datetime picker and 9-color preset dropdown.
- **ScreenRecorder component**: Uses `getDisplayMedia()` + `MediaRecorder` to capture the instructor's screen in 10-second chunks. Each chunk is uploaded to Supabase Storage (`recordings/` folder) via the existing `apiUpload` helper (extended with `"recordings"` type).
- **Recording chunks**: Stored as JSONB array on the `live_classes` row. Admin detail page shows a list of chunks with preview (video modal), download, and delete (orphaned only).
- **Student view**: Upcoming (join link, countdown) and past (recording chunks with playback modal) classes.
- **Color presets**: 9 colors (Blue/Green/Red/Purple/Orange/Pink/Teal/Yellow/Slate) — admin selects during creation, shown as swatches in edit modal and as the card accent in the student view.

---

## Phase 4: Email Template System

### Challenge

Emails (enrollment verification, approval, rejection, password reset) were hardcoded HTML strings. Non-technical staff couldn't customize branding, colors, or messaging without developer intervention.

### Solution

- **Config-based templates**: `communication_templates` table with `category`, `body` (HTML with `{{variables}}` placeholders), and `config` (JSONB storing visual sections).
- **Visual template editor**: Collapsible sections — Basic Info, Header Design (logo toggle, tagline, badge), Content (subject, heading, message with color picker), Button (toggle, text, URL, color), Footer (color, contact info toggle, custom text). Live preview with mock data. Reset-to-default per category.
- **Dual rendering path**: At send time, if `config` exists, `renderConfigTemplate()` calls `generateEmailHtml(config, settings)` to produce fresh branded HTML. Legacy templates (no `config`) use the old `baseLayout()` wrapper.
- **Category starters**: `STARTER_CONFIGS` per category (enrollment, approval, rejection, password_reset) auto-fill on category selection.
- **Absolute logo URLs**: Built at send time from live `settings.appIcon` + `settings.website`, never relative paths.

---

## Phase 5: Analytics System

### Challenge

Zero insight into platform usage — page views, registrations, exam engagement, content imports. No data to drive decisions.

### Solution

- **Tracking tables**: `analytics_sessions` (visitor tracking) and `analytics_events` (all events with unique `event_id`). RLS enabled; only service-role can write.
- **Server-side tracking API** (`POST /api/analytics/track`): Validates auth, creates/reuses visitor UUID cookies, inserts events with `ON CONFLICT (event_id) DO NOTHING` for silent dedup.
- **Client helper** (`trackPageView` / `trackEvent`): 30-second `sessionStorage` dedup per route. `navigator.sendBeacon` for reliable delivery. `crypto.randomUUID()` for event IDs.
- **PageViewTracker**: Client component in root layout that fires on route change, excludes `/admin/*` and `/_next` paths.
- **Business events**: Registration, login (once per user/day), exam started/submitted (with score metadata), questions saved, PDF imported — fire **after** the DB action succeeds.
- **Admin dashboard**: Date range filter (Today/7D/30D/90D), stat cards with growth badges, bar chart, top pages table, top exams table with completion rate badges, platform totals sidebar. Designed with border-left accent cards matching dashboard style.
- **Student dashboard**: "My Exam Activity" card using `attempts` table — started/completed/rate/avg-score with recent attempts.

---

## Phase 6: Password Reset Flow

### Challenge

Students had no self-service way to reset forgotten passwords. Admins had to manually intervene.

### Solution

- `password_resets` migration table + 3 API routes (`send-code`, `verify-code`, `reset`).
- Multi-step UI: email → code → new password → success.
- Eye icon toggle on password fields for visibility.
- `sendPasswordResetEmail()` function in `email.ts` with config-based template support.

---

## Phase 7: Theming & Dynamic UI

### Challenge

The platform needed to feel branded with the academy's identity — but colors and fonts were hardcoded, making rebranding a developer task.

### Solution

- **ThemeProvider**: Reads `settings.config.theme.primaryColor` and `settings.config.theme.fontFamily`. Sets CSS custom properties (`--primary`, `--primary-50` through `--primary-900`, `--font-sans`) via `useInsertionEffect`.
- **Settings page**: Color picker + font family dropdown (Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Nunito, Raleway, Playfair Display, Merriweather). Live preview card. Persisted to DB.
- **Analytics page stat cards**: Replaced hardcoded emerald/amber/violet colors with primary shade variants, cycled by index.
- **Student live classes**: Dynamic primary shades for card accents, borders, and backgrounds.

---

## Phase 8: Command Palette & Navigation

### Challenge

Admins had to click through sidebar menus to find pages. No keyboard-driven navigation existed.

### Solution

- **CommandPalette component**: Hit `/` or `Ctrl+K` to open a modal overlay. Searches all sidebar pages (DASHBOARD_SIDEBAR for admin, STUDENT_NAV for student). Sections group pages logically. Arrow key navigation + Enter to go.
- **CommandHint**: Small badge in the top bar: "Type / to open command palette for fast navigation".
- **AI Command Center integration**: The palette also surfaces AI commands (Create notice, Generate MCQs, etc.) for the AI page.

---

## Phase 9: Student Dashboard Redesign

### Challenge

The student dashboard was functional but plain — static stat cards, no visual engagement, no quick actions.

### Solution

- **Quick Actions bar**: 4-card row (Courses, Live Classes, Exams, Notices) with icon + description + hover arrow.
- **Progress Ring**: SVG donut chart replacing the plain "Overall Progress" card, animated on render.
- **Achievement Badges**: 2×2 grid — First Exam, Perfect Score, 50% Progress, 100% Done. Earned badges highlighted, unearned are dashed/ghosted.
- **Upcoming Live Classes widget**: Fetches from API, shows next 3 classes (green = live, amber = within 1hr), external link.
- **Exam Mini Chart**: Bar sparkline of last 5 exam scores.
- **Recent Activity Timeline**: Merges completed course items + exam attempts, sorted by date.
- **All existing sections preserved** with consistent icon headers.

---

## Architecture & Data Flow

### Auth Flow

```
Student Login:
  login() → POST /api/check-student-status (service-role)
    → if blocked: return error with phone link
    → signInWithPassword() → create Supabase session

Admin Login:
  login() → signInWithPassword() directly (no check)
```

### Email Flow

```
sendEmail(category, vars)
  → fetchTemplateByCategory(category)
  → if template.config exists:
      renderConfigTemplate(template, vars, settings)
        → generateEmailHtml(config, settings) ← live branding
    else:
      renderTemplate(template, vars)
        → replace {{variables}} in body
        → wrap in baseLayout(settings)
  → resend.emails.send()
```

### Analytics Flow

```
Page View:
  PageViewTracker detects route change
    → sessionStorage check (30s dedup per route)
    → POST /api/analytics/track { type: "page_view", path, ... }
    → server validates auth, sets visitor/session cookies
    → INSERT INTO analytics_events (event_id UNIQUE)
    → on conflict 23505: silent success

Business Event (e.g., exam submitted):
  After addAttempt() succeeds:
    → trackEvent("exam_submitted", { examId, subId, score, total })
    → POST /api/analytics/track
    → same server flow
```

### Recording Flow

```
Instructor starts recording:
  ScreenRecorder component
    → getDisplayMedia() (user selects screen/window)
    → MediaRecorder with timeslice: 10000ms
    → ondataavailable: upload chunk to recordings/ bucket
    → append chunk { url, duration, createdAt } to live_classes.recordingChunks JSONB
```

---

## Database Schema Highlights

| Table | Purpose |
|-------|---------|
| `profiles` | User metadata (name, email, phone, role, avatar) |
| `students` | Student records (FK to qualifications, join date, status) |
| `enrollments` | Enrollment applications (status, qualification_id) |
| `courses` | Course definitions with category FK |
| `subcategories` | Chapters within courses |
| `items` | Learning materials within chapters |
| `exam_categories` | Exam groupings |
| `exam_subcategories` | Individual exams |
| `questions` | Question bank |
| `attempts` | Student exam attempts with scores |
| `live_classes` | Live session metadata + recording_chunks JSONB |
| `communication_templates` | Email templates with config JSONB |
| `password_resets` | Password reset codes |
| `analytics_sessions` | Visitor sessions |
| `analytics_events` | All analytics events (event_id unique) |
| `settings` | Academy settings + landing config + theme config |
| `notices`, `faqs`, `testimonials`, `gallery_images`, `blog_posts`, `faculty_members` | Content tables |

---

## Key Design Patterns

### Dynamic Theming
- ThemeProvider reads `settings.config.theme` → sets CSS vars → Tailwind references them → all components react.
- No hardcoded brand colors in component code; all reference `--primary-*` shades or use `bg-primary/5` etc.

### Service-Role for Pre-Auth Ops
- Endpoints like `/api/check-student-status` and `/api/analytics/track` use `createClient()` with `service_role` key so they can query/write before the user has an authenticated session or without exposing RLS to unauthenticated requests.

### Config-Driven Email
- Templates stored in DB with both `body` (legacy HTML + variables) and `config` (structured sections).
- `generateEmailHtml(config, settings)` produces current-branded output at send time — no stale HTML.

### Silent Dedup
- Analytics events use `event_id` UNIQUE constraint + `ON CONFLICT DO NOTHING` + `catch 23505` → duplicate events never error.

### Breadcrumb Context
- Instead of parsing the URL path, pages call `setSegments([...])` with resolved labels. Layout renders them. This decouples breadcrumbs from routing.

---

## Outcomes

- **Zero TypeScript errors** (`tsc --noEmit` passes cleanly)
- **Zero lint warnings** (`next lint` clean)
- End-to-end enrollment flow: apply → verify → admin approve → student login → access courses
- Self-service password reset reducing admin support tickets
- Configurable branding (colors, fonts) without code changes
- Analytics visibility into page views, registrations, exam engagement, and content usage
- Keyboard-driven navigation (command palette) for power users
- Browser-based screen recording without third-party software
- Email templates editable by non-technical staff via visual editor
