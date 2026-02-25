"use client"

import { useState } from "react"
import type { Patient, Food } from "@/types"
import { DietChartConfiguration } from "@/components/diet-charts/diet-chart-configuration"
import { DietChartGenerator } from "@/components/diet-charts/diet-chart-generator"

// This is the shape of the data this component expects to receive from the server page
interface CreateDietChartWizardProps {
  patient: Patient
  foods: Food[]
}

// This component is a "Client Component". It manages the state of the wizard.
export function CreateDietChartWizard({ patient, foods }: CreateDietChartWizardProps) {
  // This state determines which step we are on: 'configure' or 'generate'
  const [currentStep, setCurrentStep] = useState<"configure" | "generate">("configure")
  
  // This state holds the configuration data after the dietitian fills out the first form
  const [configuration, setConfiguration] = useState<any>(null)

  const handleConfigurationComplete = (config: any) => {
    setConfiguration(config)
    setCurrentStep("generate")
  }

  // Based on the current step, we show either the configuration form or the generator
  if (currentStep === "configure") {
    return (
      <DietChartConfiguration 
        patient={patient} 
        onComplete={handleConfigurationComplete} 
      />
    )
  }

  if (currentStep === "generate") {
    return (
      <DietChartGenerator
        patient={patient}
        foods={foods}
        configuration={configuration}
        onBack={() => setCurrentStep("configure")}
      />
    )
  }

  return null // Should not happen
}
