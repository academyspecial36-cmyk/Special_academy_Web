import { NextResponse } from "next/server";
import { exportAllData, importAllData, uploadToSupabaseStorage, generateBackupId, isBackupDue, type BackupEntry } from "@/lib/backup";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { seedSettings } from "@/lib/settings-server";
import { createNotificationForRole } from "@/lib/notifications";
import { requireAdmin } from "@/lib/api/auth-guard";

async function ensureSettingsRow(svc: ReturnType<typeof createServiceRoleSupabase>) {
  const { data } = await svc.from("settings").select("id").maybeSingle();
  if (!data) {
    await seedSettings();
    const { data: newRow } = await svc.from("settings").select("id").maybeSingle();
    return newRow as { id: string } | null;
  }
  return data as { id: string };
}

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "export") {
      const data = await exportAllData();
      return NextResponse.json(data);
    }

    if (action === "history") {
      const svc = createServiceRoleSupabase();
      const { data } = await svc.from("settings").select("config").maybeSingle();
      const config = (data as { config?: Record<string, unknown> } | null)?.config || {};
      const history = (config.backupHistory as BackupEntry[]) || [];
      return NextResponse.json(history);
    }

    if (action === "check-auto") {
      const svc = createServiceRoleSupabase();
      const { data } = await svc.from("settings").select("config").maybeSingle();
      const config = (data as { config?: Record<string, unknown> } | null)?.config || {};
      const autoBackup = ((config.backup as Record<string, unknown>)?.autoBackup as { enabled: boolean; frequency: string; lastBackup: string | null } | undefined) || { enabled: false, frequency: "weekly", lastBackup: null };
      const due = autoBackup.enabled && isBackupDue(autoBackup.lastBackup);
      return NextResponse.json({ due, enabled: autoBackup.enabled, lastBackup: autoBackup.lastBackup });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    if (action === "import") {
      const results = await importAllData(body.data as Record<string, unknown[]>);
      return NextResponse.json({ results });
    }

    if (action === "history") {
      const entry = body as BackupEntry;
      const svc = createServiceRoleSupabase();
      const row = await ensureSettingsRow(svc);
      if (!row) return NextResponse.json({ error: "Cannot access settings" }, { status: 500 });
      const { data } = await svc.from("settings").select("config").eq("id", row.id).maybeSingle();
      const config = (data as { config?: Record<string, unknown> } | null)?.config || {};
      const history = (config.backupHistory as BackupEntry[]) || [];
      history.unshift(entry);
      if (history.length > 50) history.length = 50;
      config.backupHistory = history;
      await svc.from("settings").update({ config } as never).eq("id", row.id);
      return NextResponse.json({ success: true });
    }

    if (action === "supabase-storage") {
      const jsonData = body.data as Record<string, unknown[]>;
      const result = await uploadToSupabaseStorage(jsonData);
      return NextResponse.json(result);
    }

    if (action === "save-config") {
      const { autoBackup } = body as {
        autoBackup: { enabled: boolean; frequency: string; lastBackup: string | null };
      };
      const svc = createServiceRoleSupabase();
      const row = await ensureSettingsRow(svc);
      if (!row) return NextResponse.json({ error: "Cannot access settings" }, { status: 500 });
      const { data } = await svc.from("settings").select("config").eq("id", row.id).maybeSingle();
      const existingConfig = ((data as { config?: Record<string, unknown> } | null)?.config || {}) as Record<string, unknown>;
      const config = { ...existingConfig, backup: { autoBackup } };
      await svc.from("settings").update({ config } as never).eq("id", row.id);
      return NextResponse.json({ success: true });
    }

    if (action === "update-last-backup") {
      const svc = createServiceRoleSupabase();
      const row = await ensureSettingsRow(svc);
      if (!row) return NextResponse.json({ error: "Cannot access settings" }, { status: 500 });
      const { data } = await svc.from("settings").select("config").eq("id", row.id).maybeSingle();
      const config = { ...((data as { config?: Record<string, unknown> } | null)?.config || {}) } as Record<string, unknown>;
      const existingBackup = (config.backup as Record<string, unknown>) || {};
      config.backup = { ...existingBackup, autoBackup: { ...(existingBackup.autoBackup as Record<string, unknown> || {}), lastBackup: new Date().toISOString() } };
      await svc.from("settings").update({ config } as never).eq("id", row.id);
      return NextResponse.json({ success: true });
    }

    if (action === "notify-upcoming") {
      await createNotificationForRole(
        "admin",
        "notice",
        "Auto-backup due within 24 hours",
        "The weekly automatic backup is scheduled to run soon. Ensure your Supabase storage is available.",
        "/dashboard/settings?tab=backup",
      );
      return NextResponse.json({ success: true });
    }

    if (action === "auto") {
      const svc = createServiceRoleSupabase();
      const { data } = await svc.from("settings").select("config").maybeSingle();
      const config = (data as { config?: Record<string, unknown> } | null)?.config || {};
      const autoBackup = ((config.backup as Record<string, unknown>)?.autoBackup as { enabled: boolean; frequency: string; lastBackup: string | null } | undefined) || { enabled: false, frequency: "weekly", lastBackup: null };

      if (!autoBackup.enabled) {
        return NextResponse.json({ skipped: true, reason: "Auto-backup not enabled" });
      }

      if (!isBackupDue(autoBackup.lastBackup)) {
        return NextResponse.json({ skipped: true, reason: "Not yet due" });
      }

      try {
        const jsonData = await exportAllData();
        const result = await uploadToSupabaseStorage(jsonData);

        const row = await ensureSettingsRow(svc);
        if (row) {
          const entry: BackupEntry = {
            id: generateBackupId(),
            timestamp: new Date().toISOString(),
            type: "auto",
            destination: "cloud",
            status: "success",
            fileSize: result.fileSize,
            errorMessage: null,
            fileName: result.fileName,
          };
          const { data: rowData } = await svc.from("settings").select("config").eq("id", row.id).maybeSingle();
          const cfg = { ...((rowData as { config?: Record<string, unknown> } | null)?.config || {}) } as Record<string, unknown>;
          const history = (cfg.backupHistory as BackupEntry[]) || [];
          history.unshift(entry);
          if (history.length > 50) history.length = 50;
          cfg.backupHistory = history;
          const existing = (cfg.backup as Record<string, unknown>) || {};
          cfg.backup = { ...existing, autoBackup: { ...(existing.autoBackup as Record<string, unknown> || {}), lastBackup: new Date().toISOString() } };
          await svc.from("settings").update({ config: cfg } as never).eq("id", row.id);
        }

        return NextResponse.json({ success: true, fileName: result.fileName, fileSize: result.fileSize });
      } catch (e) {
        const row = await ensureSettingsRow(svc);
        if (row) {
          const entry: BackupEntry = {
            id: generateBackupId(),
            timestamp: new Date().toISOString(),
            type: "auto",
            destination: "cloud",
            status: "failed",
            fileSize: null,
            errorMessage: String(e),
            fileName: null,
          };
          const { data: rowData } = await svc.from("settings").select("config").eq("id", row.id).maybeSingle();
          const cfg = { ...((rowData as { config?: Record<string, unknown> } | null)?.config || {}) } as Record<string, unknown>;
          const history = (cfg.backupHistory as BackupEntry[]) || [];
          history.unshift(entry);
          if (history.length > 50) history.length = 50;
          cfg.backupHistory = history;
          await svc.from("settings").update({ config: cfg } as never).eq("id", row.id);
        }
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
