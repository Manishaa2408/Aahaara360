"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Loader2, Building2, User, FileCheck, StickyNote, Settings2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Patient, DietChart } from "@/types"

interface PDFExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dietChart: DietChart['plan_details']
  patient: Patient
  configuration: any // Use a more specific type if available
}

export function PDFExportDialog({ open, onOpenChange, dietChart, patient, configuration }: PDFExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includePatientInfo: true,
    includeWeeklyOverview: true,
    includeInstructions: true,
    customNotes: "",
    clinicName: "Aahaara360 Wellness Clinic",
    doctorName: "Your Dietitian Name", // Will be replaced by dietitian's actual name
    contactInfo: "yourclinic@email.com"
  })

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const doc = new jsPDF();
      let yPosition = 35; // Start lower to accommodate header

      // ---- DECORATIVE HEADER ----
      doc.setFillColor(243, 244, 246); // Light gray background
      doc.rect(0, 0, 210, 30, 'F');
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74); // Primary Green
      doc.setFont("helvetica", "bold");
      doc.text("Aahaara360", 105, 18, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Personalized Ayurvedic Diet Chart", 105, 25, { align: "center" });

      // ---- PATIENT INFORMATION ----
      if (exportOptions.includePatientInfo && patient) {
        doc.setFontSize(14);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "bold");
        doc.text("Patient Information", 14, yPosition);
        yPosition += 2;
        autoTable(doc, {
            startY: yPosition,
            theme: 'plain',
            body: [
                ['Name', patient.name],
                ['Prakriti', patient.prakriti || 'Not Assessed'],
                ['Dietary Goal', configuration?.goal || 'General Wellness'],
            ],
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // ---- MEAL PLAN TABLE ----
      if (dietChart) {
        doc.setFontSize(14);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "bold");
        doc.text("7-Day Meal Plan", 14, yPosition);
        
        const head = [['Day', 'Breakfast', 'Brunch', 'Lunch', 'Snacks', 'Dinner']];
        const body = Object.keys(dietChart).map(day => {
            const dailyPlan = dietChart[day];
            const formatMeals = (meals: any[] | undefined) => (meals || []).map(m => m.food_name).join('\n');
            return [ day, formatMeals(dailyPlan.breakfast), formatMeals(dailyPlan.brunch), formatMeals(dailyPlan.lunch), formatMeals(dailyPlan.snacks), formatMeals(dailyPlan.dinner) ];
        });

        autoTable(doc, {
            startY: yPosition + 8,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] },
            styles: { fontSize: 9, cellPadding: 2, valign: 'middle' },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // ---- DIETARY GUIDELINES & NOTES ----
      if (exportOptions.includeInstructions || exportOptions.customNotes) {
         if (yPosition > 220) { doc.addPage(); yPosition = 20; }
         
         if(exportOptions.includeInstructions) {
            doc.setFontSize(14); doc.setTextColor(55, 65, 81); doc.setFont("helvetica", "bold");
            doc.text("Dietary Guidelines", 14, yPosition);
            yPosition += 8;
            doc.setFontSize(10); doc.setTextColor(100);
            const guidelines = [
                "Eat meals at regular times to maintain digestive rhythm.",
                "Drink warm water throughout the day to support digestion.",
                "Avoid processed foods; choose fresh, whole ingredients.",
                "Practice mindful eating without distractions like TV or phones.",
                "Finish your dinner at least 2-3 hours before bedtime."
            ];
            guidelines.forEach(g => { doc.text(`• ${g}`, 20, yPosition); yPosition += 6; });
            yPosition += 5;
         }

         if(exportOptions.customNotes) {
            if (yPosition > 240) { doc.addPage(); yPosition = 20; }
            doc.setFontSize(14); doc.setTextColor(55, 65, 81); doc.setFont("helvetica", "bold");
            doc.text("Personalized Notes", 14, yPosition);
            yPosition += 8;
            doc.setFontSize(10); doc.setTextColor(100);
            const splitNotes = doc.splitTextToSize(exportOptions.customNotes, 180);
            doc.text(splitNotes, 20, yPosition);
         }
      }

      // ---- FOOTER ON EVERY PAGE ----
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor(150);
          doc.text(`Practitioner: ${exportOptions.doctorName} | ${exportOptions.contactInfo}`, 14, 285);
          doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
      }
      
      doc.save(`${patient?.name.replace(/\s+/g, '_') || "Patient"}_Diet_Plan.pdf`);

    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }

    setIsExporting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl flex items-center gap-2"><FileText /> Export Diet Chart</DialogTitle>
            <DialogDescription>
              Customize and download a professional PDF version of the diet plan.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Header & Footer Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="doctorName">Practitioner Name</Label><Input id="doctorName" value={exportOptions.doctorName} onChange={(e) => setExportOptions(p => ({ ...p, doctorName: e.target.value }))} /></div>
                <div className="space-y-2"><Label htmlFor="contactInfo">Contact Info</Label><Input id="contactInfo" value={exportOptions.contactInfo} onChange={(e) => setExportOptions(p => ({ ...p, contactInfo: e.target.value }))} /></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Settings2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Content Options</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2"><Checkbox id="patientInfo" checked={exportOptions.includePatientInfo} onCheckedChange={c => setExportOptions(p => ({...p, includePatientInfo: !!c}))} /><Label htmlFor="patientInfo">Include Patient Details</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="weeklyOverview" checked={exportOptions.includeWeeklyOverview} onCheckedChange={c => setExportOptions(p => ({...p, includeWeeklyOverview: !!c}))} /><Label htmlFor="weeklyOverview">Include Overview Section</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="instructions" checked={exportOptions.includeInstructions} onCheckedChange={c => setExportOptions(p => ({...p, includeInstructions: !!c}))} /><Label htmlFor="instructions">Include Dietary Guidelines</Label></div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="customNotes">Personalized Notes (Optional)</Label>
            <Textarea id="customNotes" placeholder="Add any custom notes or follow-up instructions..." value={exportOptions.customNotes} onChange={(e) => setExportOptions(p => ({ ...p, customNotes: e.target.value }))} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>Cancel</Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Download className="h-4 w-4" /> Download PDF</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

