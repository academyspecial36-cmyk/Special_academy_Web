"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Select } from "./select";
import type { Enrollment } from "@/lib/context/students-context";

interface EditEnrollmentModalProps {
  open: boolean;
  enrollment: Enrollment | null;
  courses: { title: string }[];
  onClose: () => void;
  onSave: (id: string, data: { interestedCourse?: string; status?: string }) => Promise<void>;
}

export function EditEnrollmentModal({
  open,
  enrollment,
  courses,
  onClose,
  onSave,
}: EditEnrollmentModalProps) {
  const [course, setCourse] = useState(enrollment?.interestedCourse ?? "");
  const [status, setStatus] = useState(enrollment?.status ?? "pending");
  const [saving, setSaving] = useState(false);

  if (!enrollment) return null;

  const { id } = enrollment;
  const uniqueCourses = Array.from(new Set(courses.map((c) => c.title)));

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(id, { interestedCourse: course, status });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Enrollment">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-primary mb-1.5 block">Course</label>
          <Select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">Select a course</option>
            {uniqueCourses.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-primary mb-1.5 block">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="unverified">Unverified</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
