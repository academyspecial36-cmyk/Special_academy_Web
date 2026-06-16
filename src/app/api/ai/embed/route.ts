import { NextRequest, NextResponse } from "next/server";
import { seedDocuments } from "@/lib/ai/rag";

async function handleAction(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action === "seed") {
    const count = await seedDocuments();
    return NextResponse.json({ success: true, count });
  }
  return NextResponse.json({ error: "Provide ?action=seed" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  try {
    return await handleAction(req);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handleAction(req);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process" },
      { status: 500 }
    );
  }
}
