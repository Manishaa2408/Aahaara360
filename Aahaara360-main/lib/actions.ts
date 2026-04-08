"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { Patient, Food, DietChart } from '@/types'

// Define the shape of the configuration data from the form
type ConfigurationFormData = {
  goal: string;
  duration_weeks: number;
  calories_target?: number | '';
  meal_preferences?: string[];
  exclusions?: string[];
  special_instructions?: string;
}

// --- CORE AUTH ACTIONS ---

export async function login(formData: FormData) {
  const supabase = createClient();
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const { error } = await supabase.auth.signInWithPassword(data)
  if (error) {
    console.error("Login error:", error.message)
    return redirect('/?message=' + encodeURIComponent(error.message))
  }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  if (password !== confirmPassword) {
    return redirect('/register?message=Passwords do not match')
  }
  const email = formData.get('email') as string
  const options = {
    data: {
      full_name: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      license_number: formData.get('licenseNumber') as string,
      clinic_name: formData.get('clinicName') as string,
      address: formData.get('address') as string,
    }
  }
  const { error } = await supabase.auth.signUp({ email, password, options })
  if (error) {
    console.error("Signup Error:", error.message)
    return redirect('/register?message=Could not create account. Email may already be in use.')
  }
  return redirect('/?message=Signup successful! Please check your email to verify.')
}

// --- PATIENT MANAGEMENT ACTIONS ---

// -> THE FIX: This function now reads all fields directly from FormData
// and correctly converts numbers. This fixes the "Failed to create patient" error.
export async function addPatient(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to add a patient.");
  }

  // Extract all data from the form
  const patientData = {
    dietitian_id: user.id,
    name: formData.get('name') as string,
    age: Number(formData.get('age')),
    gender: formData.get('gender') as string,
    height: Number(formData.get('height')),
    weight: Number(formData.get('weight')),
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    medical_history: formData.get('medical_history') as string,
    current_medications: formData.get('current_medications') as string,
    allergies: formData.get('allergies') as string,
    activity_level: formData.get('activity_level') as string,
    sleep_pattern: formData.get('sleep_pattern') as string,
    water_intake: formData.get('water_intake') as string,
    bowel_movements: formData.get('bowel_movements') as string,
    agni: formData.get('agni') as string,
    prakriti: formData.get('prakritiResult') as string,
  };

  const { error } = await supabase.from('patients').insert([patientData]);

  if (error) {
    console.error("Error creating patient in database:", error.message);
    throw new Error(`Database error: ${error.message}`);
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients?message=Patient created successfully!');
}


// lib/actions.ts - Add this function
export async function updatePatient(patientId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to update a patient.");
  }

  // Extract updated data from the form
  const updatedData = {
    name: formData.get('name') as string,
    age: Number(formData.get('age')),
    gender: formData.get('gender') as string,
    height: Number(formData.get('height')),
    weight: Number(formData.get('weight')),
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    medical_history: formData.get('medical_history') as string,
    current_medications: formData.get('current_medications') as string,
    allergies: formData.get('allergies') as string,
    activity_level: formData.get('activity_level') as string,
    sleep_pattern: formData.get('sleep_pattern') as string,
    water_intake: formData.get('water_intake') as string,
    bowel_movements: formData.get('bowel_movements') as string,
    agni: formData.get('agni') as string,
  };

  const { error } = await supabase
    .from('patients')
    .update(updatedData)
    .eq('id', patientId)
    .eq('dietitian_id', user.id);

  if (error) {
    console.error("Error updating patient:", error.message);
    throw new Error(`Failed to update patient: ${error.message}`);
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
  revalidatePath('/dashboard/patients');
  redirect(`/dashboard/patients/${patientId}?message=Patient updated successfully!`);
}
// --- DIET CHART AI & SAVE ACTIONS ---

/**
 * The "Architect AI": Generates a 7-day diet draft based on strict rules.
 */
