import { createClient } from "@/lib/supabase-server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PatientCard } from "@/components/patients/patient-card"
import { Plus, Search, Users } from "lucide-react" // -> THE FIX IS HERE
import type { Patient } from "@/types"

export default async function PatientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { return <div>Not logged in</div> }

  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
  
  const patientList = (patients as Patient[]) ?? []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
            <p className="text-muted-foreground text-pretty">View, add, and manage all your patient profiles</p>
          </div>
          <Button asChild className="gap-2">
            <a href="/dashboard/patients/new">
              <Plus className="h-4 w-4" /> Add New Patient
            </a>
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients by name or email..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {patientList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientList.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No Patients Found</h3>
                <p className="text-muted-foreground text-pretty max-w-md">
                  Start building your practice by adding your first patient.
                </p>
              </div>
              <Button asChild className="gap-2 mt-4">
                <a href="/dashboard/patients/new">
                  <Plus className="h-4 w-4" /> Add Your First Patient
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

