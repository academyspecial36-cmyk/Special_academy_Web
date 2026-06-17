"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CourseDraftData {
  title?: string;
  description?: string;
  duration?: string;
  category?: string;
  price?: number;
  qualification?: string;
  features?: string[];
}

export function CourseDraftRenderer({ data }: { data: CourseDraftData }) {
  const router = useRouter();
  const [title, setTitle] = useState(data.title ?? "");
  const [description, setDescription] = useState(data.description ?? "");
  const [duration, setDuration] = useState(data.duration ?? "");
  const [category, setCategory] = useState(data.category ?? "");
  const [price, setPrice] = useState(data.price?.toString() ?? "");
  const [qualification, setQualification] = useState(data.qualification ?? "");
  const [features, setFeatures] = useState<string[]>(data.features ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function addFeature() {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  }

  function removeFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    if (!title.trim()) { toast.error("Please enter a course title"); return; }
    if (!description.trim()) { toast.error("Please enter a description"); return; }
    setIsCreating(true);
    try {
      const res = await fetch("/api/data/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          duration: duration.trim() || null,
          category: category.trim() || null,
          price: price ? Number(price) : null,
          qualification: qualification.trim() || null,
          features: features.length > 0 ? features : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create course");
      }
      toast.success("Course created successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Course Draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Duration</label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 6 months" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Category</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Course category" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Price (NPR)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Qualification</label>
            <Select value={qualification} onChange={(e) => setQualification(e.target.value)}>
              <option value="">Select...</option>
              <option value="+2">+2</option>
              <option value="bachelor">Bachelor</option>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Features</label>
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add a feature"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
            />
            <Button variant="outline" size="icon" onClick={addFeature} type="button">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {features.map((feature, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md bg-primary/5 border border-primary/10 px-2 py-1 text-xs",
                  )}
                >
                  {feature}
                  <button onClick={() => removeFeature(i)} className="text-muted hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Course
        </Button>
        <Button variant="ghost" onClick={() => { setTitle(""); setDescription(""); setFeatures([]); }}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
