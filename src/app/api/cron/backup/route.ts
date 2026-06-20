import { NextResponse } from "next/server";
import { exportAllData, uploadToSupabaseStorage, generateBackupId, isBackupDue, type BackupEntry } from "@/lib/backup";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServiceRoleSupabase();

    const { data: settingsRow } = await supabase.from("settings").select("config").maybeSingle();
    if (!settingsRow) {
      return NextResponse.json({ skipped: true, reason: "No settings row" });
    }

    const config = (settingsRow as { config?: Record<string, unknown> }).config || {};
    const autoBackup = ((config.backup as Record<string, unknown>)?.autoBackup as
      { enabled: boolean; frequency: string; lastBackup: string | null } | undefined)
      || { enabled: false, frequency: "weekly", lastBackup: null };

    if (!autoBackup.enabled) {
      return NextResponse.json({ skipped: true, reason: "Auto-backup not enabled" });
    }

    if (!isBackupDue(autoBackup.lastBackup)) {
      return NextResponse.json({ skipped: true, reason: "Not yet due" });
    }

    const jsonData = await exportAllData();
    const result = await uploadToSupabaseStorage(jsonData);

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

    const { data: row } = await supabase.from("settings").select("config").maybeSingle();
    const cfg = { ...((row as { config?: Record<string, unknown> } | null)?.config || {}) } as Record<string, unknown>;
    const history = (cfg.backupHistory as BackupEntry[]) || [];
    history.unshift(entry);
    if (history.length > 50) history.length = 50;
    cfg.backupHistory = history;
    const existing = (cfg.backup as Record<string, unknown>) || {};
    cfg.backup = { ...existing, autoBackup: { ...(existing.autoBackup as Record<string, unknown> || {}), lastBackup: new Date().toISOString() } };

    const { data: rowToUpdate } = await supabase.from("settings").select("id").maybeSingle();
    if (rowToUpdate) {
      await supabase.from("settings").update({ config: cfg } as never).eq("id", (rowToUpdate as { id: string }).id);
    }

    return NextResponse.json({ success: true, fileName: result.fileName, fileSize: result.fileSize });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
