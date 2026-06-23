"use client";

import { motion } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, AlertCircle, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatShortDate } from "@/lib/utils";

interface Communication {
  id: string;
  type: "email";
  template_id: string | null;
  subject: string | null;
  body: string;
  recipient_type: string;
  class_filter: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: "pending" | "sending" | "completed" | "partial" | "failed";
  created_at: string;
  sent_at: string | null;
}

interface CommunicationDetail extends Communication {
  recipients?: {
    id: string;
    recipient_name: string;
    recipient_email: string;
    status: string;
    error_message: string | null;
  }[];
}

const statusIcon: Record<string, React.ElementType> = {
  completed: CheckCircle,
  partial: AlertCircle,
  failed: XCircle,
  pending: Clock,
  sending: Loader2,
};

const statusColor: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-slate-100 text-slate-700",
  sending: "bg-blue-100 text-blue-700",
};

interface HistoryTabProps {
  history: Communication[];
  loading: boolean;
  selectedComm: CommunicationDetail | null;
  setSelectedComm: (c: CommunicationDetail | null) => void;
  loadingDetails: boolean;
  loadHistoryDetails: (id: string) => void;
}

export default function HistoryTab({
  history,
  loading,
  selectedComm,
  setSelectedComm,
  loadingDetails,
  loadHistoryDetails,
}: HistoryTabProps) {
  return (
    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Delivery History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-primary/5 rounded-lg animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No communications sent yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((comm) => {
                const StatusIcon = statusIcon[comm.status] || Clock;
                return (
                  <div
                    key={comm.id}
                    onClick={() => loadHistoryDetails(comm.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-primary/5 hover:bg-accent/50 cursor-pointer transition-all"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", statusColor[comm.status])}>
                      <StatusIcon className={cn("w-5 h-5", comm.status === "sending" && "animate-spin")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-primary truncate">{comm.subject || comm.type + " broadcast"}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">{comm.type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                        <span>{formatShortDate(comm.created_at)}</span>
                        <span>{comm.recipient_count} recipients</span>
                        {comm.sent_count > 0 && <span className="text-emerald-600">{comm.sent_count} sent</span>}
                        {comm.failed_count > 0 && <span className="text-red-600">{comm.failed_count} failed</span>}
                        <Badge className={cn("text-[10px]", statusColor[comm.status])}>{comm.status}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedComm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Delivery Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedComm(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="h-32 bg-primary/5 rounded-lg animate-pulse" />
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-accent">
                    <p className="text-xs text-muted">Type</p>
                    <p className="text-sm font-medium text-primary capitalize">{selectedComm.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <p className="text-xs text-muted">Status</p>
                    <Badge className={cn("mt-0.5", statusColor[selectedComm.status])}>{selectedComm.status}</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <p className="text-xs text-muted">Recipients</p>
                    <p className="text-sm font-medium text-primary">{selectedComm.recipient_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <p className="text-xs text-muted">Sent</p>
                    <p className="text-sm font-medium text-emerald-600">{selectedComm.sent_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <p className="text-xs text-muted">Failed</p>
                    <p className="text-sm font-medium text-red-600">{selectedComm.failed_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <p className="text-xs text-muted">Date</p>
                    <p className="text-sm font-medium text-primary">{formatShortDate(selectedComm.created_at)}</p>
                  </div>
                </div>

                {selectedComm.recipients && selectedComm.recipients.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-primary mb-2">Recipient Details</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/5">
                            <th className="text-left py-2 px-2 font-medium text-muted text-xs">Name</th>
                            <th className="text-left py-2 px-2 font-medium text-muted text-xs">Email</th>
                            <th className="text-left py-2 px-2 font-medium text-muted text-xs">Status</th>
                            <th className="text-left py-2 px-2 font-medium text-muted text-xs">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComm.recipients.map((r) => (
                            <tr key={r.id} className="border-b border-primary/5 last:border-0">
                              <td className="py-2 px-2 text-primary">{r.recipient_name}</td>
                              <td className="py-2 px-2 text-muted">{r.recipient_email || "-"}</td>
                              <td className="py-2 px-2">
                                <Badge className={cn("text-[10px]", r.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                  {r.status}
                                </Badge>
                              </td>
                              <td className="py-2 px-2 text-red-500 text-xs">{r.error_message || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
