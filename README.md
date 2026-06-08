# Special Academy - Cadet Preparation Academy Website

A full-featured Next.js website for **Special academy**, a cadet college preparation academy based in Kathmandu, Nepal. Includes a public-facing website, student portal, and admin dashboard with dynamic content management.

## Tech Stack

- **Framework:** Next.js 15.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **UI:** Custom shadcn/ui-style components (Radix Slot, CVA)

## Features

### Public Website
- Landing page with hero, stats, courses, faculty, testimonials, FAQ, gallery, facilities, activities, and contact section
- Course listing page
- Notice board with category filtering
- Testimonial gallery
- Photo gallery
- Team/faculty page
- About page
- Contact page with form
- Enrollment/signup page with multi-step form
- Student login page
- Forgot password page
- WhatsApp floating chat button
- Responsive navbar with mobile drawer

### Admin Dashboard (`Ctrl+Shift+S+B`)
- Protected behind a two-step auth modal:
  1. Enter admin passcode (verified server-side from `ADMIN_PASSCODE` env)
  2. Admin username/password (verified server-side from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env)
- Dashboard overview
- Students management
- Courses management
- Notices management (CRUD)
- Enrollments management
- Testimonials management
- Gallery management
- FAQs management (CRUD with inline editing)
- Faculty member management (CRUD with inline editing)
- Categories management (course categories + notice categories)
- Settings (academy info, contact info, social links, app icon upload)

### Student Portal
- Accessible after login (`/login`) with credentials from `STUDENT_EMAIL`/`STUDENT_PASSWORD` env vars
- Student dashboard overview
- My courses
- Notice board
- Profile page

### Dynamic Content Management
All site content is managed through a React Context (`AppContext`) initialized from mock data and editable via the admin dashboard:
- Academy name, tagline, description
- Contact info (address, phone, email, hours)
- Social media links (Facebook, Instagram, TikTok, YouTube)
- App icon/logo
- FAQs
- Faculty members
- Course categories
- Notice categories

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd cadet-academy
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
# Admin (for dashboard access via Ctrl+Shift+S+B)
ADMIN_PASSCODE=your-passcode
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password

# Student login
STUDENT_EMAIL=student@example.com
STUDENT_PASSWORD=student-password

# Shortcut key for admin modal (default: B)
NEXT_PUBLIC_ADMIN_SHORTCUT_KEY=S
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/                       # API routes
│   │   ├── admin-login/           # POST - admin credential verification
│   │   ├── student-login/         # POST - student credential verification
│   │   └── verify-passcode/       # POST - admin passcode verification
│   ├── (public)/                  # Public-facing pages
│   │   ├── about/
│   │   ├── contact/
│   │   ├── courses/
│   │   ├── enrollment/            # Multi-step registration/signup
│   │   ├── forgot-password/
│   │   ├── gallery/
│   │   ├── login/
│   │   ├── notices/
│   │   ├── team/
│   │   ├── testimonials/
│   │   ├── layout.tsx             # Public layout (navbar, footer, WhatsApp, admin modal)
│   │   └── page.tsx               # Landing page
│   ├── dashboard/                 # Admin dashboard pages
│   │   ├── categories/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   ├── faculty/
│   │   ├── faqs/
│   │   ├── gallery/
│   │   ├── notices/
│   │   ├── settings/
│   │   ├── students/
│   │   ├── testimonials/
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   └── page.tsx               # Dashboard overview
│   ├── student/                   # Student portal pages
│   │   ├── courses/
│   │   ├── notices/
│   │   ├── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── layout.tsx                 # Root layout (font, globals, AppProvider)
├── components/
│   ├── landing/                   # Landing page sections
│   ├── providers/                 # React context providers
│   ├── shared/                    # Shared components (navbar, footer, modals)
│   └── ui/                        # Reusable UI primitives
├── constants/                     # Navigation, categories, configurations
├── lib/                           # App context, utility functions
├── mock/                          # Initial mock data
├── styles/                        # Global CSS
└── types/                         # TypeScript interfaces
```

## Auth Flows

### Admin Access
1. Press `Ctrl+Shift+S+B` (configurable via `NEXT_PUBLIC_ADMIN_SHORTCUT_KEY`)
2. Enter the passcode (from `ADMIN_PASSCODE` env var)
3. Enter admin username/password (from `ADMIN_USERNAME`/`ADMIN_PASSWORD`)
4. Redirected to `/dashboard`

### Student Access
1. Navigate to `/login`
2. Enter email and password (from `STUDENT_EMAIL`/`STUDENT_PASSWORD`)
3. Redirected to `/student`

## Color Scheme

- **Primary:** Deep green (#07220B) — academy branding
- **Secondary:** Blue (#1A86C8) — accents and CTAs
- **Accent:** Light gray (#F5F7FA) — section backgrounds
- **Muted:** Slate (#64748B) — secondary text

## License

Private — All rights reserved.
