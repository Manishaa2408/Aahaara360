import { createClient } from "@/lib/supabase-server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PatientForm } from "@/components/patients/patient-form";
import { notFound } from "next/navigation";

export default async function EditPatientPage({ params }: { params: { patientId: string } }) {
  const supabase = createClient();
  
  const { data: patient, error } = await supabase
    .from("patients")
    .select('*')
    .eq('id', params.patientId)
    .single();

  if (error || !patient) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Patient: {patient.name}</h1>
          <p className="text-muted-foreground">
            Update the patient's profile information below.
          </p>
        </div>
        {/* We pass the fetched patient data to the form component */}
        <PatientForm initialData={patient} />
      </div>
    </DashboardLayout>
  );
}