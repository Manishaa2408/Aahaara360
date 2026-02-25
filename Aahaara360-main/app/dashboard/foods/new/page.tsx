import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FoodForm } from "@/components/foods/food-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewFoodPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Add New Food</h1>
            <p className="text-muted-foreground text-pretty">
              Add a food item with complete nutritional and Ayurvedic properties
            </p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Food Information</CardTitle>
              <CardDescription>
                Enter both modern nutritional data and traditional Ayurvedic properties for this food item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FoodForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
