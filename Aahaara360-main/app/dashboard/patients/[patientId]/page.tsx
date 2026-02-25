import { createClient } from "@/lib/supabase-server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Heart, Activity, Phone, Mail, Edit, Calendar, Scale, Ruler } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function PatientDetailPage({ params, searchParams }: { params: { patientId: string }, searchParams: { message: string } }) {
  const supabase = createClient();
  
  // Fetch all patient details including any new fields
  const { data: patient, error } = await supabase
    .from("patients")
    .select('*')
    .eq('id', params.patientId)
    .single();

  if (error) {
    console.error("Error fetching patient:", error);
    notFound();
  }

  if (!patient) {
    notFound();
  }

  // Format date of birth if it exists
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{patient.name || 'Unnamed Patient'}</h1>
            <p className="text-muted-foreground">Patient Profile & Ayurvedic Assessment</p>
          </div>
          <Link href={`/dashboard/patients/${patient.id}/edit`}>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Edit size={16} /> Edit Patient
            </Button>
          </Link>
        </div>
        
        {/* Success Message Display */}
        {searchParams.message && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{searchParams.message}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Basic & Medical) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                {patient.date_of_birth && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Date of Birth</span> 
                      <span className="font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} /> {formatDate(patient.date_of_birth)}
                      </span>
                    </div>
                    <Separator/>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span>Age</span> 
                  <span className="font-medium text-muted-foreground">
                    {patient.age ? `${patient.age} years` : 'N/A'}
                  </span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                  <span>Gender</span> 
                  <span className="font-medium text-muted-foreground">
                    {patient.gender || 'N/A'}
                  </span>
                </div>
                <Separator/>
                {patient.height && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Height</span> 
                      <span className="font-medium text-muted-foreground flex items-center gap-2">
                        <Ruler size={14} /> {patient.height} cm
                      </span>
                    </div>
                    <Separator/>
                  </>
                )}
                {patient.weight && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Weight</span> 
                      <span className="font-medium text-muted-foreground flex items-center gap-2">
                        <Scale size={14} /> {patient.weight} kg
                      </span>
                    </div>
                    <Separator/>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span>Phone</span> 
                  <span className="font-medium text-muted-foreground flex items-center gap-2">
                    <Phone size={14} /> {patient.phone || 'N/A'}
                  </span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                  <span>Email</span> 
                  <span className="font-medium text-muted-foreground flex items-center gap-2">
                    <Mail size={14} /> {patient.email || 'N/A'}
                  </span>
                </div>
                {patient.address && (
                  <>
                    <Separator/>
                    <div>
                      <p className="font-medium mb-1">Address</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {patient.address}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Heart /> Medical History</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Conditions</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {patient.medical_history || 'No medical conditions recorded'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-1">Current Medications</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {patient.current_medications || 'No current medications'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-1">Allergies</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {patient.allergies || 'No known allergies'}
                  </p>
                </div>
                {patient.surgeries && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-1">Surgeries</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {patient.surgeries}
                      </p>
                    </div>
                  </>
                )}
                {patient.family_history && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-1">Family History</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {patient.family_history}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column (Ayurvedic Profile) */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Activity /> Ayurvedic Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span>Prakriti</span> 
                  <Badge variant={patient.prakriti ? "default" : "secondary"}>
                    {patient.prakriti || 'Not assessed'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span>Vikriti</span> 
                  <Badge variant={patient.vikriti ? "default" : "secondary"}>
                    {patient.vikriti || 'Not assessed'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span>Agni</span> 
                  <span className="font-medium text-muted-foreground">
                    {patient.agni || 'Not assessed'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span>Activity Level</span> 
                  <span className="font-medium text-muted-foreground text-right">
                    {patient.activity_level || 'Not specified'}
                  </span>
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-1">Sleep Pattern</p>
                  <p className="text-muted-foreground">
                    {patient.sleep_pattern || 'Not specified'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-1">Water Intake</p>
                  <p className="text-muted-foreground">
                    {patient.water_intake || 'Not specified'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-1">Bowel Movements</p>
                  <p className="text-muted-foreground">
                    {patient.bowel_movements || 'Not specified'}
                  </p>
                </div>
                {patient.dietary_habits && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-1">Dietary Habits</p>
                      <p className="text-muted-foreground">
                        {patient.dietary_habits}
                      </p>
                    </div>
                  </>
                )}
                {patient.mental_emotional && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-1">Mental & Emotional State</p>
                      <p className="text-muted-foreground">
                        {patient.mental_emotional}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}