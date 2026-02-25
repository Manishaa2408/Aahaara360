import { createClient } from "@/lib/supabase-server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { redirect } from "next/navigation"
import type { Patient, DietitianProfile } from "@/types"
import { AyurvedicChatbot } from "@/components/chatbot/ayurvedic-chatbot"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect("/") }

  // -> Get the first day of the current month for our new query
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // -> Updated to fetch 4 pieces of data in parallel
  const [
    profileData, 
    patientCountData, 
    chartCountData, 
    recentPatientsData,
    newPatientsData,
    commonPrakritiData
  ] = await Promise.all([
    supabase.from('dietitians_profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('diet_charts').select('*', { count: 'exact', head: true }),
    supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(5),
    // -> New Query 1: Count patients created this month
    supabase.from('patients').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
    // -> New Query 2: Find the most common Prakriti
    supabase.rpc('get_common_prakriti') // We'll create this simple database function next
  ])

  const profile = profileData.data as DietitianProfile | null
  const patientCount = patientCountData.count ?? 0
  const chartCount = chartCountData.count ?? 0
  const recentPatients = (recentPatientsData.data as Patient[]) ?? []
  const newPatientsCount = newPatientsData.count ?? 0
  const commonPrakriti = commonPrakritiData.data?.[0]?.prakriti ?? 'N/A'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-balance">Welcome back, {profile?.full_name ?? 'Doctor'}</h1>
          <p className="text-muted-foreground text-pretty">
            Here's an overview of your practice and recent patient activity
          </p>
        </div>

        {/* -> Pass all the new data as props */}
        <DashboardStats 
          patientCount={patientCount} 
          chartCount={chartCount}
          newPatientsCount={newPatientsCount}
          commonPrakriti={commonPrakriti}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentPatients patients={recentPatients} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
      <AyurvedicChatbot />
    </DashboardLayout>
  )
}