import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { passcode } = await request.json();
  const valid = process.env.ADMIN_PASSCODE || "admin@123";

  if (passcode === valid) {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}
