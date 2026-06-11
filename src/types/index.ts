export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  classLevel: string;
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
}

export interface Testimonial {
  id: string;
  name: string;
  role: "student" | "parent" | "cadet";
  content: string;
  rating: number;
  image?: string;
  achievement?: string;
  class?: string;
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
  currentClass: string;
  interestedCourse: string;
  guardianName: string;
  guardianContact: string;
  address: string;
  previousSchool: string;
  message: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  enrolledCourses: string[];
  joinDate: string;
  status: "active" | "inactive";
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

export interface Question {
  id: string;
  categoryId: string;
  type: "mcq" | "subjective";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  categoryId: string;
  studentName: string;
  answers: { questionId: string; answer: string; correct: boolean }[];
  score: number;
  total: number;
  completedAt: string;
}
