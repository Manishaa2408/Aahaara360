"use client"

import { useState, useEffect, useCallback } from "react"
import { generateDietDraft, saveDietChart } from "@/lib/actions" 
import type { Patient, Food, DietChart, DailyPlan, MealItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Sparkles, Download, Utensils } from "lucide-react"
import { MealCard } from "./meal-card"
import { PDFExportDialog } from "./pdf-export-dialog"
import { NutritionAnalysis } from "./nutrition-analysis"

type ConfigurationFormData = {
  goal: string;
  duration_weeks: number;
  calories_target?: number | '';
  meal_preferences?: string[];
  exclusions?: string[];
  special_instructions?: string;
}

interface DietChartGeneratorProps {
  patient: Patient
  foods: Food[]
  configuration: ConfigurationFormData
  onBack: () => void
}

export function DietChartGenerator({ patient, foods, configuration, onBack }: DietChartGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dietPlan, setDietPlan] = useState<DietChart['plan_details']>(null)
  const [selectedDay, setSelectedDay] = useState("Day 1")
  const [showPDFExport, setShowPDFExport] = useState(false)

  useEffect(() => {
    const createDraft = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const draft = await generateDietDraft(configuration, patient, foods);
        if (!draft) throw new Error("The AI could not generate a plan with the given constraints.");
        setDietPlan(draft);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during plan generation.");
      } finally {
        setIsGenerating(false);
      }
    };
    createDraft();
  }, [configuration, patient, foods]);

  const handleMealUpdate = useCallback((mealType: string, updatedMeals: MealItem[]) => {
    setDietPlan(prevPlan => {
      if (!prevPlan) return null;
      const newPlan = JSON.parse(JSON.stringify(prevPlan)); // Deep copy to ensure re-render
      if (newPlan[selectedDay]) {
        newPlan[selectedDay][mealType as keyof DailyPlan] = updatedMeals;
      }
      return newPlan;
    });
  }, [selectedDay]); // Dependency ensures the correct day is updated

  const handleSaveChart = async () => {
    if (!dietPlan) return;
    setIsSaving(true);
    try {
      await saveDietChart(patient.id, configuration, dietPlan);
    } catch (err: any) {
      setError(err.message || "Failed to save the diet chart. Please try again.");
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Generating AI Diet Draft...</h3>
            <p className="text-muted-foreground text-pretty max-w-md">
              The Architect AI is creating a scientifically balanced and Ayurveda-compliant plan for {patient.name}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader><CardTitle className="text-destructive">Generation Failed</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Configuration
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (dietPlan) {
    const dailyPlan = dietPlan[selectedDay];
    const days = Object.keys(dietPlan);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            Back to Configuration
          </Button>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 flex-1" onClick={() => setShowPDFExport(true)}>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button onClick={handleSaveChart} disabled={isSaving} className="gap-2 flex-1">
              <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Chart"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <Card className="lg:sticky lg:top-6">
            <CardHeader><CardTitle>Week View</CardTitle></CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {days.map((day) => (
                <Button key={day} variant={selectedDay === day ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setSelectedDay(day)}>
                  {day}
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 space-y-6">
             <h2 className="text-2xl font-bold">Meal Plan for {selectedDay}</h2>
            {dailyPlan && Object.entries(dailyPlan).map(([mealType, meals]) => (
              <MealCard 
                key={mealType} 
                mealType={mealType} 
                meals={meals || []} 
                onMealUpdate={handleMealUpdate} 
              />
            ))}
          </div>

          <div className="lg:sticky lg:top-6">
             <NutritionAnalysis 
                selectedDay={selectedDay}
                meals={dailyPlan}
                targetCalories={configuration.calories_target || undefined}
                allFoods={foods}
             />
          </div>
        </div>

        <PDFExportDialog
          open={showPDFExport}
          onOpenChange={setShowPDFExport}
          dietChart={dietPlan}
          patient={patient}
          configuration={configuration}
        />
      </div>
    );
  }

  return <p>An unexpected error occurred. Please go back and try again.</p>;
}

