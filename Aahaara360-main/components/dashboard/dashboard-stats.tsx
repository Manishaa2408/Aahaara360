import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, UserPlus, HeartPulse } from "lucide-react"

interface DashboardStatsProps {
  patientCount: number;
  chartCount: number;
  newPatientsCount: number;
  commonPrakriti: string;
}

export function DashboardStats({ patientCount, chartCount, newPatientsCount, commonPrakriti }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Patients",
      value: patientCount.toString(),
      icon: Users,
      color: "text-blue-600",
      change: "All time total"
    },
    {
      title: "Diet Charts Created",
      value: chartCount.toString(),
      icon: FileText,
      color: "text-purple-600",
      change: "All time total"
    },
    {
      title: "New Patients (This Month)",
      value: newPatientsCount.toString(),
      icon: UserPlus,
      color: "text-green-600",
      change: "Since the 1st of the month"
    },
    {
      title: "Most Common Prakriti",
      value: commonPrakriti,
      icon: HeartPulse,
      color: "text-orange-600",
      change: "Among all your patients"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}