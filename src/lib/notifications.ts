import { createServiceRoleSupabase } from "./supabase-server";

type NotificationType = "enrollment" | "contact" | "notice" | "course_item";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  const supabase = createServiceRoleSupabase();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    link: link ?? null,
  });
  if (error) {
    console.error(`[Notification] Failed to create for user ${userId}:`, error.message);
  }
}

export async function createNotificationForRole(
  role: "admin" | "student",
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  const supabase = createServiceRoleSupabase();
  const { data: users } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", role);

  if (!users || users.length === 0) return;

  const notifications = users.map((u) => ({
    user_id: u.id,
    type,
    title,
    message,
    link: link ?? null,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  if (error) {
    console.error(`[Notification] Failed to create for role ${role}:`, error.message);
  }
}
