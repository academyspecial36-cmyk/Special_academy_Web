"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (user.role === "admin") {
      router.replace("/dashboard");
    } else if (user.role === "student") {
      router.replace("/student");
    }
  }, [user, isLoading, router]);

  return null;
}
