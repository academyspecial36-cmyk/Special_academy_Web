# Cadet Academy — Next-Phase Robustness Plan

## 1. Performance
- **Image optimization**: Add server-side image resizing for uploads (Supabase img resize props or Sharp); replace raw `<img>` with Next.js `Image` component where feasible.
- **Pagination**: Add cursor-based pagination to all list API endpoints (students, communications history, templates, notifications). Currently all data is fetched at once.
- **Virtualization**: Use `react-window` or `@tanstack/virtual` for long lists (notification dropdown, student tables).
- **Bundle splitting**: Audit dynamic imports for heavy libraries (Framer Motion, Lucide icons). Replace full-icon imports with tree-shakeable single imports (already partially done).

## 2. Testing
- **Unit tests**: Add Vitest with React Testing Library for all new components (settings/*, guide/*, ai/*, ui/*). Focus on state transitions and edge cases.
- **API tests**: Add integration tests for CRUD handlers (`/api/data/[table]`) using a test Supabase instance or mocking.
- **E2E tests**: Set up Playwright for critical paths: login → course creation → item upload → notification delivery.

## 3. CI/CD
- **GitHub Actions**: Add workflow for `tsc --noEmit` + `next lint` + `vitest run` on every PR. Add build check.
- **Preview deployments**: Wire Vercel/Netlify preview deploys for PR branches.
- **Automated migrations**: Run Supabase migrations in CI before E2E tests.

## 4. Error Handling & Monitoring
- **Error boundaries**: Wrap each top-level page/dashboard section in a React error boundary with fallback UI and retry.
- **Structured logging**: Replace `console.error` with a structured logger (e.g., Pino) that tags errors by source, action, and user context. Forward to a log sink.
- **API error normalization**: Standardize error response shape across all API routes (`{ success, error, data }`). Currently some routes return raw Supabase errors.
- **User-facing errors**: Replace bare `toast.error("Failed to...")` with specific error messages from the server.

## 5. Security
- **RLS audit**: Verify all Supabase tables have RLS policies that enforce user isolation. Currently `ai_conversations` and `ai_messages` rely on RLS, but other tables (e.g., `enrollments`) need verification.
- **HTML sanitization**: Sanitize email HTML bodies with DOMPurify (server-side) before sending to prevent XSS in email clients.
- **Rate limiting**: Add rate limiting to `/api/ai/chat` and `/api/communications/send` to prevent abuse.
- **File upload validation**: Validate file types and sizes server-side (currently only client-side checks).

## 6. Global Readiness (i18n)
- **Extract strings**: Move all user-facing text into locale JSON files. Start with en.json.
- **Date/time formatting**: Replace manual formatting with `Intl.DateTimeFormat` using a configurable locale. Eliminate hardcoded "en-US".
- **RTL support**: Audit layouts for RTL compatibility (flex-direction, margin/padding logical properties).

## 7. TypeScript Hardening
- **Eliminate `any`**: Audit and replace all `as any` casts (currently in course page, chat interface, settings page) with proper generics or type guards.
- **API client types**: Generate TypeScript types from Supabase schema using `supabase gen types`.
- **Strict mode**: Enable `strict: true` in tsconfig and fix remaining implicit-any errors.

## 8. Accessibility
- **ARIA labels**: Add `aria-label` to all icon-only buttons (notification bell, delete icons, toggle buttons).
- **Keyboard navigation**: Ensure all modals trap focus (use a11y-first modal component). Add Escape-to-close to all overlays.
- **Color contrast**: Audit against WCAG AA for all status badges and notification indicators.

## 9. Data Management
- **Optimistic update rollback**: Add rollback logic when fire-and-forget API calls fail (currently errors are silently caught).
- **Caching layer**: Add SWR or TanStack Query for data fetching (replace manual `useEffect` + `fetch` patterns).
- **Offline support**: Service worker for caching static assets and queueing writes.

## 10. AI Chatbot Improvements
- **Conversation export**: Add export-to-Markdown/PDF for conversation history.
- **Stream reliability**: Add reconnection logic for interrupted SSE streams.
- **Token limit handling**: Surface context-window warnings when approaching token limits.
