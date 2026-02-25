"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Patient } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Target, Clock, Utensils, AlertCircle } from "lucide-react"

// Zod schema for form validation
const configurationSchema = z.object({
  goal: z.string().min(1, "Goal is required"),
  duration_weeks: z.coerce.number().min(1).max(12),
  // Make calories_target optional but still a number if provided
  calories_target: z.coerce.number().min(1000).max(5000).optional(),
  meal_preferences: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  special_instructions: z.string().optional(),
})

export type ConfigurationFormData = z.infer<typeof configurationSchema>

interface DietChartConfigurationProps {
  patient: Patient
  onComplete: (config: ConfigurationFormData) => void
}

const commonGoals = ["Weight Management", "Digestive Health", "Energy Enhancement", "Stress Management", "Diabetes Management", "Heart Health", "Detoxification"];
const mealPreferences = ["Vegetarian", "Vegan", "Gluten-Free", "Low-Carb", "High-Protein"];
const commonExclusions = ["Dairy", "Gluten", "Nuts", "Shellfish", "Eggs", "Soy", "Spicy Foods"];

// Helper function to calculate recommended calories. Moved outside the component.
const calculateRecommendedCalories = (patient: Patient) => {
    if (!patient.weight || !patient.height || !patient.age || !patient.gender || !patient.activity_level) return undefined; // Return undefined if data is missing
    const bmr = patient.gender === "Female"
      ? 655.1 + (9.563 * patient.weight) + (1.850 * patient.height) - (4.676 * patient.age)
      : 66.47 + (13.75 * patient.weight) + (5.003 * patient.height) - (6.755 * patient.age);
    const activityMultipliers: {[key: string]: number} = { "Sedentary": 1.2, "Lightly Active": 1.375, "Moderately Active": 1.55, "Very Active": 1.725 };
    const multiplier = activityMultipliers[patient.activity_level] || 1.4;
    return Math.round(bmr * multiplier);
}

export function DietChartConfiguration({ patient, onComplete }: DietChartConfigurationProps) {
  
  // -> THE FIX: Calculate the recommended calories *before* setting up the form.
  const recommendedCalories = calculateRecommendedCalories(patient);

  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting } 
  } = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    // -> THE FIX: Set the calculated value as the default for the form.
    defaultValues: {
      goal: "",
      duration_weeks: 4,
      calories_target: recommendedCalories, // The smart default is set here!
      meal_preferences: [],
      exclusions: [],
      special_instructions: "",
    }
  });

  const onSubmit = (data: ConfigurationFormData) => {
    onComplete(data);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Diet Chart Configuration</CardTitle>
        <CardDescription>Set the goals and preferences for {patient.name}'s personalized diet plan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Goal Setting */}
          <div className="space-y-2">
            <Label htmlFor="goal">Primary Goal *</Label>
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select a primary goal..." /></SelectTrigger>
                  <SelectContent>
                    {commonGoals.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.goal && <p className="text-sm text-destructive">{errors.goal.message}</p>}
          </div>

          {/* Duration & Calories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration_weeks">Duration (Weeks) *</Label>
              <Controller
                name="duration_weeks"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                        <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2 weeks</SelectItem>
                            <SelectItem value="4">4 weeks</SelectItem>
                            <SelectItem value="8">8 weeks</SelectItem>
                            <SelectItem value="12">12 weeks</SelectItem>
                        </SelectContent>
                    </Select>
                )}
              />
              {errors.duration_weeks && <p className="text-sm text-destructive">{errors.duration_weeks.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories_target">Calorie Target (Optional)</Label>
              <Input 
                id="calories_target" 
                type="number" 
                placeholder={`e.g., ${recommendedCalories || 1800}`}
                {...register('calories_target')} 
              />
               <p className="text-xs text-muted-foreground">
                 Leave blank to use the recommended value of ~{recommendedCalories} calories.
               </p>
              {errors.calories_target && <p className="text-sm text-destructive">{errors.calories_target.message}</p>}
            </div>
          </div>

          {/* Meal Preferences */}
          <div className="space-y-3">
            <Label>Meal Preferences</Label>
            <Controller
                name="meal_preferences"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {mealPreferences.map(pref => (
                            <div key={pref} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`pref-${pref}`}
                                    checked={field.value?.includes(pref)}
                                    onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        const updated = checked ? [...current, pref] : current.filter(p => p !== pref);
                                        field.onChange(updated);
                                    }}
                                />
                                <Label htmlFor={`pref-${pref}`} className="text-sm font-normal cursor-pointer">{pref}</Label>
                            </div>
                        ))}
                    </div>
                )}
            />
          </div>

          {/* Exclusions */}
          <div className="space-y-3">
            <Label>Specific Food Exclusions</Label>
             <Controller
                name="exclusions"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {commonExclusions.map(ex => (
                            <div key={ex} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`ex-${ex}`}
                                    checked={field.value?.includes(ex)}
                                    onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        const updated = checked ? [...current, ex] : current.filter(p => p !== ex);
                                        field.onChange(updated);
                                    }}
                                />
                                <Label htmlFor={`ex-${ex}`} className="text-sm font-normal cursor-pointer">{ex}</Label>
                            </div>
                        ))}
                    </div>
                )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions (Optional)</Label>
            <Textarea 
              id="special_instructions" 
              {...register('special_instructions')} 
              placeholder="e.g., No raw salads after sunset, include more soups..." 
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Diet Draft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

