"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Phone, Mail, Activity, Heart } from "lucide-react"
import { updatePatient } from "@/lib/actions"
import type { Patient } from "@/types"

// This Zod schema defines the validation rules for our form
export const patientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number({ invalid_type_error: "Age must be a number" }).min(1, "Age is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required." }),
  height: z.coerce.number({ invalid_type_error: "Height must be a number" }).min(50, "Height is required"),
  weight: z.coerce.number({ invalid_type_error: "Weight must be a number" }).min(1, "Weight is required"),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  medical_history: z.string().optional(),
  current_medications: z.string().optional(),
  allergies: z.string().optional(),
  activity_level: z.enum(["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], { required_error: "Activity level is required." }),
  sleep_pattern: z.string().min(1, "Sleep pattern is required"),
  water_intake: z.string().min(1, "Water intake is required"),
  bowel_movements: z.string().min(1, "Bowel movement pattern is required"),
  agni: z.enum(["Weak", "Moderate", "Strong"], { required_error: "Agni is required." }),
})

export type PatientFormData = z.infer<typeof patientSchema>

interface PatientFormProps {
  onFormSubmit?: (data: PatientFormData) => void;
  initialData?: Patient;
}

export function PatientForm({ onFormSubmit, initialData }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {
      name: "",
      phone: "",
      email: "",
      medical_history: "",
      current_medications: "",
      allergies: "",
      sleep_pattern: "",
      water_intake: "",
      bowel_movements: "",
      age: undefined,
      height: undefined,
      weight: undefined,
    },
  })

  // Populates the form with existing patient data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      reset(initialData);
    }
  }, [initialData, isEditMode, reset]);

  // Client-side submit handler for the "create" flow
  const handleCreateSubmit = (data: PatientFormData) => {
    setIsLoading(true);
    if(onFormSubmit) {
      onFormSubmit(data); 
    }
  }

  // The form's action is the server action for updating a patient in edit mode
  const formAction = isEditMode 
    ? updatePatient.bind(null, initialData.id) 
    : undefined;

  return (
    <form action={formAction} onSubmit={isEditMode ? undefined : handleSubmit(handleCreateSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Controller name="age" control={control} render={({ field }) => <Input type="number" {...field} />} />
            {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Controller control={control} name="gender" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm) *</Label>
            <Controller name="height" control={control} render={({ field }) => <Input type="number" {...field} />} />
            {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Controller name="weight" control={control} render={({ field }) => <Input type="number" step="0.1" {...field} />} />
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Controller name="phone" control={control} render={({ field }) => <Input className="pl-10" {...field} />} /></div>
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Controller name="email" control={control} render={({ field }) => <Input type="email" className="pl-10" {...field} />} /></div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Medical Information</h3>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="medical_history">Medical History</Label>
            <Controller name="medical_history" control={control} render={({ field }) => <Textarea {...field} placeholder="Any significant medical conditions..." rows={3} />} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications</Label>
            <Controller name="current_medications" control={control} render={({ field }) => <Textarea {...field} placeholder="List all current medications..." rows={3} />} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies & Food Intolerances</Label>
            <Controller name="allergies" control={control} render={({ field }) => <Textarea {...field} placeholder="Any known allergies..." rows={3} />} />
          </div>
        </div>
      </div>
      
       <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Lifestyle & Ayurvedic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="activity_level">Activity Level *</Label>
            <Controller control={control} name="activity_level" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                    <SelectItem value="Very Active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            {errors.activity_level && <p className="text-sm text-destructive">{errors.activity_level.message}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="agni">Agni (Digestive Strength) *</Label>
             <Controller control={control} name="agni" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select digestive strength" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weak">Weak</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            {errors.agni && <p className="text-sm text-destructive">{errors.agni.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="sleep_pattern">Sleep Pattern *</Label>
            <Controller name="sleep_pattern" control={control} render={({ field }) => <Input {...field} placeholder="e.g., 7-8 hours, 10 PM - 6 AM" />} />
            {errors.sleep_pattern && <p className="text-sm text-destructive">{errors.sleep_pattern.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="water_intake">Daily Water Intake *</Label>
            <Controller name="water_intake" control={control} render={({ field }) => <Input {...field} placeholder="e.g., 2-3 liters" />} />
            {errors.water_intake && <p className="text-sm text-destructive">{errors.water_intake.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bowel_movements">Bowel Movement Pattern *</Label>
            <Controller name="bowel_movements" control={control} render={({ field }) => <Input {...field} placeholder="e.g., Once daily, regular" />} />
            {errors.bowel_movements && <p className="text-sm text-destructive">{errors.bowel_movements.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" type="button" asChild>
          <a href="/dashboard/patients">Cancel</a>
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEditMode ? "Save Changes" : "Continue to Prakriti Assessment"}
        </Button>
      </div>
    </form>
  )
}

