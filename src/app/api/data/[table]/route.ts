import { NextRequest } from "next/server";
import { handleGet, handlePost } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const url = new URL(_request.url);
  const id = url.searchParams.get("id") ?? undefined;
  return handleGet(table, id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const body = await request.json();
  return handlePost(table, body);
}
