import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Target, TrendingUp } from "lucide-react"

interface NutritionAnalysisProps {
  selectedDay: string
  meals: any
  targetCalories?: number
}

export function NutritionAnalysis({ selectedDay, meals, targetCalories = 1800 }: NutritionAnalysisProps) {
  // Calculate totals from meals
  const calculateTotals = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    Object.values(meals).forEach((mealArray: any) => {
      if (Array.isArray(mealArray)) {
        mealArray.forEach((meal: any) => {
          totalCalories += meal.calories || 0
          // Mock protein/carbs/fat calculation (would come from food database)
          totalProtein += Math.round((meal.calories * 0.15) / 4) // 15% protein
          totalCarbs += Math.round((meal.calories * 0.55) / 4) // 55% carbs
          totalFat += Math.round((meal.calories * 0.3) / 9) // 30% fat
        })
      }
    })

    return { totalCalories, totalProtein, totalCarbs, totalFat }
  }

  const { totalCalories, totalProtein, totalCarbs, totalFat } = calculateTotals()
  const calorieProgress = (totalCalories / targetCalories) * 100

  const getProgressColor = (percentage: number) => {
    if (percentage < 80) return "bg-yellow-500"
    if (percentage > 120) return "bg-red-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Nutrition Analysis</h3>
      </div>

      {/* Daily Calories */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Daily Calories</CardTitle>
            <Badge variant="outline" className="text-xs">
              {selectedDay}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{totalCalories}</span>
            <span className="text-sm text-muted-foreground">/ {targetCalories} cal</span>
          </div>
          <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
          <div className="flex items-center space-x-2 text-xs">
            <Target className="h-3 w-3" />
            <span className="text-muted-foreground">
              {calorieProgress > 100 ? "Over" : calorieProgress < 80 ? "Under" : "On"} target by{" "}
              {Math.abs(totalCalories - targetCalories)} cal
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Macronutrients */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Macronutrients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Protein</span>
              <span className="font-medium">{totalProtein}g</span>
            </div>
            <Progress value={(totalProtein / ((targetCalories * 0.15) / 4)) * 100} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Carbohydrates</span>
              <span className="font-medium">{totalCarbs}g</span>
            </div>
            <Progress value={(totalCarbs / ((targetCalories * 0.55) / 4)) * 100} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Fat</span>
              <span className="font-medium">{totalFat}g</span>
            </div>
            <Progress value={(totalFat / ((targetCalories * 0.3) / 9)) * 100} className="h-1" />
          </div>
        </CardContent>
      </Card>

      {/* Ayurvedic Balance */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Dosha Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">Vata</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Balanced
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">Pitta</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Balanced
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Kapha</span>
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                Slightly High
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Good balance for {selectedDay}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
