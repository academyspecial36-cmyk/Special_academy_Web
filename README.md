# Special Academy - Cadet Preparation Academy Website

A full-featured Next.js website for **Special academy**, a cadet college preparation academy based in Kathmandu, Nepal. Includes a public-facing website, student portal, and admin dashboard with dynamic content management.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
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

### Admin Dashboard (`Ctrl+Shift+A`)
- Route protected at middleware level — only authenticated users with `admin` role can access `/dashboard`
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
- Route protected at middleware level — only authenticated users with `student` role can access `/student`
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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BUCKET_NAME=my-bucket-name
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@cadetacademy.edu
SETUP_SECRET=setup-change-me
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
│   │   ├── auth/                  # Auth endpoints (login, logout, session, register)
│   │   ├── bootstrap/             # Bootstrap data cache
│   │   ├── data/                  # Generic CRUD for allowed tables
│   │   ├── media/                 # Media upload/stats
│   │   └── setup/                 # One-time admin creation
│   ├── (public)/                  # Public-facing pages
│   ├── dashboard/                 # Admin dashboard pages
│   ├── student/                   # Student portal pages
│   ├── middleware.ts              # Route protection (admin/student)
│   └── layout.tsx                 # Root layout
├── components/
│   ├── landing/
│   ├── providers/
│   ├── shared/                    # Navbar, footer, admin-auth-modal
│   └── ui/
├── constants/
├── lib/
│   ├── admin/actions.ts           # Server-only admin server actions
│   ├── api/admin-guard.ts         # API route admin guard
│   ├── auth-context.tsx           # Client auth context
│   ├── auth-utils.ts              # Server-side auth helpers
│   └── supabase-server.ts         # Server-side Supabase clients
├── styles/
└── types/
```

## Auth Flows

### Admin Access
1. Navigate to `/login` or press `Ctrl+Shift+A` to open the admin login modal
2. Enter admin email and password
3. Redirected to `/dashboard`

### Student Access
1. Navigate to `/login`
2. Enter email and password
3. Redirected to `/student`

## Security

- **Middleware** blocks `/dashboard` and `/student` routes for unauthorized users at the edge
- **`server-only`** import prevents admin server actions from bundling into client code
- **Supabase RLS** restricts row-level access: admins can read/write all rows, students can only access their own data
- **Service role client** used for admin-only operations (bypasses RLS safeguards, used only server-side)

## Color Scheme

- **Primary:** Deep green (#07220B) — academy branding
- **Secondary:** Blue (#1A86C8) — accents and CTAs
- **Accent:** Light gray (#F5F7FA) — section backgrounds
- **Muted:** Slate (#64748B) — secondary text

## License

Private — All rights reserved.
