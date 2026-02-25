"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PatientForm } from "@/components/patients/patient-form"
import { PrakritiQuiz } from "@/components/patients/prakriti-quiz"
import type { PatientFormData } from "@/components/patients/patient-form" // We will export this type from the form

export default function NewPatientPage() {
  const [step, setStep] = useState<'form' | 'quiz'>('form')
  const [patientFormData, setPatientFormData] = useState<PatientFormData | null>(null)

  const handleFormSubmit = (data: PatientFormData) => {
    setPatientFormData(data)
    setStep('quiz')
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {step === 'form' && (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-balance">Add New Patient</h1>
              <p className="text-muted-foreground text-pretty">
                Create a comprehensive patient profile including Ayurvedic assessment.
              </p>
            </div>
            {/* Pass the submit handler function as a prop */}
            <PatientForm onFormSubmit={handleFormSubmit} />
          </>
        )}

        {step === 'quiz' && patientFormData && (
          <>
             <div className="space-y-2">
              <h1 className="text-3xl font-bold text-balance">Prakriti Assessment</h1>
              <p className="text-muted-foreground text-pretty">
                Complete this Ayurvedic constitution assessment for <strong>{patientFormData.name}</strong> to determine their dominant dosha.
              </p>
            </div>
            {/* The quiz will now receive the form data and will handle the final submission */}
            <PrakritiQuiz patientData={patientFormData} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
