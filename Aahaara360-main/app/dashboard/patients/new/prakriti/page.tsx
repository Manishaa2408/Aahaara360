"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PrakritiQuiz } from "@/components/patients/prakriti-quiz"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

function PrakritiAssessmentContent() {
  const searchParams = useSearchParams()
  const [patientData, setPatientData] = useState(null)

  useEffect(() => {
    const data = searchParams.get("patientData")
    if (data) {
      try {
        setPatientData(JSON.parse(decodeURIComponent(data)))
      } catch (error) {
        console.error("[v0] Failed to parse patient data:", error)
      }
    }
  }, [searchParams])

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold">Patient data not found</h1>
            <p className="text-muted-foreground">Please go back and complete the patient form first.</p>
            <Button asChild>
              <a href="/dashboard/patients/new">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient Form
              </a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Prakriti Assessment</h1>
            <p className="text-muted-foreground text-pretty">
              Complete this Ayurvedic constitution assessment for <strong>{patientData.name}</strong> to determine their
              dominant dosha
            </p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Ayurvedic Constitution Quiz</CardTitle>
              <CardDescription>
                Answer these 10 questions based on the patient's natural tendencies and characteristics. Choose the
                option that best describes them throughout most of their life.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrakritiQuiz patientData={patientData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function PrakritiAssessmentPage() {
  return (
    <Suspense fallback={<div>Loading assessment...</div>}>
      <PrakritiAssessmentContent />
    </Suspense>
  )
}
