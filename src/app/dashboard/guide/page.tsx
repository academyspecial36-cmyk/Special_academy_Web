"use client";

import { useState, useEffect, useRef } from "react";
import {
  LogIn, LayoutDashboard, Users, FileText, BookOpen, ClipboardCheck,
  Bell, GraduationCap, HelpCircle, MessageSquare, Tags, ImageIcon,
  Settings, Palette, Shield, Cloud, Eye, ArrowRight, Star,
  Globe, Layout, ToggleLeft, Sun, Scale, Search, Wifi,
} from "lucide-react";

interface StepItem {
  step: string;
  title: string;
  desc: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  steps?: StepItem[];
  items?: string[];
  tips?: string[];
  warns?: string[];
}

const sections: GuideSection[] = [
  // ═══════════════════════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════════════════════
  {
    id: "login",
    title: "Logging In (Admin Portal)",
    icon: LogIn,
    steps: [
      { step: "1", title: "Open the Admin Login Screen", desc: 'Go to your public website. There are two ways to open the hidden admin login modal: (A) Press Ctrl + Shift + K on your keyboard at the same time. OR (B) Click the academy logo in the top-left corner 5 times quickly. A passcode screen will appear.' },
      { step: "2", title: "Enter the Admin Passcode", desc: 'Type the admin passcode into the input field. The default passcode is admin@123 (your academy may have changed this during setup). Click the "Verify Passcode" button to proceed to the login form.' },
      { step: "3", title: "Sign In with Email & Password", desc: 'Enter your admin email address and password that were created during initial setup. Click the "Sign In" button.' },
      { step: "4", title: "You Are Now Logged In", desc: "On successful login, you will be redirected to the Admin Dashboard at /dashboard. Note: For security, admin sessions do not persist across browser restarts. You will need to log in again if you close your browser." },
    ],
    tips: [
      "If the passcode does not work, contact your system administrator — it may have been changed via the ADMIN_PASSCODE environment variable.",
      "Do NOT use the public login page at /login — that is for students only. The admin login is a hidden modal only accessible via the methods above.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  {
    id: "dashboard",
    title: "Dashboard — What You Can Monitor at a Glance",
    icon: LayoutDashboard,
    steps: [
      { step: "1", title: "Summary Cards", desc: "At the top of the dashboard, you will see 4 numbered cards: Total Students (all registered students), Active Courses (courses currently published), New Enrollments (applications waiting for your review), Notices (published announcements). Each card shows a count and updates automatically when data changes." },
      { step: "2", title: "Quick Action Buttons", desc: 'Below the summary cards, you will find quick links such as "View Enrollments" (opens the enrollment management page) and "Publish Notice" (opens the notice creation form). These save you time by taking you directly to common tasks.' },
      { step: "3", title: "Left Sidebar Navigation", desc: "The left sidebar contains the full menu of all management pages. The current page is highlighted. Click any menu item to navigate: Courses, Notices, Faculty, Testimonials, Gallery, Blog, FAQs, Categories, Exams, Enrollments, Students, Contact Submissions, Settings, and this Guide." },
      { step: "4", title: "Top-Right Corner", desc: "Your profile avatar and the bell icon are in the top-right. The bell shows a red badge with the number of unread notifications (new enrollments, contact messages). Click it to view or mark notifications as read." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ENROLLMENTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "enrollments",
    title: "Enrollments — Full Lifecycle from Application to Approval",
    icon: FileText,
    steps: [
      { step: "1", title: "Student Applies Online", desc: 'A visitor fills the public enrollment form at /enrollment on your website. They provide: full name, email address, phone number, guardian details, address, course selection, and an optional message. When they submit, their status is "Unverified" and an email is sent to them.' },
      { step: "2", title: "Student Verifies Email", desc: "The student receives an email with a 6-digit verification code. They must enter this code on the verification page. After successful verification, their status changes to 'Pending' — meaning it is now waiting for your review." },
      { step: "3", title: "Review the Application", desc: 'Go to Enrollments in the sidebar. Use the filter buttons at the top to show: All, Unverified (email not yet verified), Pending (waiting for you), Approved, or Rejected. Click the eye icon on any application to view all the details the student submitted.' },
      { step: "4", title: "Approve the Application", desc: 'If you want to accept the student, click the "Approve" button. The system will automatically: (A) create a student account with login credentials, (B) enroll them in the selected course, (C) send an approval email to the student with their login information. The student can now log in to the student portal.' },
      { step: "5", title: "Reject the Application", desc: 'If you need to decline the application, click the "Reject" button. A text box will appear — type the reason for rejection (e.g. "Seats are full for this session" or "Eligibility criteria not met"). The student will receive a rejection email explaining why.' },
    ],
    items: [
      "You should check the Enrollments page regularly to process pending applications promptly.",
      "The bell icon notifies you immediately when a new enrollment application is submitted.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // COURSES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "courses",
    title: "Courses — Creating and Managing Course Content",
    icon: BookOpen,
    steps: [
      { step: "1", title: "Add a New Course", desc: 'Go to Courses in the sidebar. Click the "Add Course" button (top-right of the page). A form will open with these fields: Title (name of the course, e.g. "Cadet Entrance Preparation"), Description (what the course covers), Duration (e.g. "3 months" or "6 months"), Class Level (e.g. "Class 8", "Class 10"), Category (choose from your course categories), Price (enter 0 for free, or a number for paid), and Image (upload a cover image for the course card). Click "Save" when done.' },
      { step: "2", title: "View All Courses", desc: "The Courses page shows all your courses as cards. Each card displays the title, category, class level, and price. From here you can click Edit (pencil icon) to modify a course, or Delete (trash icon) to permanently remove a course and all its content." },
      { step: "3", title: "Add Subcategories (Chapters)", desc: "Click on a course title or the Manage button to open its detail page. Here you can add Subcategories — think of these as chapters or modules within the course (e.g. 'General Knowledge', 'English', 'Mathematics'). Click 'Add Subcategory', enter a name and description, and save. You can add as many as you need." },
      { step: "4", title: "Add Learning Items (Videos, PDFs, Images)", desc: "Inside each subcategory, click 'Add Item'. Fill in: Title (name of the material), Type (choose Video, PDF, or Image), File (upload the file from your computer). Then set visibility: toggle 'Free' ON if the item should be accessible to anyone without login; toggle 'Hidden' ON if you want to keep it as a draft (students cannot see it). Click Save." },
      { step: "5", title: "Edit or Delete Items", desc: "Each item has a pencil icon (edit) and trash icon (delete). You can change the title, file, type, or visibility settings anytime. When you add new items, all enrolled students receive an automatic in-app notification — no need to announce it separately." },
    ],
    items: [
      "Course hierarchy: Course → Subcategories (chapters) → Items (videos, PDFs, images).",
      "If a course has a price greater than 0, students must be enrolled (approved enrollment) to access it. Items marked as 'Free' within paid courses are accessible to anyone.",
      "Students can mark items as complete. Their progress is tracked per course and shown as a percentage on their dashboard.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // NOTICES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "notices",
    title: "Notices & Pinned Notices",
    icon: Bell,
    steps: [
      { step: "1", title: "Add a New Notice", desc: 'Go to Notices in the sidebar. Click "Add Notice" (top-right). Fill in these fields: Title (short heading), Content (the full notice body), Category (choose from your notice categories — each has a color), Author (who is publishing this), Image (optional — upload a photo to show with the notice). Click Save.' },
      { step: "2", title: "Pin a Notice for Popup", desc: "When adding or editing a notice, you will see a 'Pinned' toggle switch. Turn it ON to make this notice appear as a popup modal on the public website. Only the most recently pinned notice is shown. Visitors see the popup after 0.8 seconds and can dismiss it with 'Don't show again'." },
      { step: "3", title: "Manage Existing Notices", desc: "The notices list shows title, category (with color), author, pinned status, and publish date. Use the pencil icon to edit or the trash icon to delete. Notices appear on three places: the landing page notices section, the public /notices page, and the student portal." },
    ],
    tips: [
      "Pinned Notice Popup can be turned off entirely in Settings → SEO & Features (toggle 'Pinned Notice Popup').",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FACULTY
  // ═══════════════════════════════════════════════════════════════
  {
    id: "faculty",
    title: "Faculty Members — Staff Profiles",
    icon: GraduationCap,
    steps: [
      { step: "1", title: "Add a Faculty Member", desc: 'Go to Faculty in the sidebar. Click "Add Faculty". Fill in: Name (full name), Role/Position (e.g. "Head Instructor", "Subject Expert", "Physical Trainer"), Qualification (e.g. "M.Sc. Physics, B.Ed."), Experience (e.g. "10 years of teaching"), Image (upload a profile photo), and Subjects they teach (e.g. "Mathematics, Science"). Click Save.' },
      { step: "2", title: "Edit or Delete", desc: "Use the pencil icon to edit a profile or the trash icon to delete it. Faculty profiles appear on the landing page faculty section and the public /team page." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // TESTIMONIALS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "testimonials",
    title: "Testimonials — Student & Parent Reviews",
    icon: Star,
    steps: [
      { step: "1", title: "Add a Testimonial", desc: 'Go to Testimonials in the sidebar. Click "Add Testimonial". Fill in: Name (person&apos;s name), Role (choose Student, Parent, or Cadet), Content (what they say about your academy), Rating (1 to 5 stars), Achievement (optional — e.g. "Secured 1st rank in XYZ College"), Class (optional — e.g. "Class of 2025"), and Image (optional profile photo). Click Save.' },
      { step: "2", title: "Manage", desc: "Edit or delete testimonials using the pencil or trash icons. Testimonials appear on the landing page carousel and the public /testimonials page." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // GALLERY
  // ═══════════════════════════════════════════════════════════════
  {
    id: "gallery",
    title: "Gallery Images — Photo Management",
    icon: ImageIcon,
    steps: [
      { step: "1", title: "Upload Images", desc: 'Go to Gallery in the sidebar. Click "Add Images". Select one or more image files from your computer. For each image, add Alt Text (a short description for accessibility) and choose a Category (Campus, Events, Classroom, Sports, or Graduation). Click Save.' },
      { step: "2", title: "Manage Gallery", desc: "Images are displayed in a grid. Use the trash icon to delete unwanted images. The gallery appears on the landing page gallery section and the public /gallery page." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BLOG
  // ═══════════════════════════════════════════════════════════════
  {
    id: "blog",
    title: "Blog Posts — Writing & Publishing Articles",
    icon: FileText,
    steps: [
      { step: "1", title: "Create a New Post", desc: 'Go to Blog in the sidebar. Click "New Post". You will see a rich text editor with formatting tools — bold, italic, underline, bullet lists, numbered lists, headings, and more. This works like a simple word processor.' },
      { step: "2", title: "Fill in Post Details", desc: "Title (headline of your article). Slug (auto-generated from the title — this becomes the URL, e.g. 'tips-for-cadet-exam'). You can edit the slug if needed. Content (write your full article using the editor). Excerpt (a short 2-3 sentence summary shown in previews). Author (name of the writer). Image (upload a cover image). Tags (comma-separated keywords for categorization, e.g. 'exam tips, preparation, study guide')." },
      { step: "3", title: "Publish or Save as Draft", desc: "Status: choose 'Published' to make the post visible to everyone on the public blog page, or 'Draft' to keep it hidden until you are ready. You can switch between these two statuses anytime by editing the post." },
      { step: "4", title: "Manage All Posts", desc: "The blog list shows all posts with their title, status (Published/Draft), author, and publish date. Click a post to edit it. Use the trash icon to delete." },
    ],
    tips: [
      "Blog posts appear on the landing page blog section and the public /blog page. Individual posts are at /blog/post-slug.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FAQS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "faq",
    title: "FAQs — Frequently Asked Questions (Drag & Drop Reorder)",
    icon: HelpCircle,
    steps: [
      { step: "1", title: "Add a FAQ", desc: 'Go to FAQs in the sidebar. Click "Add FAQ". Enter the Question (e.g. "What is the admission process?") and the Answer (full explanation). Click Save.' },
      { step: "2", title: "Reorder FAQs", desc: "Each FAQ item has a drag handle (⋮⋮ icon) on its left side. Click and hold the handle, then drag the item up or down to change its position. The order is saved automatically. FAQs appear on the landing page FAQ section in the order you set." },
      { step: "3", title: "Edit or Delete", desc: "Use the pencil icon to edit or the trash icon to delete a FAQ entry." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "categories",
    title: "Categories — Course & Notice Categories",
    icon: Tags,
    steps: [
      { step: "1", title: "Course Categories", desc: 'Go to Categories in the sidebar. The "Course Categories" tab shows categories used to group your courses (e.g. "Cadet Preparation", "Academic Enhancement", "Scholarship Prep"). Click "Add" to create a new category, or use the edit/delete icons to manage existing ones.' },
      { step: "2", title: "Notice Categories", desc: 'The "Notice Categories" tab shows categories used to group notices (e.g. "Admission", "Exam", "Holiday", "Event", "General"). Each category has a color for visual identification. Add, edit, or delete as needed.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // EXAMS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "exams",
    title: "Exams & Questions — Create Tests and View Results",
    icon: ClipboardCheck,
    steps: [
      { step: "1", title: "Create an Exam Category", desc: 'Go to Exams in the sidebar. Click "Add Category". Enter: Name (e.g. "Weekly Test — General Knowledge"), Description (optional — what this exam covers), and pick a Color (each category gets a colored card for easy identification). Click Save.' },
      { step: "2", title: "Add MCQ Questions", desc: "Click on an exam category to open it. Click 'Add Question'. Choose Type: MCQ. Fill in: Question Text (the question itself), 4 Options (A, B, C, D), Correct Answer (select which option is correct), Marks (how many points this question is worth). Click Save. Repeat for each question." },
      { step: "3", title: "Add Subjective Questions", desc: "Click 'Add Question'. Choose Type: Subjective. Fill in: Question Text, Model Answer (the expected answer — this helps reviewers), and Marks. Subjective questions require manual grading (students type their answer)." },
      { step: "4", title: "View Student Results", desc: 'Click the "Results" button on an exam category to see all student attempts. For each attempt you can view: the student&apos;s name, their total score, which MCQ questions they got right/wrong, and their subjective answers for review.' },
    ],
    items: [
      "Students take exams from the student portal. They see their score immediately after submitting (for MCQ questions). Subjective answers are recorded for admin review.",
      "You can add as many questions as you want to each exam category.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // STUDENTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "students",
    title: "Student Records",
    icon: Users,
    steps: [
      { step: "1", title: "View Students", desc: 'Go to Students in the sidebar. You will see a table with columns: Name, Email, Phone, Class, and Status (Active or Inactive). Use the search box to find a student by name or email. Use the filter dropdown to show All, Active, or Inactive students.' },
      { step: "2", title: "Edit a Student", desc: "Click the pencil icon next to any student to edit their details: name, email, phone, class, and status. Changes take effect immediately." },
      { step: "3", title: "Delete a Student", desc: "Click the trash icon to permanently delete a student record. Use this carefully — deleted records cannot be recovered." },
    ],
    items: [
      "You do NOT need to manually add students — approved enrollments create student accounts automatically.",
      "Student accounts can be activated or deactivated anytime from this page.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONTACT SUBMISSIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "contact",
    title: "Contact Submissions — Messages from Your Website",
    icon: MessageSquare,
    steps: [
      { step: "1", title: "View Messages", desc: 'Go to Contact Submissions in the sidebar. All messages from the public contact form appear here in a list. Each message shows the sender&apos;s name, email, subject, and date. Unread messages have a "New" badge.' },
      { step: "2", title: "Read and Respond", desc: "Click any message to expand it and read the full content including the message body. The sender's contact details are shown so you can reply to them via email." },
      { step: "3", title: "Mark as Read / Unread", desc: "Use the 'Mark as Read' or 'Mark as Unread' button to track which messages you have reviewed. This helps you stay organized." },
      { step: "4", title: "Delete Messages", desc: "Use the trash icon to delete spam or resolved messages to keep your list clean." },
    ],
    items: [
      "You will receive an in-app notification (bell icon) whenever a new contact submission arrives.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — SITE SETTINGS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-site",
    title: "Settings — Tab 1: Site Settings",
    icon: Globe,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings in the sidebar. By default the "Site Settings" tab is selected. This tab controls your academy&apos;s public identity and contact information.' },
      { step: "2", title: "Academy Name", desc: "Type the full name of your academy. This appears in the site header (top of every page) and in the browser tab title. Example: 'Special Academy'." },
      { step: "3", title: "Tagline", desc: "A short motto or phrase displayed under the academy name in the header. Example: 'Preparing Future Leaders Through Discipline & Excellence'." },
      { step: "4", title: "Description", desc: "A brief description of your academy. This is used for SEO (search engine optimization) and may appear in search results. Example: 'Nepal&apos;s premier cadet preparation academy.'" },
      { step: "5", title: "Address", desc: "Your academy's physical address. Displayed in the website footer and on the contact page. Example: 'Kathmandu, Nepal'." },
      { step: "6", title: "Contact Information", desc: "Email: primary contact email. Admission Email: for admission inquiries (can be different from the general email). Phone: primary phone number. Secondary Phone: alternate phone number. Website: your website URL (e.g. https://cadetacademy.edu)." },
      { step: "7", title: "Office Hours & Holiday", desc: "Office Hours: the days and times you are open (e.g. 'Sun-Thu: 9:00 AM - 5:00 PM'). Holiday: the weekly off day or public holiday info (e.g. 'Friday & Public Holidays')." },
      { step: "8", title: "App Icon / Logo", desc: "Upload your academy logo image. Click the upload area or the camera icon to select an image file from your computer. This logo is displayed in the site header and as the browser favicon." },
      { step: "9", title: "Social Media Links", desc: "Paste the full URLs to your social media profiles: Facebook, Instagram, TikTok, and YouTube. These appear as clickable icons in the website footer. Leave any field empty if you don't use that platform." },
      { step: "10", title: "Save Your Changes", desc: 'After filling in all the fields, scroll to the bottom-right of the page and click the "Save" button. Your changes will be applied immediately to the public website.' },
    ],
    tips: [
      "Always click Save before switching to another tab, or your changes will be lost.",
      "The logo upload supports common image formats: JPG, PNG, WEBP.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — LANDING CONTENT
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-landing",
    title: "Settings — Tab 2: Landing Content",
    icon: Layout,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Landing Content" tab. This page controls the main sections of your landing page (homepage).' },
      { step: "2", title: "Hero Section", desc: "The hero is the big banner at the top of your homepage. You can edit: Badge (small label at the top, e.g. 'Admission Open for 2026-27 Session'), Title (the main headline), Subtitle (text below the title), Image (the background image URL or upload). Make this section compelling — it is the first thing visitors see." },
      { step: "3", title: "About Section", desc: "Tell visitors about your academy. Edit: Title (section heading), Description (paragraph about your academy), Image (upload a photo), and 4 Values with their own title and description (e.g. Mission, Discipline, Excellence, Character)." },
      { step: "4", title: "Stats Section", desc: "Show impressive numbers. You can add up to 4 stat items. Each has: Label (e.g. 'Students Enrolled'), Value (e.g. '2500'), Suffix (e.g. '+'), Description (optional — e.g. 'Since 2010'). Click the + button to add more or the X button to remove." },
      { step: "5", title: "CTA (Call to Action) Section", desc: "A banner encouraging visitors to take action. Edit: Title (e.g. 'Start Your Cadet Journey Today'), Subtitle (supporting text), Button Text (e.g. 'Enroll Now'), and Button Link (where the button goes, e.g. '/enrollment')." },
      { step: "6", title: "Footer Section", desc: "Edit: Copyright text (e.g. '© 2026 Special Academy. All rights reserved.') and Description (a brief text about your academy shown in the footer)." },
      { step: "7", title: "Save Your Changes", desc: 'Click the "Save" button at the bottom-right to apply all changes to the public website.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — SECTIONS TOGGLE
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-sections",
    title: "Settings — Tab 3: Sections (Toggle Visibility)",
    icon: ToggleLeft,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Sections" tab. This page shows all 17 sections of your landing page with toggle switches.' },
      { step: "2", title: "How It Works", desc: "Each section has a toggle switch. Green = visible on the public site. Gray = hidden. Simply click a toggle to turn a section ON or OFF." },
      { step: "3", title: "The 17 Sections You Can Control", desc: 'Hero (main banner), About (academy introduction), Why Choose Us (reasons to choose you), Cadet Overview (program overview), Stats (numbers/counters), Courses (featured courses), Free Resources (free materials), Notices (announcements), Testimonials (reviews), Faculty (staff profiles), Facilities (campus features), Activities (daily schedule), Gallery (photos), Enrollment CTA (enrollment banner), FAQ (questions & answers), Contact (contact form & info), Blog (latest posts).' },
      { step: "4", title: "Save Your Changes", desc: 'Click the "Save" button to apply. Turned-off sections simply disappear from the public website — they are not deleted, just hidden.' },
    ],
    tips: [
      "Use this to simplify your landing page during certain seasons. For example, hide the Enrollment CTA when admissions are closed.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — CONTENT
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-content",
    title: "Settings — Tab 4: Content (Advanced Landing Page Details)",
    icon: Settings,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Content" tab. This is where you control the detailed content of your landing page.' },
      { step: "2", title: "Why Choose Us Cards", desc: "These are the feature cards on your landing page (Expert Faculty, Comprehensive Curriculum, etc.). Each card has: Icon (choose from a list of icons), Title (e.g. 'Expert Faculty'), Description (e.g. 'Our team includes retired military officers...'). Click the + button to add a new card. Click the X on any card to remove it. You can have as many as you want." },
      { step: "3", title: "Cadet Overview", desc: "This section explains your preparation program. Fields: Title (section heading), Description (paragraph), Heading (sub-heading), Steps (list of bullet points describing what you prepare students for — click + to add, X to remove), Images (upload multiple images that appear in this section)." },
      { step: "4", title: "Facilities Cards", desc: "Each facility has: Icon, Title (e.g. 'Modern Classrooms', 'Digital Library'), Description. Add or remove facilities as needed." },
      { step: "5", title: "Daily Schedule / Activities", desc: "Each activity has: Icon, Title (e.g. 'Morning Assembly'), Time (e.g. '7:30 AM - 8:00 AM'), Description. Add or remove activities to build your daily timetable." },
      { step: "6", title: "Enrollment CTA Banner", desc: "The enrollment call-to-action banner. Fields: Badge (small label), Heading (main headline), Description (supporting text), Offer Title (e.g. 'Limited Time Offer'), Offer Text (details of the offer), Discount (e.g. '10%'), Button Text (what the button says), Button Link (where it goes)." },
      { step: "7", title: "Hero Floating Cards", desc: "Small cards that float over the hero image. Each has: Icon, Value (e.g. '94%'), Label (e.g. 'Success Rate'). Add or remove as needed." },
      { step: "8", title: "Trust Indicators", desc: "Two fields shown near the hero: Students Count (e.g. '2,500+') and Rating (e.g. '4.9')." },
      { step: "9", title: "Section Labels & Headers", desc: "For each section you can customize three things: Label (the small tag above the heading), Title (the main heading), Description (the subtitle text). This gives you full control over the wording of every section." },
      { step: "10", title: "Button Labels", desc: "Customize what 11 buttons say across the site: Apply Now, Explore Courses, Learn More, View All Courses, View All Team, View All Testimonials, View All Articles, View All Notices, View Full Gallery, Contact Us, Send Message." },
      { step: "11", title: "Loading Screen Quotes", desc: "Add or remove inspirational quotes that appear randomly on the animated loading screen. Each quote should be a short sentence." },
      { step: "12", title: "Save", desc: 'Click "Save" at the bottom-right to apply all changes.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — THEME
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-theme",
    title: "Settings — Tab 5: Theme (Colors & Fonts)",
    icon: Palette,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Theme" tab. This lets you change the entire look and feel of your website without touching any code.' },
      { step: "2", title: "Choose a Primary Color", desc: 'You have two ways to pick a color: (A) Click the color swatch to open a color picker and choose visually, OR (B) Type a hex color code directly (e.g. #07220B for dark green, #1D4ED8 for blue, #DC2626 for red). The system automatically generates lighter and darker shades that are used across buttons, headings, cards, links, and other elements.' },
      { step: "3", title: "Choose a Font", desc: "Click the font dropdown to see 10 Google Fonts: Inter (modern, clean — recommended), Roboto (neutral, readable), Open Sans (friendly, clear), Lato (warm, professional), Montserrat (bold, contemporary), Poppins (geometric, modern), Nunito (rounded, approachable), Raleway (elegant, thin), Playfair Display (classic serif), Merriweather (traditional serif). The font is loaded on every page of your site." },
      { step: "4", title: "Preview Your Changes", desc: "A live preview section at the bottom shows how your chosen color and font look on real UI elements — a heading, a paragraph of text, a button, and a card. This helps you see the result before saving." },
      { step: "5", title: "Save", desc: 'Click "Save" to apply the theme to your entire website.' },
    ],
    tips: [
      "Dark colors (like navy, dark green, maroon) tend to look more professional for educational sites.",
      "The color preview updates in real-time as you pick, so you can experiment freely.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — LEGAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-legal",
    title: "Settings — Tab 6: Legal Pages (Privacy & Terms)",
    icon: Scale,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Legal" tab. This controls the content of your Privacy Policy and Terms of Service pages.' },
      { step: "2", title: "Edit Privacy Policy", desc: "The Privacy Policy section has: Title (page heading, e.g. 'Privacy Policy'), Description (subtitle), Last Updated (date text, e.g. 'June 2026'), and Sections. To add a section: click '+ Add Section'. Each section has: Title (e.g. 'Information We Collect') and Content Paragraphs (click + to add paragraphs of text). You can remove any section with the X button." },
      { step: "3", title: "Edit Terms of Service", desc: "Exactly the same structure as Privacy Policy: Title, Description, Last Updated, and Sections with paragraphs. Edit your terms covering topics like acceptance, eligibility, user responsibilities, intellectual property, and liability." },
      { step: "4", title: "Save", desc: 'Click "Save" to update the public /privacy and /terms pages immediately.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — SEO & FEATURES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-features",
    title: "Settings — Tab 7: SEO & Features",
    icon: Search,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "SEO & Features" tab. This controls technical and feature settings.' },
      { step: "2", title: "SEO Settings", desc: 'Meta Description: Type a brief description of your academy (150-160 characters recommended). This text appears in Google search results below your site link. Google Analytics ID: If you use Google Analytics, paste your tracking ID here (starts with "G-" or "UA-"). This adds the analytics tracking code to every page of your site.' },
      { step: "3", title: "Feature Toggle — Enable Blog", desc: "Toggle this ON to show the blog feature on your site. Toggle OFF to hide the blog section and pages entirely." },
      { step: "4", title: "Feature Toggle — Maintenance Mode", desc: "IMPORTANT: When you toggle this ON, all visitors to your public website will see an 'Under Maintenance' page with your academy's contact details. Only admins can still access /dashboard by typing the URL directly. To turn it OFF, go to /dashboard/settings, navigate to this tab, toggle it OFF, and click Save." },
      { step: "5", title: "Feature Toggle — Pinned Notice Popup", desc: "Toggle ON to allow pinned notices to appear as a popup on the public site. Toggle OFF to disable the popup entirely (pinned notices will still show in the notices section, just not as a popup)." },
      { step: "6", title: "Save", desc: 'Click "Save" to apply all changes.' },
    ],
    warns: [
      "⚠️ Maintenance Mode: If you enable this, you must use the direct URL /dashboard/settings to disable it — the public site will not be accessible.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — BACKUP
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-backup",
    title: "Settings — Tab 8: Backup & Restore",
    icon: Cloud,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Backup" tab. This is where you protect your data.' },
      { step: "2", title: "Export JSON — Download to Your Computer (Safest Method)", desc: 'Click the "Export JSON" button. A complete backup file (named backup-YYYY-MM-DD.json) will download to your computer. This file contains ALL your data: courses, notices, faculty, testimonials, gallery images, enrollments, students, exams, FAQs, blog posts, settings, and more. IMPORTANT: Download this file regularly and save it on an external hard drive, USB stick, or another cloud storage (Google Drive, Dropbox, etc.). This is your primary safety net.' },
      { step: "3", title: "Cloud Backup — Upload to Supabase Storage", desc: 'Click the "Backup Now" button under Cloud Backup. The system exports all data and uploads it to your Supabase project\'s storage bucket. No external credentials or accounts needed — it uses your existing Supabase connection. A success toast will appear when done. WARNING: Cloud backups depend on your Supabase storage availability, which may not be 100% reliable. Always also export to your computer as a secondary measure.' },
      { step: "4", title: "Automatic Weekly Backup", desc: "Toggle 'Weekly Automatic Backup' ON. When enabled, the system will check if a backup is due whenever you visit the Backup tab. If 7 or more days have passed since the last backup, it will run automatically and log the result in the history table." },
      { step: "5", title: "Import JSON — Restore from a Backup", desc: 'Click "Import JSON" and select a .json backup file from your computer. The system will restore all data from that file. WARNING: This will OVERWRITE existing data with matching IDs. Always export a fresh backup before importing an old one.' },
      { step: "6", title: "Backup History", desc: "The history table at the bottom shows all backups: Date & Time, Type (Manual or Auto), Destination (Cloud or Local), Status (Success or Failed), and File Size. This helps you verify that backups are running successfully." },
      { step: "7", title: "Save Settings", desc: 'If you changed the auto-backup toggle, click "Save Backup Settings" to store your preference.' },
    ],
    tips: [
      "Make it a habit: export a JSON backup at least once a week and store it on an external device.",
      "Before importing any backup, always export the current data first so you can revert if needed.",
    ],
    warns: [
      "⚠️ Cloud storage is convenient but not 100% reliable. Always also export to your computer as your primary backup method.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS — PROFILE
  // ═══════════════════════════════════════════════════════════════
  {
    id: "settings-profile",
    title: "Settings — Tab 9: Profile",
    icon: Users,
    steps: [
      { step: "1", title: "Where to Find It", desc: 'Go to Settings, then click the "Profile" tab. This is the first tab in Settings.' },
      { step: "2", title: "Update Your Name", desc: "Change your display name. This name appears in the top-right corner of the dashboard." },
      { step: "3", title: "Upload an Avatar", desc: "Click the avatar area to upload a profile photo. Supported formats: JPG, PNG." },
      { step: "4", title: "Change Your Password", desc: "Enter your current password, then your new password, and confirm it. Click 'Change Password' to update." },
      { step: "5", title: "Save", desc: 'Click "Save" to apply changes.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "notifications",
    title: "Notifications System — Stay Informed",
    icon: Bell,
    steps: [
      { step: "1", title: "Where to Find Notifications", desc: "Look for the bell icon (🔔) in the top-right corner of the admin dashboard. A red badge shows the number of unread notifications." },
      { step: "2", title: "What Triggers a Notification", desc: "Four things trigger notifications: (1) A new enrollment application is submitted. (2) A visitor fills out the contact form. (3) You publish a new notice. (4) A new course item is added." },
      { step: "3", title: "View and Manage", desc: "Click the bell icon to open the dropdown list. Each notification shows a brief description and a timestamp. Click a notification to mark it as read. Click 'Mark all read' at the bottom to clear all unread badges." },
    ],
    items: [
      "The system automatically checks for new notifications every 30 seconds — no need to refresh the page.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SPECIAL FEATURES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "maintenance",
    title: "Special Feature — Maintenance Mode",
    icon: Shield,
    steps: [
      { step: "1", title: "How to Enable", desc: 'Go to Settings → SEO & Features tab. Find the "Maintenance Mode" toggle and turn it ON. Click Save.' },
      { step: "2", title: "What Visitors See", desc: "Everyone visiting your public website will see a full-page 'Under Maintenance' message with your academy name, contact email, phone number, address, and office hours." },
      { step: "3", title: "How to Disable", desc: "You must type /dashboard/settings directly in the browser URL bar to access the admin dashboard. Go to the SEO & Features tab, toggle Maintenance Mode OFF, and click Save." },
    ],
    warns: [
      "⚠️ Only enable this when you absolutely need to hide the site (e.g., during major updates). The public site will be completely inaccessible.",
    ],
  },

  {
    id: "offline",
    title: "Special Feature — Offline Detection Page",
    icon: Wifi,
    items: [
      "This feature works automatically — no setup needed.",
      "If a visitor loses their internet connection while browsing your site, a full-screen 'No Internet Connection' page appears with a 'Try Again' button.",
      "When the connection is restored, they can click the button or the page will reload automatically.",
    ],
  },

  {
    id: "student-portal",
    title: "Special Feature — Student Portal",
    icon: GraduationCap,
    steps: [
      { step: "1", title: "How Students Log In", desc: "Students go to /login on your website and enter their email and password. These credentials were created automatically when you approved their enrollment." },
      { step: "2", title: "Student Dashboard", desc: "After logging in, students see their dashboard: enrolled courses with progress bars (showing completion percentage), recent notices/announcements, and available exams they can take." },
      { step: "3", title: "Courses & Progress", desc: "Students click a course to view subcategories and learning items. They can watch videos, read PDFs, view images, and click 'Mark Complete' on each item. Progress is tracked automatically per course." },
      { step: "4", title: "Exams", desc: "Students can take available exams. For MCQ questions, they select an answer and see their score immediately after submission with a breakdown of correct/incorrect answers. For subjective questions, they type their answer and it is recorded for your review." },
      { step: "5", title: "Profile", desc: "Students can view and edit their own profile: name, email, phone, avatar, guardian/parent information, and address." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // TIPS & GENERAL ADVICE
  // ═══════════════════════════════════════════════════════════════
  {
    id: "tips",
    title: "General Tips for Managing Your Academy",
    icon: Sun,
    items: [
      "Always click Save before switching between settings tabs — unsaved changes will be lost.",
      "Export a full backup (JSON) at least once a week and store it on an external device.",
      "Check the Enrollments page daily to process pending applications quickly — students expect a fast response.",
      "Use the Sections toggle to seasonalize your landing page (e.g., highlight enrollment during admission season).",
      "Test your theme changes on the live preview before saving to make sure colors and fonts look good together.",
      "Pin important notices so visitors see them immediately as a popup.",
      "Check the Backup History table regularly to confirm auto-backups are running successfully.",
    ],
  },
];

export default function AdminGuidePage() {
  const [activeSection, setActiveSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    observerRef.current = observer;

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="relative flex gap-6">
      <div ref={scrollContainerRef} className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Admin Guide</h1>
          <p className="text-muted text-sm">
            Complete walkthrough of every feature, setting, and management tool in the admin dashboard.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="bg-white rounded-xl border border-primary/5 p-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-primary">{section.title}</h2>
              </div>

              {section.steps ? (
                <div className="space-y-4">
                  {section.steps.map((s) => (
                    <div key={s.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {s.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary text-sm mb-0.5">{s.title}</h3>
                        <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {section.items ? (
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-sm leading-relaxed ${item === "" ? "h-2" : "text-muted"}`}>
                      {item ? <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> : null}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.tips ? (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Tips</p>
                  <ul className="space-y-1">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {section.warns ? (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-800 mb-1">Warnings</p>
                  <ul className="space-y-1">
                    {section.warns.map((warn, i) => (
                      <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar TOC */}
      <div className={`hidden lg:block transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
        <div className="sticky top-6 w-64">
          <div className="bg-white rounded-xl border border-primary/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-primary">On this page</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-muted hover:text-primary transition-colors"
                title="Hide sidebar"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <nav className="space-y-0.5 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {(() => {
                const regular = sections.filter((s) => !s.title.startsWith("Settings — Tab"));
                const settingsItems = sections.filter((s) => s.title.startsWith("Settings — Tab"));
                return (
                  <>
                      {regular.map((s) => {
                      const short = s.title
                        .replace(/^Special Feature — /, "")
                        .replace(/ for Managing Your Academy$/, "");
                      return (
                        <button
                          key={s.id}
                          onClick={() => scrollTo(s.id)}
                          className={`block w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${
                            activeSection === s.id
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <s.icon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{short}</span>
                          </span>
                        </button>
                      );
                    })}

                    {/* Settings parent */}
                    <div className="pt-2 mt-2 border-t border-primary/5">
                      <button
                        onClick={() => {
                          if (!settingsOpen) {
                            setSettingsOpen(true);
                            scrollTo("settings-site");
                          } else {
                            setSettingsOpen(false);
                          }
                        }}
                        className={`flex w-full items-center justify-between text-xs py-1.5 px-2 rounded transition-colors ${
                          settingsItems.some((s) => activeSection === s.id)
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Settings className="w-3 h-3 shrink-0" />
                          <span>Settings</span>
                        </span>
                        <span className={`transition-transform ${settingsOpen ? "rotate-90" : ""}`}>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                      {settingsOpen && (
                        <div className="ml-2 space-y-0.5 mt-0.5 border-l-2 border-primary/10 pl-2">
                          {settingsItems.map((s) => {
                            const short = s.title.replace(/^Settings — Tab \d+: /, "");
                            return (
                              <button
                                key={s.id}
                                onClick={() => scrollTo(s.id)}
                                className={`block w-full text-left text-xs py-1 px-2 rounded transition-colors ${
                                  activeSection === s.id
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted hover:text-primary hover:bg-primary/5"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <s.icon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{short}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </nav>
          </div>
        </div>
      </div>

      {/* Show sidebar toggle button (when sidebar is hidden) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 w-8 h-8 items-center justify-center rounded-full bg-white border border-primary/10 shadow-md text-muted hover:text-primary hover:shadow-lg transition-all ${
          sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        title="Show table of contents"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
