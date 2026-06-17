"use client";

import { Download, Upload, Cloud, Clock, AlertTriangle, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

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

export function BackupTab({ backupConfig, setBackupConfig, backupHistory, setBackupHistory, savingSettings, handleSave }: BackupTabProps) {
  const [backingUp, setBackingUp] = useState(false);
  const [importing, setImporting] = useState(false);

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
            <Button size="sm" onClick={async () => {
              setBackingUp(true);
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
                const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: "manual", destination: "cloud", status: "success", fileSize: storageResult.fileSize, errorMessage: null, fileName: storageResult.fileName };
                setBackupHistory((p) => [entry, ...p].slice(0, 50));
                await fetch("/api/backup?action=history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
                await fetch("/api/backup?action=update-last-backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
                toast.success("Backup saved to cloud storage");
              } catch (e) {
                const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: "manual", destination: "cloud", status: "failed", fileSize: null, errorMessage: String(e), fileName: null };
                setBackupHistory((p) => [entry, ...p].slice(0, 50));
                await fetch("/api/backup?action=history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
                toast.error("Cloud backup failed");
              } finally { setBackingUp(false); }
            }} disabled={backingUp}>
              {backingUp ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Backup Now
            </Button>
          </div>
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
              onChange={() => setBackupConfig((p) => ({ ...p, autoBackup: { ...p.autoBackup, enabled: !p.autoBackup.enabled } }))}
            />
          </div>
          {backupConfig.autoBackup.lastBackup && (
            <p className="text-xs text-muted">Last automatic backup: {new Date(backupConfig.autoBackup.lastBackup).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Backup History</CardTitle></CardHeader>
        <CardContent>
          {backupHistory.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">No backups recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/5">
                    <th className="text-left py-2 px-2 font-medium text-muted">Date</th>
                    <th className="text-left py-2 px-2 font-medium text-muted">Type</th>
                    <th className="text-left py-2 px-2 font-medium text-muted">Destination</th>
                    <th className="text-left py-2 px-2 font-medium text-muted">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((h) => (
                    <tr key={h.id} className="border-b border-primary/5 last:border-0">
                      <td className="py-2 px-2 text-primary">{new Date(h.timestamp).toLocaleString()}</td>
                      <td className="py-2 px-2"><span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/5 text-primary capitalize">{h.type}</span></td>
                      <td className="py-2 px-2 text-muted capitalize">{h.destination}</td>
                      <td className="py-2 px-2">
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", h.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{h.status}</span>
                      </td>
                      <td className="py-2 px-2 text-muted">{h.fileSize ? `${(h.fileSize / 1024).toFixed(1)} KB` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
