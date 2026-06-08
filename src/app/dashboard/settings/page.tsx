"use client";

import { motion } from "framer-motion";
import { Save, Building2, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted">Manage academy settings and configurations.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-secondary" />
                Academy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Academy Name</label>
                <Input defaultValue="Special academy" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Tagline</label>
                <Input defaultValue="Preparing Future Leaders Through Discipline & Excellence" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Description</label>
                <Textarea rows={4} defaultValue="Nepal's premier cadet preparation academy since 2010." />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Address</label>
                <Textarea rows={2} defaultValue="M8RP+363 New baneshwor, Devkota Sadak, Kathmandu 44600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Email</label>
                <Input defaultValue="info@cadetacademy.edu" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Admission Email</label>
                <Input defaultValue="admission@cadetacademy.edu" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Phone</label>
                <Input defaultValue="986-0302036" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Secondary Phone</label>
                <Input defaultValue="986-0302036" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Website</label>
                <Input defaultValue="https://cadetacademy.edu" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <Button size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
