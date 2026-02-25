import { createClient } from "@/lib/supabase-server"
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, Target, Calendar, Utensils, ArrowLeft, Camera, CookingPot } from "lucide-react"

// This page now receives searchParams to get the patient's email from the URL.
export default async function PatientDashboardPage({ searchParams }: { searchParams: { email: string } }) {
  const supabase = createClient()
  const email = searchParams.email;

  // If no email is provided in the URL, we can't show anything.
  if (!email) {
    redirect("/?tab=patient&message=Please enter an email to view a profile.");
  }

  // --- DATA FETCHING ---
  // 1. Fetch the patient's profile using the email from the URL.
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email)
    .single()
  
  // If no patient profile is found, show a user-friendly error message.
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-4">
        <div>
            <h1 className="text-2xl font-bold">Patient Not Found</h1>
            <p className="text-muted-foreground">Could not find a profile for "{email}". Please check the email and try again.</p>
            <Button asChild className="mt-4"><Link href="/">Back to Login</Link></Button>
        </div>
      </div>
    )
  }

  // 2. If a patient profile exists, fetch their most recent diet chart.
  const { data: dietChart } = await supabase
    .from('diet_charts')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false }) // Get the newest one first
    .limit(1)
    .single()
    
  // Safely extract the plan details from the diet chart's JSONB column.
  const plan = dietChart?.plan_details;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Aahaara360 Portal</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/" className="gap-2"><ArrowLeft className="h-4 w-4"/>Back to Login</Link>
          </Button>
        </header>

        {/* Patient Profile Card */}
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle>Welcome, {patient.name}!</CardTitle>
            <CardDescription>Here is a summary of your health profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-100 rounded-lg"><div className="font-bold">{patient.age} yrs</div><div className="text-sm text-gray-500">Age</div></div>
            <div className="p-4 bg-gray-100 rounded-lg"><div className="font-bold">{patient.gender}</div><div className="text-sm text-gray-500">Gender</div></div>
            <div className="p-4 bg-gray-100 rounded-lg"><div className="font-bold">{patient.prakriti || 'N/A'}</div><div className="text-sm text-gray-500">Prakriti</div></div>
            <div className="p-4 bg-gray-100 rounded-lg"><div className="font-bold">{patient.agni}</div><div className="text-sm text-gray-500">Agni</div></div>
          </CardContent>
        </Card>

        {/* -> NEW: Patient Tools Section */}
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* This Link will go to the scanner page we will build later */}
                <Link href={`/dashboard/scanner`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Camera className="w-8 h-8 text-primary"/>
                            <div>
                                <CardTitle>AI Food Scanner</CardTitle>
                                <CardDescription>Scan your meals for instant nutritional and Ayurvedic analysis.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                 {/* This Link will go to the recipes page we will build later */}
                 <Link href={`/dashboard/recipe`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <CookingPot className="w-8 h-8 text-primary"/>
                            <div>
                                <CardTitle>AI Recipe Finder</CardTitle>
                                <CardDescription>Discover healthy Ayurvedic recipes for any dish.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>

        {/* Diet Chart Section */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Current Diet Plan</h2>
        {dietChart && plan ? (
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2"><Target/> {dietChart.goal}</CardTitle>
                  <CardDescription>Duration: {dietChart.duration_weeks} weeks</CardDescription>
                </div>
                <Badge variant={dietChart.status === 'active' ? 'default' : 'secondary'}>{dietChart.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(plan).map(([day, dailyPlan]: [string, any]) => (
                <div key={day}>
                  <h3 className="font-bold text-lg mb-2">{day}</h3>
                  <div className="space-y-4">
                    {Object.entries(dailyPlan).map(([mealType, meals]: [string, any]) => (
                      <div key={mealType}>
                        <h4 className="font-semibold capitalize flex items-center gap-2 mb-2"><Utensils className="h-4 w-4 text-gray-500"/> {mealType}</h4>
                        <div className="pl-6 border-l-2 border-green-200 space-y-2">
                          {meals && meals.length > 0 ? (
                            meals.map((meal: any) => (
                              <div key={meal.food_id} className="flex justify-between items-center text-sm">
                                <span>{meal.food_name} <span className="text-gray-500">({meal.quantity} {meal.unit})</span></span>
                                <Badge variant="outline">{meal.calories} kcal</Badge>
                              </div>
                            ))
                          ) : <p className="text-xs text-gray-500">No meal assigned.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-gray-500">Your dietitian is preparing your diet plan. It will appear here soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

