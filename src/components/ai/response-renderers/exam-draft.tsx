"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctAnswer?: number;
}

interface ExamDraftData {
  title?: string;
  questions?: Question[];
}

export function ExamDraftRenderer({ data }: { data: ExamDraftData }) {
  const router = useRouter();
  const [title, setTitle] = useState(data.title ?? "");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (!title.trim()) { toast.error("Please enter an exam title"); return; }
    setIsCreating(true);
    try {
      const res = await fetch("/api/data/exam_categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create exam");
      }
      toast.success("Exam created successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create exam");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Exam Draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Exam Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam title" />
        </div>
        {data.questions && data.questions.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted">Questions ({data.questions.length})</p>
            {data.questions.map((q, i) => (
              <div key={i} className="rounded-lg border bg-accent/50 p-3 space-y-2">
                <p className="text-sm font-medium">
                  {i + 1}. {q.question}
                </p>
                <ul className="space-y-1 pl-4">
                  {q.options.map((opt, j) => (
                    <li key={j} className="text-xs text-muted flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">
                        {String.fromCharCode(65 + j)}
                      </span>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Exam
        </Button>
        <Button variant="ghost" onClick={() => setTitle("")}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
