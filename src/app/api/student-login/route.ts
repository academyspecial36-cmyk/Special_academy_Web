import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const validEmail = process.env.STUDENT_EMAIL || "student@cadetacademy.edu";
  const validPassword = process.env.STUDENT_PASSWORD || "student123";

  if (email === validEmail && password === validPassword) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
}
