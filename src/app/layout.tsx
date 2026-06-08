import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Special academy | Preparing Future Leaders",
    template: "%s | Special academy",
  },
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "Nepal's premier cadet preparation academy. We prepare students for cadet college entrance exams through discipline, academic excellence, and leadership development.",
  keywords: [
    "cadet academy",
    "cadet college preparation",
    "military school preparation",
    "cadet entrance exam",
    "scholarship preparation",
    "leadership training",
    "Nepal education",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cadetacademy.edu",
    siteName: "Special academy",
    title: "Special academy | Preparing Future Leaders",
    description:
      "Nepal's premier cadet preparation academy. Discipline, excellence, and leadership.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
