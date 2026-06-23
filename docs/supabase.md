## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `role` | `text` |  |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `academy_name` | `text` |  Nullable |
| `tagline` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `admission_email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `secondary_phone` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `office_hours` | `text` |  Nullable |
| `holiday` | `text` |  Nullable |
| `app_icon` | `text` |  Nullable |
| `social_links` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `enable_blog` | `bool` |  Nullable |
| `config` | `jsonb` |  Nullable |
| `maintenance_mode` | `bool` |  Nullable |

## Table `course_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `created_at` | `timestamptz` |  Nullable |

## Table `notice_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `value` | `text` |  Unique |
| `label` | `text` |  |
| `color` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `duration` | `text` |  Nullable |
| `features` | `jsonb` |  Nullable |
| `image` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `price` | `text` |  Nullable |
| `is_popular` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `qualification_id` | `uuid` |  Nullable |

## Table `subcategories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `thumbnail` | `text` |  Nullable |
| `short_description` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `hidden` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `subcategory_id` | `uuid` |  Nullable |
| `type` | `text` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `url` | `text` |  |
| `duration` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `hidden` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `images` | `jsonb` |  Nullable |

## Table `faqs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `answer` | `text` |  |
| `sort_order` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `faculty_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `role` | `text` |  Nullable |
| `qualification` | `text` |  Nullable |
| `experience` | `text` |  Nullable |
| `image` | `text` |  Nullable |
| `subjects` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `notices`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `content` | `text` |  |
| `category` | `text` |  Nullable |
| `is_pinned` | `bool` |  Nullable |
| `author` | `text` |  Nullable |
| `date` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `image` | `text` |  Nullable |

## Table `testimonials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `role` | `text` |  Nullable |
| `content` | `text` |  |
| `rating` | `int4` |  Nullable |
| `image` | `text` |  Nullable |
| `achievement` | `text` |  Nullable |
| `class` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `gallery_images`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `src` | `text` |  |
| `alt` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `enrollments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  Nullable |
| `interested_course` | `text` |  Nullable |
| `guardian_name` | `text` |  Nullable |
| `guardian_contact` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `auth_user_id` | `uuid` |  Nullable |
| `verification_code` | `text` |  Nullable |
| `verification_sent_at` | `timestamptz` |  Nullable |
| `verified_at` | `timestamptz` |  Nullable |
| `rejection_message` | `text` |  Nullable |
| `qualification_id` | `uuid` |  Nullable |

## Table `exam_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `color` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `category_id` | `uuid` |  Nullable |
| `type` | `text` |  |
| `question` | `text` |  |
| `options` | `jsonb` |  Nullable |
| `answer` | `text` |  |
| `explanation` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `subcategory_id` | `uuid` |  Nullable |

## Table `exam_attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `category_id` | `uuid` |  Nullable |
| `student_id` | `uuid` |  Nullable |
| `student_name` | `text` |  |
| `score` | `int4` |  Nullable |
| `total` | `int4` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `answers` | `jsonb` |  Nullable |
| `subcategory_id` | `uuid` |  Nullable |

## Table `exam_answers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `attempt_id` | `uuid` |  Nullable |
| `question_id` | `uuid` |  Nullable |
| `answer` | `text` |  Nullable |
| `correct` | `bool` |  Nullable |

## Table `progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `student_id` | `uuid` |  Nullable |
| `item_id` | `uuid` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## Table `students`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `enrolled_courses` | `jsonb` |  Nullable |
| `join_date` | `date` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `image` | `text` |  Nullable |
| `qualification_id` | `uuid` |  Nullable |

## Table `blog_posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  |
| `content` | `text` |  |
| `excerpt` | `text` |  Nullable |
| `author` | `text` |  Nullable |
| `image` | `text` |  Nullable |
| `status` | `text` |  |
| `tags` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |

## Table `contact_submissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  Nullable |
| `subject` | `text` |  Nullable |
| `message` | `text` |  |
| `is_read` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `type` | `text` |  |
| `title` | `text` |  |
| `message` | `text` |  |
| `link` | `text` |  Nullable |
| `is_read` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `communication_templates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `type` | `text` |  |
| `subject` | `text` |  Nullable |
| `body` | `text` |  |
| `variables` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `category` | `text` |  Nullable |
| `config` | `jsonb` |  Nullable |

## Table `communications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `type` | `text` |  |
| `template_id` | `uuid` |  Nullable |
| `subject` | `text` |  Nullable |
| `body` | `text` |  |
| `recipient_type` | `text` |  |
| `class_filter` | `text` |  Nullable |
| `recipient_count` | `int4` |  Nullable |
| `sent_count` | `int4` |  Nullable |
| `failed_count` | `int4` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `sent_at` | `timestamptz` |  Nullable |

## Table `communication_recipients`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `communication_id` | `uuid` |  |
| `recipient_type` | `text` |  |
| `recipient_name` | `text` |  Nullable |
| `recipient_email` | `text` |  Nullable |
| `recipient_phone` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `error_message` | `text` |  Nullable |
| `sent_at` | `timestamptz` |  Nullable |

## Table `media_folders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `parent_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `media`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `file_name` | `text` |  |
| `file_size` | `int4` |  |
| `mime_type` | `text` |  |
| `url` | `text` |  |
| `thumbnail_url` | `text` |  Nullable |
| `folder_id` | `uuid` |  Nullable |
| `alt_text` | `text` |  Nullable |
| `width` | `int4` |  Nullable |
| `height` | `int4` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `notes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `content` | `text` |  |
| `tags` | `_text` |  Nullable |
| `color` | `text` |  Nullable |
| `is_pinned` | `bool` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `ai_conversations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `ai_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `conversation_id` | `uuid` |  |
| `role` | `text` |  |
| `content` | `text` |  Nullable |
| `tool_calls` | `jsonb` |  Nullable |
| `tool_name` | `text` |  Nullable |
| `tool_args` | `jsonb` |  Nullable |
| `tool_result` | `jsonb` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `ai_action_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `action` | `text` |  |
| `tool_name` | `text` |  |
| `payload` | `jsonb` |  Nullable |
| `status` | `text` |  |
| `error` | `text` |  Nullable |
| `duration_ms` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `ai_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `content` | `text` |  |
| `source_type` | `text` |  |
| `source_id` | `text` |  Nullable |
| `embedding` | `vector` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `qualifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `sort_order` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `exam_subcategories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `category_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `color` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `live_classes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `instructor` | `text` |  |
| `platform` | `text` |  |
| `join_url` | `text` |  |
| `recording_url` | `text` |  Nullable |
| `start_time` | `timestamptz` |  |
| `duration_minutes` | `int4` |  Nullable |
| `course_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `color` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `recording_chunks` | `jsonb` |  Nullable |

## Table `password_resets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  |
| `code` | `text` |  |
| `reset_token` | `uuid` |  Nullable |
| `expires_at` | `timestamptz` |  |
| `used` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `analytics_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `visitor_id` | `uuid` |  |
| `user_id` | `uuid` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `last_seen_at` | `timestamptz` |  Nullable |

## Table `analytics_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `event_id` | `text` |  Unique |
| `event_type` | `text` |  |
| `session_id` | `uuid` |  Nullable |
| `visitor_id` | `uuid` |  |
| `user_id` | `uuid` |  Nullable |
| `path` | `text` |  Nullable |
| `exam_id` | `uuid` |  Nullable |
| `attempt_id` | `uuid` |  Nullable |
| `import_id` | `uuid` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `occurred_at` | `timestamptz` |  Nullable |

