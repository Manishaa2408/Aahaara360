import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DietChartCard } from "@/components/diet-charts/diet-chart-card"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Plus, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import type { DietChart, Patient } from "@/types"

// We need a new type for our joined data
type DietChartWithPatient = DietChart & {
  patients: Pick<Patient, 'name' | 'prakriti'> | null;
}

export default async function DietChartsPage() {
  const supabase = createClient();

  // -> This is the live query to your Supabase database.
  // It fetches all diet charts AND the related patient's name and prakriti.
  const { data: dietCharts, error } = await supabase
    .from('diet_charts')
    .select(`
      *,
      patients (
        name,
        prakriti
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching diet charts:", error);
  }
  
  const charts = (dietCharts as DietChartWithPatient[]) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Diet Charts</h1>
            <p className="text-muted-foreground text-pretty">
              Manage personalized Ayurvedic diet plans for your patients
            </p>
          </div>
          {/* We will make this button smarter later */}
          <Button asChild className="gap-2">
              <a href="/dashboard/diet-charts/new">
              <Plus className="h-4 w-4" />
              Create Diet Chart
          </a>
       </Button>
        </div>

        {/* Filters can be added later */}
        {/* <Card> ... </Card> */}

        <Suspense fallback={<div className="text-center p-8">Loading diet charts...</div>}>
          {charts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charts.map((chart) => (
                <DietChartCard key={chart.id} dietChart={chart} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">No diet charts yet</h3>
                  <p className="text-muted-foreground text-pretty max-w-md">
                    Select a patient from your patient list to create their first diet plan.
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <a href="/dashboard/patients">
                    <Plus className="h-4 w-4" />
                    Go to Patients
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
