import { NextResponse } from "next/server";
import { fetchSettings } from "@/lib/settings-server";

export async function GET() {
  try {
    const settings = await fetchSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
