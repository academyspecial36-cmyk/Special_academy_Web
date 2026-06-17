# RLS Policy Audit

## Tables and Their RLS Status

### Tables WITH RLS policies verified:

| Table | RLS Enabled | Policy | Notes |
|---|---|---|---|
| `ai_conversations` | Yes | Users can manage own conversations | `user_id = auth.uid()` |
| `ai_messages` | Yes | Users can manage own messages | Ownership via parent conversation |
| `notifications` | Yes | Users can manage own notifications | `user_id = auth.uid()` |
| `contact_submissions` | Yes | Public insert, admin read/update/delete | |
| `notes` | Yes | Admin full access | |
| `media_folders` | Yes | Admin full access | |
| `media` | Yes | Admin full access | |
| `ai_documents` | Partial | Has policies defined | Checked in ai-migration.sql |

### Tables WITHOUT RLS policies (gaps):

| Table | Risk | Mitigation |
|---|---|---|
| `profiles` | User profiles exposed to all | Service-role-only in crud-handlers.ts but should have RLS |
| `students` | Student PII data | Currently accessed via service role |
| `enrollments` | Enrollment records | Currently accessed via service role |
| `courses` | Course data | Read access should be public, write restricted |
| `subcategories` | Subcategory data | Should inherit course RLS |
| `items` | Course content | Should inherit course RLS |
| `communications` | Message history | Admin-only via API guard |
| `communication_templates` | Templates | Admin-only via API guard |
| `communication_recipients` | Recipient PII | Admin-only via API guard |
| `exam_categories` | Exam config | Admin-only via API guard |
| `questions` | Exam content | Should scope to exam |
| `exam_attempts` | Student attempt data | Students should see own only |
| `exam_answers` | Student answers | Students should see own only |
| `progress` | Student progress | Students should see own only |
| `gallery_images` | Gallery assets | Public read, admin write |
| `testimonials` | Testimonials | Public read, admin write |
| `faculty_members` | Faculty data | Public read, admin write |
| `notices` | Notices | Public read, admin write |
| `faqs` | FAQ data | Public read, admin write |
| `blog_posts` | Blog content | Public read published, admin all |

## Recommended Priority Actions

1. **High**: Add RLS to `students`, `enrollments`, `exam_attempts`, `exam_answers`, `progress` — these contain PII or per-user data that must be isolated.
2. **Medium**: Add RLS to `communications`, `communication_recipients`, `communication_templates` — admin-only tables that currently rely on API-level guards.
3. **Low**: Add RLS to public-facing tables (`courses`, `notices`, `faqs`, `blog_posts`, `gallery_images`, `testimonials`, `faculty_members`) — these should allow public read but restrict writes to admin role.

## Current Mitigation

The backend already restricts access at the API layer:
- `RESTRICTED_TABLES` in `table-config.ts` forces service-role access for: `enrollments`, `students`, `exam_answers`, `progress`, `profiles`, `contact_submissions`
- `requireAdmin()` guard is applied before data access for restricted tables
- Non-restricted tables still use the service role when the user is an admin (see `crud-handlers.ts` lines 21-22)
