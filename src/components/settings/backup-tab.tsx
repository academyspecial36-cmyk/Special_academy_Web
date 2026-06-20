"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Cloud, Clock, AlertTriangle, Save, Loader2, History, CheckCircle2, XCircle, RefreshCw, HardDrive, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface BackupConfig {
  autoBackup: { enabled: boolean; frequency: string; lastBackup: string | null };
}

interface BackupHistoryItem {
  id: string; timestamp: string; type: string; destination: string;
  status: string; fileSize: number | null; errorMessage: string | null; fileName: string | null;
}

interface BackupTabProps {
  backupConfig: BackupConfig;
  setBackupConfig: (updater: (prev: BackupConfig) => BackupConfig) => void;
  backupHistory: BackupHistoryItem[];
  setBackupHistory: (updater: (prev: BackupHistoryItem[]) => BackupHistoryItem[]) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// Only notify once per session per 24h window
let upcomingNotified = false;

export function BackupTab({ backupConfig, setBackupConfig, backupHistory, setBackupHistory, savingSettings, handleSave }: BackupTabProps) {
  const [backingUp, setBackingUp] = useState(false);
  const [importing, setImporting] = useState(false);
  const [storageStats, setStorageStats] = useState<{ totalBytes: number; totalFiles: number; limit: number; usedPercent: number } | null>(null);
  const [mediaBackingUp, setMediaBackingUp] = useState(false);

  // Fetch stats, history, and DB-backed config on mount
  useEffect(() => {
    fetch("/api/media/stats").then(r => r.ok && r.json()).then(d => setStorageStats(d)).catch(() => {});
    fetch("/api/backup?action=history").then(r => r.ok && r.json()).then(h => { if (Array.isArray(h)) setBackupHistory(() => h); }).catch(() => {});
    fetch("/api/backup?action=check-auto").then(r => r.ok && r.json()).then(c => {
      if (c?.lastBackup) {
        setBackupConfig((p) => ({
          ...p,
          autoBackup: { ...p.autoBackup, lastBackup: c.lastBackup, enabled: c.enabled },
        }));
      }
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Weekly auto-backup check
  useEffect(() => {
    if (!backupConfig.autoBackup.enabled) return;

    const lastBackup = backupConfig.autoBackup.lastBackup;
    const needsBackup = !lastBackup || (Date.now() - new Date(lastBackup).getTime() >= ONE_WEEK_MS);

    if (!needsBackup) return;

    const timer = setTimeout(() => {
      performCloudBackup("automatic");
    }, 5000);

    return () => clearTimeout(timer);
  }, [backupConfig.autoBackup.enabled, backupConfig.autoBackup.lastBackup]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic check every hour for weekly backup + 1-day-before notification
  useEffect(() => {
    if (!backupConfig.autoBackup.enabled) return;

    const check = () => {
      const lastBackup = backupConfig.autoBackup.lastBackup;
      if (!lastBackup) return;

      const last = new Date(lastBackup).getTime();
      const nextDue = last + ONE_WEEK_MS;
      const msUntilDue = nextDue - Date.now();

      // 1-day-before notification (once per session)
      if (msUntilDue > 0 && msUntilDue <= ONE_DAY_MS && !upcomingNotified) {
        upcomingNotified = true;
        toast.warning("Auto-backup due within 24 hours", {
          description: "The weekly auto-backup will run soon. Ensure you are online.",
        });
        fetch("/api/backup?action=notify-upcoming", { method: "POST" }).catch(() => {});
      }

      // Run if due
      if (Date.now() - last >= ONE_WEEK_MS) {
        performCloudBackup("automatic");
      }
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [backupConfig.autoBackup.enabled, backupConfig.autoBackup.lastBackup]); // eslint-disable-line react-hooks/exhaustive-deps

  async function performCloudBackup(type: string) {
    try {
      const exp = await fetch("/api/backup?action=export");
      const data = await exp.json();
      const storageRes = await fetch("/api/backup?action=supabase-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!storageRes.ok) throw new Error((await storageRes.json()).error || "Upload failed");
      const storageResult = await storageRes.json();
      const entry: BackupHistoryItem = {
        id: crypto.randomUUID(), timestamp: new Date().toISOString(), type,
        destination: "cloud", status: "success", fileSize: storageResult.fileSize,
        errorMessage: null, fileName: storageResult.fileName,
      };
      setBackupHistory((p) => [entry, ...p].slice(0, 50));
      await fetch("/api/backup?action=history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
      await fetch("/api/backup?action=update-last-backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      setBackupConfig((p) => ({ ...p, autoBackup: { ...p.autoBackup, lastBackup: new Date().toISOString() } }));
      if (type === "automatic") {
        toast.success("Weekly auto-backup completed");
      }
    } catch (e) {
      const entry: BackupHistoryItem = {
        id: crypto.randomUUID(), timestamp: new Date().toISOString(), type,
        destination: "cloud", status: "failed", fileSize: null,
        errorMessage: String(e), fileName: null,
      };
      setBackupHistory((p) => [entry, ...p].slice(0, 50));
      await fetch("/api/backup?action=history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
      if (type === "automatic") {
        console.error("Weekly auto-backup failed:", e);
      }
    }
  }

  async function handleManualBackup() {
    setBackingUp(true);
    await performCloudBackup("manual");
    setBackingUp(false);
  }

  async function handleToggleAutoBackup() {
    const newEnabled = !backupConfig.autoBackup.enabled;
    setBackupConfig((p) => ({ ...p, autoBackup: { ...p.autoBackup, enabled: newEnabled } }));
    try {
      const res = await fetch("/api/backup?action=save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoBackup: {
            enabled: newEnabled,
            frequency: backupConfig.autoBackup.frequency,
            lastBackup: backupConfig.autoBackup.lastBackup,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(newEnabled ? "Auto-backup enabled" : "Auto-backup disabled");
    } catch {
      setBackupConfig((p) => ({ ...p, autoBackup: { ...p.autoBackup, enabled: !newEnabled } }));
      toast.error("Failed to save backup setting");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4 text-secondary" /> Export / Import</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={async () => {
              setBackingUp(true);
              try {
                const res = await fetch("/api/backup?action=export");
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Data exported successfully");
              } catch { toast.error("Export failed"); }
              finally { setBackingUp(false); }
            }} disabled={backingUp}>
              {backingUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export JSON
            </Button>
            <input type="file" accept=".json" id="import-json" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImporting(true);
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                const res = await fetch("/api/backup?action=import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ data }),
                });
                await res.json();
                toast.success("Data imported successfully");
              } catch { toast.error("Import failed - invalid file"); }
              finally { setImporting(false); e.target.value = ""; }
            }} />
            <Button variant="outline" disabled={importing} onClick={() => document.getElementById("import-json")?.click()}>
              {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Import JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="w-4 h-4 text-secondary" /> Cloud Backup (Supabase Storage)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Important</p>
              <p>Cloud backups may not be 100% reliable — they depend on your Supabase project&apos;s storage availability. Always use <strong>Export JSON</strong> above to save a copy to your computer or external device as a secondary safety measure.</p>
            </div>
          </div>
          <p className="text-xs text-muted">Backups are stored in your Supabase project&apos;s storage bucket. No external credentials needed.</p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div>
              <p className="text-sm font-medium text-primary">Backup to Cloud Now</p>
              <p className="text-xs text-muted">Export all data and save to Supabase Storage</p>
            </div>
            <Button size="sm" onClick={handleManualBackup} disabled={backingUp}>
              {backingUp ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><HardDrive className="w-4 h-4 text-secondary" /> Media Storage</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {storageStats ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-muted">{formatSize(storageStats.totalBytes)} used across {storageStats.totalFiles} files</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", storageStats.usedPercent > 90 ? "bg-red-500" : storageStats.usedPercent > 70 ? "bg-yellow-500" : "bg-primary")} style={{ width: `${Math.min(storageStats.usedPercent, 100)}%` }} />
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap">{storageStats.usedPercent}% of {formatSize(storageStats.limit)}</span>
              </div>
              <Button size="sm" variant="outline" onClick={async () => {
                setMediaBackingUp(true);
                try {
                  const res = await fetch("/api/media/backup");
                  if (!res.ok) throw new Error("Backup failed");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `media-backup-${new Date().toISOString().split("T")[0]}.zip`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Media backup downloaded");
                } catch (e) {
                  toast.error((e as Error).message);
                } finally {
                  setMediaBackingUp(false);
                }
              }} disabled={mediaBackingUp}>
                {mediaBackingUp ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Archive className="w-4 h-4 mr-1" />}
                Download All Media
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted">Loading storage stats...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Automatic Backup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Weekly Automatic Backup</p>
              <p className="text-xs text-muted">Automatically backup data to cloud storage every week</p>
            </div>
            <ToggleSwitch
              checked={backupConfig.autoBackup.enabled}
              onChange={handleToggleAutoBackup}
            />
          </div>
          {backupConfig.autoBackup.lastBackup ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <RefreshCw className="w-3 h-3" />
              Last auto-backup: {new Date(backupConfig.autoBackup.lastBackup).toLocaleString()}
              {backupConfig.autoBackup.enabled && (
                <>
                  <span className="text-emerald-600 font-medium">
                    · Next: {new Date(new Date(backupConfig.autoBackup.lastBackup).getTime() + ONE_WEEK_MS).toLocaleDateString()}
                  </span>
                  {(() => {
                    const msUntilDue = new Date(backupConfig.autoBackup.lastBackup).getTime() + ONE_WEEK_MS - Date.now();
                    if (msUntilDue > 0 && msUntilDue <= ONE_DAY_MS) {
                      const hours = Math.ceil(msUntilDue / (60 * 60 * 1000));
                      return (
                        <span className="text-amber-600 font-medium">
                          · Due in {hours}h
                        </span>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">No automatic backup has run yet. Enable and save settings to start.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4 text-secondary" /> Backup History & Logs</CardTitle>
          {backupHistory.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setBackupHistory(() => [])} className="text-xs text-muted hover:text-red-500">
              Clear Logs
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {backupHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">No backup logs recorded yet.</p>
              <p className="text-xs text-muted mt-1">Run a manual backup or enable automatic backups to see logs here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backupHistory.map((h) => (
                <div
                  key={h.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    h.status === "success" ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                  )}
                >
                  {h.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-primary capitalize">{h.type} backup</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        h.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {h.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted mt-0.5">
                      <span>{new Date(h.timestamp).toLocaleString()}</span>
                      <span>· {h.destination}</span>
                      {h.fileSize && <span>· {(h.fileSize / 1024).toFixed(1)} KB</span>}
                      {h.fileName && <span>· {h.fileName}</span>}
                    </div>
                    {h.errorMessage && (
                      <p className="text-xs text-red-600 mt-1 break-words">{h.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={savingSettings}>
          {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {savingSettings ? "Saving..." : "Save Backup Settings"}
        </Button>
      </div>
    </div>
  );
}
