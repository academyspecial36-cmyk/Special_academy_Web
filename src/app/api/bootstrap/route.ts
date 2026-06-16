import { NextResponse } from "next/server";
import { getBootstrapData } from "@/lib/bootstrap-cache";

export async function GET() {
  try {
    const data = await getBootstrapData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Bootstrap error:", err);
    return NextResponse.json({ error: "Failed to bootstrap data" }, { status: 500 });
  }
}
