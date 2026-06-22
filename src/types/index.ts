export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  qualification: string;
  features: string[];
  image: string;
  category: string;
  price?: string;
  isPopular?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: "admission" | "exam" | "holiday" | "event" | "announcement";
  date: string;
  isPinned: boolean;
  author: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: "student" | "parent" | "cadet";
  content: string;
  rating: number;
  image?: string;
  achievement?: string;
  qualification?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export interface EnrollmentFormData {
  fullName: string;
  email: string;
  phone: string;
  qualificationId: string;
  interestedCourse: string;
  guardianName: string;
  guardianContact: string;
  address: string;
  message: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualificationId?: string;
  qualification?: string;
  enrolledCourses: string[];
  joinDate: string;
  status: "active" | "inactive";
  image?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface StatItem {
  label: string;
  value: string;
  suffix?: string;
  description?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  qualification: string;
  experience: string;
  image: string;
  subjects: string[];
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

export interface Item {
  id: string;
  subcategoryId: string;
  type: "video" | "pdf" | "image";
  title: string;
  description: string;
  url: string;
  images?: string[];
  duration?: string;
  createdAt: string;
  status: "paid" | "free";
  hidden: boolean;
}

export interface Subcategory {
  id: string;
  courseId: string;
  title: string;
  thumbnail: string;
  shortDescription: string;
  createdAt: string;
  status: "paid" | "free";
  hidden: boolean;
  items: Item[];
}

export interface ExamCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface ExamSubcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export type QuestionOption = string | { text: string; image?: string };

export interface Question {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  type: "mcq" | "subjective";
  question: string;
  options: QuestionOption[];
  answer: string;
  explanation: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  image?: string;
  status: "draft" | "published";
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ExamAttempt {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  studentName: string;
  answers: { questionId: string; answer: string; correct: boolean }[];
  score: number;
  total: number;
  completedAt: string;
}

export interface RecordingChunk {
  url: string;
  duration: number;
  createdAt: string;
  size: number;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  instructor: string;
  platform: "zoom" | "google_meet" | "youtube_live" | "other";
  joinUrl: string;
  recordingUrl?: string;
  recordingChunks?: RecordingChunk[];
  startTime: string;
  durationMinutes: number;
  courseId?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  color?: string;
  createdAt: string;
  updatedAt: string;
}
