"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientSelector } from "@/components/diet-charts/patient-selector"
import type { Patient } from "@/types"

// This is a new Client Component that accepts the patient list as a prop.
interface CreateDietChartClientProps {
  patients: Patient[];
}

export function CreateDietChartClient({ patients }: CreateDietChartClientProps) {
  // This component now contains the UI that was previously on the main page.
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Step 1: Select a Patient</CardTitle>
        <CardDescription>
          Search for and select the patient you want to create a diet chart for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* It renders the PatientSelector and passes the data down. */}
        <PatientSelector patients={patients} />
      </CardContent>
    </Card>
  )
}