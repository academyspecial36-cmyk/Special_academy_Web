# PROJECT

Build a production-grade AI Command Center inside the existing Special Academy Admin Dashboard.

The existing application is already built using Next.js, TypeScript, Tailwind, Supabase, and existing dashboard design patterns.

The AI feature must NOT feel like ChatGPT.

The AI must feel like a native academy operating system integrated deeply into the dashboard.

---

# PRIMARY GOAL

Allow admins to perform nearly all academy operations through natural language.

Examples:

* Create a holiday notice
* Pin notice
* Upload notice image
* Show outdated notices
* Delete outdated notices
* Create course
* Create exam
* Generate MCQ questions
* Approve enrollment
* Reject enrollment
* Show inactive students
* Publish blog post
* Update landing page content
* Enable maintenance mode
* Backup system

The AI should return actionable interfaces instead of long text responses.

---

# DESIGN PHILOSOPHY

Use existing dashboard theme.

Do not introduce new colors.

Do not introduce gradients.

Do not create "AI themed" purple interfaces.

Use existing:

* cards
* typography
* spacing
* shadows
* border radius
* button styles
* color tokens

The AI must feel like a native dashboard feature.

A user should feel:

"This was built as part of the dashboard from day one."

---

# UI STYLE

Design inspiration:

* Linear
* Notion
* Vercel Dashboard
* Stripe Dashboard
* GitHub Command Palette

Avoid:

* ChatGPT clone
* Discord style chat
* Messenger UI
* Floating AI bubbles
* Full-screen chatbot

---

# ENTRY POINTS

Implement:

1. Sidebar item

Label:

AI Command Center

Icon:

Sparkles or Command icon

---

2. Global Command Shortcut

Ctrl + K

or

Cmd + K

Opens AI command palette.

---

3. Floating Quick Action Button

Bottom-right

Visible only on desktop dashboard.

---

# PAGE LAYOUT

Split layout.

Left side:

Conversation history

Width:
320px

Contains:

* Today
* Yesterday
* Previous

Searchable.

---

Center:

Main conversation area

Maximum width:
900px

---

Right Side:

Context Panel

Displays:

Current page context

Examples:

If user is inside notices page:

Current Notices

Recent Notices

Pinned Notice

Notice Categories

If user is inside courses:

Course statistics

Recent courses

Categories

The AI receives this context automatically.

---

# CHAT EXPERIENCE

Never render huge markdown blocks.

Responses should be structured.

Examples:

Bad:

"Here is your holiday notice..."

followed by 500 words.

Good:

Notice Draft Card

Editable

Publishable

Actionable

---

# RESPONSE TYPES

Create response renderer system.

Types:

knowledge_answer

notice_draft

blog_draft

faq_draft

course_draft

exam_draft

student_table

notice_table

enrollment_table

confirmation_card

action_result

error_card

analytics_card

Each type has its own UI component.

Never display raw JSON.

---

# NOTICE WORKFLOW

User:

Create Dashain holiday notice

AI:

Generate notice.

Display:

Title input

Rich text editor

Pin notice toggle

Image uploader

Schedule publish date

Preview button

Publish button

Cancel button

User can edit before publishing.

---

# DELETE WORKFLOW

User:

Delete outdated notices

AI:

Runs search tool.

Displays:

Table.

Checkbox selection.

Count.

Delete button.

Archive button.

Cancel button.

No deletion occurs automatically.

Always require confirmation.

---

# COURSE WORKFLOW

User:

Create a new 3 month cadet preparation course

AI:

Generate:

Course title

Description

Duration

Category

Price

Modules

Lessons

Display inside editable form.

Allow:

Save Draft

Publish

Cancel

---

# EXAM WORKFLOW

User:

Create 50 GK MCQs for Class 8

AI:

Generate:

Exam title

Category

Questions

Correct answers

Marks

Display:

Question manager interface

Editable.

Save draft.

Publish.

---

# STUDENT ANALYTICS

Examples:

Show inactive students

Show low performing students

Students without progress

Students not logged in for 30 days

Display:

Data tables

Export button

Bulk actions

---

# RAG SYSTEM

Create AI Knowledge Layer.

Sources:

Admin Guide

FAQ

Courses

Settings

Notices

Blog

Legal Pages

Future Uploaded Documents

Store in:

ai_documents

Columns:

id

title

content

source_type

source_id

embedding

created_at

updated_at

Use pgvector.

Use Nomic embeddings.

Use hybrid retrieval.

Top K:

8

---

# MODEL SYSTEM

Provider:

OpenRouter

Primary Model:

deepseek/deepseek-chat-v3

Fallback:

qwen/qwen3-32b

Second fallback:

google/gemini-2.5-flash

Implement automatic fallback.

If provider fails:

Retry next model.

---

# TOOL CALLING

Create tool registry.

Tools:

createNotice

updateNotice

deleteNotice

pinNotice

createCourse

updateCourse

deleteCourse

createExam

updateExam

deleteExam

approveEnrollment

rejectEnrollment

createFAQ

updateFAQ

deleteFAQ

createBlog

publishBlog

enableMaintenance

disableMaintenance

backupSystem

restoreBackup

getStudents

getCourses

getNotices

getEnrollments

getFAQs

getBlogs

All tools strongly typed.

Use Zod validation.

---

# SAFETY

Never execute destructive action automatically.

Require confirmation for:

Delete

Restore

Disable

Reject

Overwrite

Bulk actions

Always show confirmation card.

---

# AUDIT LOGGING

Create:

ai_action_logs

Store:

user_id

action

tool_name

payload

status

timestamp

duration

Every AI action must be logged.

---

# STREAMING

Implement token streaming.

Responses should appear progressively.

Use optimistic UI.

Loading states:

Thinking

Searching

Generating

Executing

Completed

---

# CONTEXT AWARENESS

AI automatically receives:

Current route

Current page

Selected entity

Current filters

Current search

Current user role

This reduces prompting.

---

# FUTURE READY

Architecture must support:

Image generation

Voice commands

Workflow chaining

Scheduled actions

Agent memory

Multi-step workflows

Without major refactoring.

---

# CODE QUALITY

Requirements:

TypeScript strict mode

Server actions where appropriate

Reusable UI components

Feature-based architecture

No duplicated logic

Strong typing

Clean folder structure

Error boundaries

Loading states

Empty states

Permission checks

Accessibility

Mobile responsiveness

Production-ready implementation

Use existing design system and UI patterns from the dashboard.

The final result should feel comparable to Linear, Notion, Vercel Dashboard, and Stripe Admin experiences.
