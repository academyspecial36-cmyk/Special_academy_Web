"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Select } from "./select";

interface BulkEditEnrollmentModalProps {
  open: boolean;
  count: number;
  courses: { title: string }[];
  onClose: () => void;
  onSave: (data: { interestedCourse?: string; status?: string }) => Promise<void>;
}

export function BulkEditEnrollmentModal({
  open,
  count,
  courses,
  onClose,
  onSave,
}: BulkEditEnrollmentModalProps) {
  const [interestedCourse, setInterestedCourse] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const uniqueCourses = Array.from(new Set(courses.map((c) => c.title)));

  async function handleSave() {
    const data: { interestedCourse?: string; status?: string } = {};
    if (interestedCourse) data.interestedCourse = interestedCourse;
    if (status) data.status = status;

    if (Object.keys(data).length === 0) {
      return;
    }

    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Bulk Edit ${count} Enrollment(s)`}>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Set fields below to update all {count} selected enrollments. Leave a field empty to skip it.
        </p>
        <div>
          <label className="text-sm font-medium text-primary mb-1.5 block">
            Course <span className="text-muted font-normal">(optional)</span>
          </label>
          <Select value={interestedCourse} onChange={(e) => setInterestedCourse(e.target.value)}>
            <option value="">— No change —</option>
            {uniqueCourses.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-primary mb-1.5 block">
            Status <span className="text-muted font-normal">(optional)</span>
          </label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">— No change —</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="unverified">Unverified</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || (!interestedCourse && !status)}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
