import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "../supabase-server";
import { createNotificationForRole } from "../notifications";
import { clearBootstrapCache } from "../bootstrap-cache";
import { ALLOWED_TABLES, RESTRICTED_TABLES, transformKeys } from "./table-config";
import { requireAdmin } from "./admin-guard";
import { cleanupTableRecordMedia } from "../storage-cleanup";

export async function handleGet(table: string, id?: string) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  let svc;
  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
    svc = createServiceRoleSupabase();
  } else {
    const authError = await requireAdmin(supabase);
    svc = authError ? supabase : createServiceRoleSupabase();
  }

  let data, error;
  if (table === "courses") {
    const query = (svc.from("courses") as any).select("*, qualification:qualifications(name)");
    if (id) {
      ({ data, error } = await query.eq("id", id).maybeSingle());
    } else {
      ({ data, error } = await query);
    }
  } else {
    ({ data, error } = id
      ? await svc.from(table).select("*").eq("id", id).maybeSingle()
      : await svc.from(table).select("*"));
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let result: unknown = Array.isArray(data) ? data.map((d: Record<string, unknown>) => transformKeys(d, table, false)) : data ? transformKeys(data as Record<string, unknown>, table, false) : null;

  if (table === "courses" && result) {
    const flattenQual = (item: Record<string, unknown>) => {
      if (typeof item.qualification === "object" && item.qualification) {
        item.qualification = (item.qualification as Record<string, unknown>).name as string ?? "";
      }
      delete (item as Record<string, unknown>).qualificationId;
      return item;
    };
    if (Array.isArray(result)) {
      result = result.map(flattenQual);
    } else {
      flattenQual(result as Record<string, unknown>);
    }
  }

  return NextResponse.json(result);
}

export async function handlePost(table: string, body: Record<string, unknown>) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  clearBootstrapCache();
  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const dbBody = transformKeys(body, table, true);
  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  if (table === "courses" && dbBody.qualification_id && typeof dbBody.qualification_id === "string") {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!isUUID.test(dbBody.qualification_id as string)) {
      const { data: qual } = await svc.from("qualifications").select("id").eq("name", dbBody.qualification_id).maybeSingle();
      dbBody.qualification_id = qual?.id ?? null;
    }
  }

  const { data, error } = table === "courses"
    ? await (svc.from("courses") as any).insert(dbBody).select("*, qualification:qualifications(name)").single()
    : await svc.from(table).insert(dbBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (table === "notices" && data) {
    const d = data as Record<string, unknown>;
    await createNotificationForRole(
      "student",
      "notice",
      "New Notice",
      (d.title as string) || "A new notice has been published.",
      "/student/notices",
    );
  }

  if (table === "items" && data) {
    const d = data as Record<string, unknown>;
    await createNotificationForRole(
      "student",
      "course_item",
      "New Course Material",
      `New ${d.type as string}: ${(d.title as string) || "A new item has been added to your course."}`,
      "/student/courses",
    );
  }

  const postResult = transformKeys(data as Record<string, unknown>, table, false);
  if (table === "courses" && postResult && typeof postResult.qualification === "object" && postResult.qualification) {
    postResult.qualification = (postResult.qualification as Record<string, unknown>).name as string ?? "";
    delete (postResult as Record<string, unknown>).qualificationId;
  }
  return NextResponse.json(postResult, { status: 201 });
}

export async function handlePut(table: string, id: string, body: Record<string, unknown>) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  clearBootstrapCache();
  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const dbBody = transformKeys(body, table, true);
  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  if (table === "courses" && dbBody.qualification_id && typeof dbBody.qualification_id === "string") {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!isUUID.test(dbBody.qualification_id as string)) {
      const { data: qual } = await svc.from("qualifications").select("id").eq("name", dbBody.qualification_id).maybeSingle();
      dbBody.qualification_id = qual?.id ?? null;
    }
  }

  const { data, error } = table === "courses"
    ? await (svc.from("courses") as any).update(dbBody).eq("id", id).select("*, qualification:qualifications(name)").single()
    : await svc.from(table).update(dbBody).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const putResult = transformKeys(data as Record<string, unknown>, table, false);
  if (table === "courses" && putResult && typeof putResult.qualification === "object" && putResult.qualification) {
    putResult.qualification = (putResult.qualification as Record<string, unknown>).name as string ?? "";
    delete (putResult as Record<string, unknown>).qualificationId;
  }
  return NextResponse.json(putResult);
}

export async function handleDelete(table: string, id: string) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  clearBootstrapCache();
  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  // Fetch record first to clean up associated media files
  const { data: record } = await svc.from(table).select("*").eq("id", id).maybeSingle();
  if (record) {
    await cleanupTableRecordMedia(table, record as Record<string, unknown>);
  }

  const { error } = await svc.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export function getIdFromUrl(request: Request): string | undefined {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const idIndex = pathParts.indexOf("data") + 2;
  return pathParts[idIndex] ?? undefined;
}
