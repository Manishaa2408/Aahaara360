import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import type { Patient, Food } from "@/types"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
// Change this import:
import { DietChartWizard } from "@/components/diet-charts/diet-chart-wizard"

// Make sure the file name matches the import
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Activity, Heart } from "lucide-react"

interface NewDietChartPageProps {
  params: { patientId: string }
}

export default async function NewDietChartPage({ params }: NewDietChartPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect("/") }

  // Fetch the specific patient and all food data in parallel
  const [patientData, foodsData] = await Promise.all([
    supabase.from('patients').select('*').eq('id', params.patientId).single(),
    supabase.from('foods').select('*')
  ]);
  
  const patient = patientData.data as Patient | null;
  const foods = (foodsData.data as Food[]) ?? [];

  // Handle case where patient is not found or doesn't belong to the dietitian (due to RLS)
  if (!patient) {
    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
                <p className="text-center">Patient not found or you do not have permission to view this patient.</p>
            </main>
        </div>
    )
  }

  // Helper functions for UI
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const getPrakritiColor = (prakriti?: string | null) => {
    if (!prakriti) return "bg-gray-100 text-gray-800";
    if (prakriti.includes("Vata")) return "bg-blue-100 text-blue-800";
    if (prakriti.includes("Pitta")) return "bg-red-100 text-red-800";
    if (prakriti.includes("Kapha")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };
  const bmi = patient.weight && patient.height ? (Number(patient.weight) / (Number(patient.height) / 100) ** 2).toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Patient Info Header Card */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold">{patient.name}</h1>
                      {patient.prakriti && <Badge className={`${getPrakritiColor(patient.prakriti)}`}>{patient.prakriti}</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1"><User className="h-3 w-3" /><span>{patient.age} years, {patient.gender}</span></div>
                      {patient.activity_level && <div className="flex items-center space-x-1"><Activity className="h-3 w-3" /><span>{patient.activity_level}</span></div>}
                      {patient.agni && <div className="flex items-center space-x-1"><Heart className="h-3 w-3" /><span>Agni: {patient.agni}</span></div>}
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right space-y-1 w-full md:w-auto">
                  <div className="text-sm text-muted-foreground">BMI</div>
                  <div className="text-lg font-semibold">{bmi}</div>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {/* The Client Component that handles the interactive steps */}
          <DietChartWizard patient={patient} foods={foods} />

        </div>
      </main>
    </div>
  )
}

