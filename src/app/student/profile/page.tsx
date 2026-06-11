"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, School, Calendar, Edit3, Save, Loader2, UserCheck, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { apiUpload } from "@/lib/api-client";
import Image from "next/image";
import { toast } from "sonner";

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  enrolled_courses: string[];
  created_at: string;
}

interface EnrollmentData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  interested_course: string;
  guardian_name: string;
  guardian_contact: string;
  address: string;
  previous_school: string;
  created_at: string;
  status: string;
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    guardianName: "",
    guardianContact: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/student-profile");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStudent(data.student);
        setEnrollment(data.enrollment);
        setAvatarUrl(data.profile?.avatar_url ?? null);
        setForm({
          name: data.student?.name ?? data.enrollment?.full_name ?? "",
          phone: data.student?.phone ?? "",
          address: data.enrollment?.address ?? "",
          guardianName: data.enrollment?.guardian_name ?? "",
          guardianContact: data.enrollment?.guardian_contact ?? "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      let payload: Record<string, string> = { ...form };
      if (avatarFile) {
        const { url } = await apiUpload(avatarFile, "images");
        payload.avatar_url = url;
        setAvatarUrl(url);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      const res = await fetch("/api/student-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        setEditing(false);
      }
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "S";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">My Profile</h1>
        <p className="text-sm text-muted">Manage your personal information and settings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {(avatarPreview || avatarUrl) ? (
                  <Image src={avatarPreview || avatarUrl!} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
                {editing && (
                  <>
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-colors rounded-full"
                    >
                      <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </button>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }} />
                  </>
                )}
              </div>
              <h3 className="text-lg font-bold text-primary">{form.name || "Student"}</h3>
              <p className="text-sm text-muted mb-1">{student?.class ?? enrollment?.interested_course ?? ""}</p>
              {student?.id && (
                <p className="text-xs text-muted">Student ID: {student.id.slice(0, 8).toUpperCase()}</p>
              )}
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-muted">{user?.email ?? ""}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted" />
                  <span className="text-muted">{form.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted" />
                  <span className="text-muted">{form.address || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <School className="w-4 h-4 text-muted" />
                  <span className="text-muted">{student?.class || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-muted">
                    Joined {student?.created_at
                      ? new Date(student.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <UserCheck className="w-4 h-4 text-muted" />
                  <span className="text-muted capitalize">{enrollment?.status ?? "active"}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-6"
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {editing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Full Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Email</label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Class</label>
                  <Input value={student?.class ?? ""} disabled />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  disabled={!editing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Guardian Name</label>
                  <Input
                    value={form.guardianName}
                    onChange={(e) => setForm((p) => ({ ...p, guardianName: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Guardian Phone</label>
                  <Input
                    value={form.guardianContact}
                    onChange={(e) => setForm((p) => ({ ...p, guardianContact: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Interested Course</label>
                <Input value={enrollment?.interested_course ?? ""} disabled />
              </div>
            </CardContent>
          </Card>

          {editing && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
