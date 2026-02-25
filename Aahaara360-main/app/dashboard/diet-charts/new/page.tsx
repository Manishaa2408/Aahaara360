import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import type { Patient } from "@/types"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientSelector } from "@/components/diet-charts/patient-selector"

// This is a Server Component. Its only job is to fetch data securely.
export default async function SelectPatientForChartPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/") // Redirect to login if not authenticated
  }

  // Fetch all patients that belong to the currently logged-in dietitian.
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error("Error fetching patients for diet chart selection:", error)
  }

  const patientList = (patients as Patient[]) ?? []

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-balance">Create New Diet Chart</h1>
          <p className="text-muted-foreground text-pretty">
            Step 1: Select the patient for whom you want to create a new diet plan.
          </p>
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Select a Patient</CardTitle>
            <CardDescription>
              Choose a patient from your list below to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* We pass the real, fetched patient data down to the PatientSelector. */}
            <PatientSelector patients={patientList} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

