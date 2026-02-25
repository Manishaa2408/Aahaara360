// This file defines the shape of our data objects as they come from the Supabase database.

export interface DietitianProfile {
  id: string;
  full_name: string;
  phone?: string | null;
  license_number?: string | null;
  clinic_name?: string | null;
  address?: string | null;
  updated_at: string;
}

export interface Patient {
  id: string;
  dietitian_id: string;
  name: string;
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  phone?: string | null;
  email?: string | null;
  medical_history?: string | null;
  current_medications?: string | null;
  allergies?: string | null;
  activity_level?: string | null;
  sleep_pattern?: string | null;
  water_intake?: string | null;
  bowel_movements?: string | null;
  agni?: string | null;
  prakriti?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: number;
  name: string;
  serving_size?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  rasa?: string[] | null;
  guna?: string[] | null;
  virya?: string | null;
  vata_effect?: string | null;
  pitta_effect?: string | null;
  kapha_effect?: string | null;
  meal_type?: string[] | null;
  food_category?: string | null;
  tags?: string[] | null;
  created_at: string;
}

export interface MealItem {
  food_id: number; // Should match the type of Food.id
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
}

export interface DailyPlan {
  breakfast?: MealItem[];
  brunch?: MealItem[];
  lunch?: MealItem[];
  snacks?: MealItem[];
  dinner?: MealItem[];
}

export interface DietChart {
  id: string;
  patient_id: string;
  dietitian_id: string;
  goal?: string | null;
  duration_weeks?: number | null;
  calories_target?: number | null;
  meal_preferences?: string[] | null;
  exclusions?: string[] | null;
  special_instructions?: string | null;
  // This 'plan_details' matches the JSONB column in the database
  plan_details?: {
    [day: string]: DailyPlan; // e.g., "Day 1", "Day 2"
  } | null;
  status: string;
  created_at: string;
}
