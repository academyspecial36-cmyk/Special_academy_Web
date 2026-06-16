"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FAQDraftData {
  question?: string;
  answer?: string;
}

export function FAQDraftRenderer({ data }: { data: FAQDraftData }) {
  const router = useRouter();
  const [question, setQuestion] = useState(data.question ?? "");
  const [answer, setAnswer] = useState(data.answer ?? "");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (!question.trim()) { toast.error("Please enter a question"); return; }
    if (!answer.trim()) { toast.error("Please enter an answer"); return; }
    setIsCreating(true);
    try {
      const res = await fetch("/api/data/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create FAQ");
      }
      toast.success("FAQ created successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create FAQ");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">FAQ Draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Question</label>
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="FAQ question" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Answer</label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="FAQ answer" rows={4} />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
          Create FAQ
        </Button>
        <Button variant="ghost" onClick={() => { setQuestion(""); setAnswer(""); }}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