export async function generateDietDraft(
  configuration: ConfigurationFormData,
  patient: Patient,
  foods: Food[]
): Promise<DietChart['plan_details']> {
  
  let targetCalories = 2000; // Default fallback
  if (configuration.calories_target && configuration.calories_target !== '') {
    targetCalories = Number(configuration.calories_target);
  } else if (patient.weight && patient.height && patient.age && patient.gender && patient.activity_level) {
      // -> THE FIX: Corrected Harris-Benedict formula
      const bmr = patient.gender === "Female"
        ? 655.1 + (9.563 * patient.weight) + (1.850 * patient.height) - (4.676 * patient.age)
        : 66.47 + (13.75 * patient.weight) + (5.003 * patient.height) - (6.755 * patient.age);
      const activityMultipliers: { [key: string]: number } = { "Sedentary": 1.2, "Lightly Active": 1.375, "Moderately Active": 1.55, "Very Active": 1.725 };
      const multiplier = activityMultipliers[patient.activity_level] || 1.4;
      const maintenanceCalories = Math.round(bmr * multiplier);
      // Adjust for goal
      if (configuration.goal?.toLowerCase().includes('loss')) { targetCalories = maintenanceCalories - 400; }
      else if (configuration.goal?.toLowerCase().includes('gain')) { targetCalories = maintenanceCalories + 400; }
      else { targetCalories = maintenanceCalories; }
  }

  // Define Calorie Split based on Agni
  const calorieSplit = { breakfast: 0.25, lunch: 0.35, dinner: 0.25, brunch: 0.075, snacks: 0.075 };
  if (patient.agni === 'Weak') { calorieSplit.lunch = 0.30; calorieSplit.dinner = 0.20; calorieSplit.brunch = 0.10; calorieSplit.snacks = 0.15; }
  if (patient.agni === 'Strong') { calorieSplit.lunch = 0.40; calorieSplit.dinner = 0.25; }

  // Multi-Layered Food Filtering
  const suitableFoods = foods.filter(food => {
    const prakriti = patient.prakriti?.toLowerCase() ?? '';
    if (prakriti.includes('vata') && food.vata_effect === 'aggravates') return false;
    if (prakriti.includes('pitta') && food.pitta_effect === 'aggravates') return false;
    if (prakriti.includes('kapha') && food.kapha_effect === 'aggravates') return false;
    
    const exclusions = [...(configuration.exclusions || [])];
    if (patient.allergies) { exclusions.push(...patient.allergies.split(',').map(a => a.trim())); }
    const lowerCaseExclusions = exclusions.map(e => e.toLowerCase());

    if (lowerCaseExclusions.length > 0 && food.tags?.some(tag => lowerCaseExclusions.includes(tag.toLowerCase()))) {
        return false;
    }
    return true;
  });

  if (suitableFoods.length < 5) {
    throw new Error("Not enough food variety for these restrictions. Please adjust.");
  }

  // Assemble the 7-Day Plan
  const finalPlan: DietChart['plan_details'] = {};
  const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  
  const mealOptions = {
    breakfast: suitableFoods.filter(f => f.meal_type?.includes('Breakfast')),
    brunch: suitableFoods.filter(f => f.meal_type?.includes('Brunch')),
    lunch: suitableFoods.filter(f => f.meal_type?.includes('Lunch')),
    snacks: suitableFoods.filter(f => f.meal_type?.includes('Snacks')),
    dinner: suitableFoods.filter(f => f.meal_type?.includes('Dinner')),
  };

  const getRandomMeal = (options: Food[]) => {
      if (!options || options.length === 0) return null;
      const food = options[Math.floor(Math.random() * options.length)];
      
      // -> THE FIX: Use the food's actual data. This solves the "NaN cal" bug.
      return {
          food_id: food.id,
          food_name: food.name,
          quantity: 1, // Simplified for hackathon, assuming 1 serving
          unit: food.serving_size || "serving",
          calories: food.calories || 0,
          protein: food.protein_g || 0,
          carbs: food.carbs_g || 0,
          fat: food.fat_g || 0,
      };
  };

  days.forEach(day => {
    finalPlan[day] = {
      breakfast: [getRandomMeal(mealOptions.breakfast)].filter(Boolean) as any,
      brunch: [getRandomMeal(mealOptions.brunch)].filter(Boolean) as any,
      lunch: [getRandomMeal(mealOptions.lunch)].filter(Boolean) as any,
      snacks: [getRandomMeal(mealOptions.snacks)].filter(Boolean) as any,
      dinner: [getRandomMeal(mealOptions.dinner)].filter(Boolean) as any,
    };
  });

  return finalPlan;
}

/**
 * Saves the finalized diet chart to the database.
 */
