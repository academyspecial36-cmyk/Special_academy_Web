"use client";

import { FileText, Plus, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LegalSectionEditor } from "@/components/ui/legal-section-editor";

interface LegalForm {
  privacyPolicy: { title: string; description: string; lastUpdated: string; sections: { title: string; content: string[] }[] };
  terms: { title: string; description: string; lastUpdated: string; sections: { title: string; content: string[] }[] };
}

interface LegalTabProps {
  legalForm: LegalForm;
  setLegalForm: (updater: (prev: LegalForm) => LegalForm) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

export function LegalTab({ legalForm, setLegalForm, savingSettings, handleSave }: LegalTabProps) {
  return (
    <div className="space-y-6">
      <Card id="privacy-policy" className="scroll-mt-24">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Privacy Policy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Title</label>
            <Input value={legalForm.privacyPolicy.title} onChange={(e) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, title: e.target.value } }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Description</label>
            <Input value={legalForm.privacyPolicy.description} onChange={(e) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, description: e.target.value } }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Last Updated</label>
            <Input value={legalForm.privacyPolicy.lastUpdated} onChange={(e) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, lastUpdated: e.target.value } }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-primary">Sections</label>
              <Button type="button" variant="outline" size="sm" onClick={() => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: [...p.privacyPolicy.sections, { title: "", content: [""] }] } }))}><Plus className="w-3.5 h-3.5 mr-1" /> Add Section</Button>
            </div>
            <LegalSectionEditor
              sections={legalForm.privacyPolicy.sections}
              onChange={(sections) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections } }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card id="terms-of-service" className="scroll-mt-24">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Terms of Service</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Title</label>
            <Input value={legalForm.terms.title} onChange={(e) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, title: e.target.value } }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Description</label>
            <Input value={legalForm.terms.description} onChange={(e) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, description: e.target.value } }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Last Updated</label>
            <Input value={legalForm.terms.lastUpdated} onChange={(e) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, lastUpdated: e.target.value } }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-primary">Sections</label>
              <Button type="button" variant="outline" size="sm" onClick={() => setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: [...p.terms.sections, { title: "", content: [""] }] } }))}><Plus className="w-3.5 h-3.5 mr-1" /> Add Section</Button>
            </div>
            <LegalSectionEditor
              sections={legalForm.terms.sections}
              onChange={(sections) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections } }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={savingSettings}>
          {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {savingSettings ? "Saving..." : "Save Legal Pages"}
        </Button>
      </div>
    </div>
  );
}
