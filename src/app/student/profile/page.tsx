"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, School, Calendar, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Profile</h1>
        <p className="text-sm text-muted">Manage your personal information and settings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">AH</span>
              </div>
              <h3 className="text-lg font-bold text-primary">Arafat Hossain</h3>
              <p className="text-sm text-muted mb-1">Class 8</p>
              <p className="text-xs text-muted">Student ID: CA-2025-001</p>
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-muted">arafat@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted" />
                  <span className="text-muted">986-0302036</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted" />
                  <span className="text-muted">New baneshwor, Kathmandu</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <School className="w-4 h-4 text-muted" />
                  <span className="text-muted">Govt. Laboratory High School</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-muted">Joined Jan 15, 2025</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Full Name</label>
                  <Input defaultValue="Arafat Hossain" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Email</label>
                  <Input defaultValue="arafat@example.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Phone</label>
                  <Input defaultValue="986-0302036" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Date of Birth</label>
                  <Input defaultValue="2010-05-15" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Address</label>
                <Input defaultValue="M8RP+363 New baneshwor, Devkota Sadak, Kathmandu 44600" />
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
                  <Input defaultValue="Mohammad Hossain" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Guardian Phone</label>
                  <Input defaultValue="986-0302036" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Relationship</label>
                <Input defaultValue="Father" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
