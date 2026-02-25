import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Database, Calendar } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Add New Patient",
      description: "Register a new patient and do prakriti analysis",
      icon: UserPlus,
      href: "/dashboard/patients/new",
    },
    {
      title: "Create Diet Chart",
      description: "Generate personalized Ayurvedic diet plan",
      icon: FileText,
      href: "/dashboard/diet-charts/new",
    },
    {
      title: "Manage Food Database",
      description: "Add or update food items and properties",
      icon: Database,
      href: "/dashboard/foods",
    }
  ]

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button key={index} variant="ghost" className="w-full justify-start h-auto p-4 text-left" asChild>
              <a href={action.href}>
                <div className="flex items-start space-x-3">
                  <action.icon className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
