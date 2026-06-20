import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { getServerSession } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const svc = createServiceRoleSupabase();
    const userId = session.user.id;

    // Total conversations for this user
    const { count: totalConversations } = await svc
      .from("ai_conversations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get user's conversation IDs
    const { data: convs } = await svc
      .from("ai_conversations")
      .select("id")
      .eq("user_id", userId);

    const convIds = (convs ?? []).map((c) => c.id);

    if (convIds.length === 0) {
      return NextResponse.json({
        totalConversations: 0,
        totalMessages: 0,
        todayMessages: 0,
        totalActions: 0,
      });
    }

    // Total messages across user's conversations
    const { count: totalMessages } = await svc
      .from("ai_messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convIds);

    // Today's messages
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayMessages } = await svc
      .from("ai_messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .gte("created_at", todayStart.toISOString());

    // Total AI actions
    const { count: totalActions } = await svc
      .from("ai_action_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return NextResponse.json({
      totalConversations: totalConversations ?? 0,
      totalMessages: totalMessages ?? 0,
      todayMessages: todayMessages ?? 0,
      totalActions: totalActions ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load usage data" }, { status: 500 });
  }
}
