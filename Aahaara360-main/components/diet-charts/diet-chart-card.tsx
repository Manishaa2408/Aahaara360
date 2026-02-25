"use client" // -> THE FIX: This component now needs to be a client component to handle state.

import { useState } from "react" // -> THE FIX: Import useState
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Edit, Download, Calendar, Target, AlertCircle } from "lucide-react"
import type { DietChart, Patient } from "@/types"
import Link from "next/link"
import { PDFExportDialog } from "./pdf-export-dialog" // -> THE FIX: Import the PDF dialog

type DietChartWithPatient = DietChart & {
  patients: Pick<Patient, 'name' | 'prakriti'> | null;
}

interface DietChartCardProps {
  dietChart: DietChartWithPatient
}

export function DietChartCard({ dietChart }: DietChartCardProps) {
  // -> THE FIX: Add state to control the visibility of the PDF dialog
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  const getInitials = (name?: string | null) => {
    if (!name) return "NA";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800"
      case "draft": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPrakritiColor = (prakriti?: string | null) => {
    if (!prakriti) return "bg-gray-100 text-gray-800";
    if (prakriti.includes("Vata")) return "bg-blue-100 text-blue-800"
    if (prakriti.includes("Pitta")) return "bg-red-100 text-red-800"
    if (prakriti.includes("Kapha")) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
  }
  
  const patientName = dietChart.patients?.name ?? "Unknown Patient";
  const patientPrakriti = dietChart.patients?.prakriti ?? "N/A";

  return (
    <>
      <Card className="border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">{patientName}</h3>
                <Badge className={`text-xs ${getPrakritiColor(patientPrakriti)}`}>
                  {patientPrakriti}
                </Badge>
              </div>
            </div>
            {dietChart.status && <Badge className={`text-xs ${getStatusColor(dietChart.status)}`}>{dietChart.status}</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              <span className="font-medium">Goal</span>
            </div>
            <p className="text-sm line-clamp-2">{dietChart.goal}</p>
          </div>

          {dietChart.exclusions && dietChart.exclusions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">Exclusions</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dietChart.exclusions.slice(0, 3).map((exclusion, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{exclusion}</Badge>
                ))}
                {dietChart.exclusions.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{dietChart.exclusions.length - 3} more</Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(dietChart.created_at)}</span>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
              <Link href={`/dashboard/diet-charts/${dietChart.id}`}>
                <Eye className="h-3 w-3" /> View
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
              <Link href={`/dashboard/diet-charts/${dietChart.id}/edit`}>
                <Edit className="h-3 w-3" /> Edit
              </Link>
            </Button>
            {/* -> THE FIX: The Download button now has an onClick handler */}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowPDFDialog(true)}>
              <Download className="h-3 w-3" /> Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* -> THE FIX: The PDF dialog is now included and controlled by this component's state */}
      <PDFExportDialog
        open={showPDFDialog}
        onOpenChange={setShowPDFDialog}
        dietChart={dietChart.plan_details}
        patient={dietChart.patients as Patient}
        configuration={dietChart}
      />
    </>
  )
}

