"use client"

import { useState } from "react"
import type { Patient, Food } from "@/types"
import { DietChartConfiguration } from "./diet-chart-configuration"
import { DietChartGenerator } from "./diet-chart-generator"

// This is the parent component that controls the multi-step process.
// It decides whether to show the configuration form or the generated plan.

interface DietChartWizardProps {
  patient: Patient
  foods: Food[]
}

// Define the shape of the configuration data this component expects
type ConfigurationFormData = {
  goal: string;
  duration_weeks: number;
  calories_target?: number;
  meal_preferences?: string[];
  exclusions?: string[];
  special_instructions?: string;
}

export function DietChartWizard({ patient, foods }: DietChartWizardProps) {
  // State to hold the configuration data from the form
  const [configuration, setConfiguration] = useState<ConfigurationFormData | null>(null);

  // This function is called by the configuration form when the dietitian clicks "Generate"
  const handleConfigurationComplete = (configData: ConfigurationFormData) => {
    setConfiguration(configData);
  };

  // This function is called from the generator view to go back to the form
  const handleBackToConfig = () => {
    setConfiguration(null);
  };

  return (
    <div>
      {/* This is the main logic:
        If we DO NOT have a configuration yet, show the configuration form.
        Otherwise, show the generator/results view.
      */}
      {!configuration ? (
        <DietChartConfiguration 
          patient={patient} 
          onComplete={handleConfigurationComplete} 
        />
      ) : (
        <DietChartGenerator 
          patient={patient} 
          foods={foods}
          configuration={configuration}
          onBack={handleBackToConfig}
        />
      )}
    </div>
  )
}

