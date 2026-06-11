"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, CheckCircle2, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { apiList, apiUpdate, apiDelete } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const data = await apiList("contact_submissions");
      setSubmissions(Array.isArray(data) ? (data as Submission[]).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) : []);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRead(sub: Submission) {
    try {
      await apiUpdate("contact_submissions", sub.id, { isRead: !sub.isRead });
      setSubmissions((prev) => prev.map((s) => s.id === sub.id ? { ...s, isRead: !s.isRead } : s));
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDelete("contact_submissions", id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Submission deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Contact Submissions</h1>
        <p className="text-sm text-muted">{submissions.length} total submission{submissions.length !== 1 ? "s" : ""}</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted">No submissions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={cn("transition-colors", !sub.isRead && "border-primary/30 bg-primary/[0.02]")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", sub.isRead ? "bg-muted" : "bg-primary")} />
                        <span className="font-medium text-primary truncate">{sub.name}</span>
                        {!sub.isRead && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">New</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{sub.email}</span>
                        {sub.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{sub.phone}</span>}
                        {sub.subject && <span className="italic">&ldquo;{sub.subject}&rdquo;</span>}
                        <span>{formatDate(sub.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleRead(sub)} title={sub.isRead ? "Mark as unread" : "Mark as read"}>
                        <CheckCircle2 className={cn("w-4 h-4", sub.isRead ? "text-muted" : "text-primary")} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setDeleting(sub.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}>
                        {expanded === sub.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  {expanded === sub.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 pt-3 border-t border-primary/5">
                      <p className="text-sm text-primary whitespace-pre-wrap">{sub.message}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <DeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting)}
        title="Delete Submission"
        message="Are you sure you want to delete this contact submission?"
      />
    </div>
  );
}