export async function saveDietChart(
  patientId: string,
  configuration: ConfigurationFormData,
  finalPlan: DietChart['plan_details']
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to save a diet chart.");
  }

  // -> THE FIX: This data structure now perfectly matches your database schema.
  const chartData = {
    patient_id: patientId,
    dietitian_id: user.id,
    goal: configuration.goal,
    duration_weeks: configuration.duration_weeks,
    // Safely handle optional calorie target
    calories_target: configuration.calories_target === '' || configuration.calories_target === undefined ? null : Number(configuration.calories_target),
    meal_preferences: configuration.meal_preferences,
    exclusions: configuration.exclusions,
    special_instructions: configuration.special_instructions,
    plan_details: finalPlan, // The JSONB field
  };

  const { error } = await supabase.from('diet_charts').insert([chartData]);

  if (error) {
    console.error("Error saving diet chart:", error);
    throw new Error(`Failed to save the diet chart: ${error.message}`);
  }

  revalidatePath('/dashboard/diet-charts');
  redirect('/dashboard/diet-charts?message=Diet chart created successfully!');
}



interface Message {
  role: 'user' | 'model';
  content: string;
}

/**
 * This is a secure Server Action that calls the Gemini API.
 * It runs only on the server, protecting your API key.
 * @param chatHistory The history of the conversation so far.
 * @returns The AI model's response as a string.
 */
export async function getAiChatResponse(chatHistory: Message[]) {
  // IMPORTANT: Add your Gemini API Key to your .env.local file
  // Example: GEMINI_API_KEY=AIzaSy...
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const systemPrompt = "You are a helpful Ayurvedic assistant named Aahaara AI. Your goal is to provide accurate, concise, and safe information about Ayurvedic concepts, herbs, and dietary principles. Base your answers on established Ayurvedic knowledge. Format your answers clearly using markdown (e.g., lists, bold text). If a question is outside the scope of Ayurveda, politely state that you can only answer Ayurvedic-related queries.";

  // We need to format the history for the Gemini API
  const contents = chatHistory.map(message => ({
    role: message.role,
    parts: [{ text: message.content }]
  }));

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    // This enables Google Search grounding for real-time, accurate answers
    tools: [{ "google_search": {} }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("API call failed:", await response.text());
      return "Sorry, there was an error connecting to the AI model.";
    }

    const result = await response.json();
    const modelResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!modelResponseText) {
      return "The AI returned an empty response. Please try rephrasing your question.";
    }

    return modelResponseText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}
// --- FOOD MANAGEMENT ACTION ---

export async function addFood(formData: FormData) {
  const supabase = createClient();

  // optional: check user login
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to add food.");
  }

  const foodData = {
    name: formData.get("name") as string,
    serving_size: formData.get("serving_size") as string,
    calories: Number(formData.get("calories")),
    protein_g: Number(formData.get("protein_g")),
    carbs_g: Number(formData.get("carbs_g")),
    fat_g: Number(formData.get("fat_g")),
    fiber_g: Number(formData.get("fiber_g")),
    virya: formData.get("virya") as string,
    vata_effect: formData.get("vata_effect") as string,
    pitta_effect: formData.get("pitta_effect") as string,
    kapha_effect: formData.get("kapha_effect") as string,
    food_category: formData.get("food_category") as string,

    // arrays
    rasa: formData.getAll("rasa"),
    guna: formData.getAll("guna"),
    meal_type: formData.getAll("meal_type"),
    tags: formData.getAll("tags"),
  };

  const { error } = await supabase.from("foods").insert([foodData]);

  if (error) {
    console.error("Error adding food:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/foods");
  redirect("/dashboard/foods?message=Food added successfully!");
}
export async function viewPatientDashboard(formData: FormData) {
  const supabase = createClient();
  const email = formData.get('email') as string;

  if (!email) {
    return redirect('/?tab=patient&message=Email address is required.');
  }

  // Security Check: First, verify that a patient with this email actually exists.
  const { data: patient, error } = await supabase
    .from('patients')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !patient) {
    console.error("Attempted to view dashboard for non-existent patient:", email);
    return redirect('/?tab=patient&message=No patient found with this email address.');
  }

  // If the patient exists, redirect to their dashboard with the email as a query parameter.
  redirect(`/patient-dashboard?email=${encodeURIComponent(email)}`);
}

// --- UNIVERSAL SIGN OUT ACTION ---
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

