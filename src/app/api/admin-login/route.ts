import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();


  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}
