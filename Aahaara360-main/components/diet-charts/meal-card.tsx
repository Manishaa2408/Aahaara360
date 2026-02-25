"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Sun, Moon, Apple } from "lucide-react"
import { SwapFoodButton } from "./swap-food-button"
import type { MealItem } from "@/types"

interface MealCardProps {
  mealType: string
  meals: MealItem[]
  // This function will be passed from the parent to handle the update
  onMealUpdate: (mealType: string, updatedMeals: MealItem[]) => void
}

const mealIcons: { [key: string]: React.ElementType } = {
  breakfast: Coffee,
  brunch: Apple,
  lunch: Sun,
  dinner: Moon,
  snacks: Apple,
}

export function MealCard({ mealType, meals = [], onMealUpdate }: MealCardProps) {
  const Icon = mealIcons[mealType] || Apple
  const totalCalories = meals.reduce((sum, meal) => sum + (meal?.calories || 0), 0)

  // This function is called by the SwapFoodButton
  const handleFoodSwap = (originalFoodId: number, newFood: MealItem) => {
    // It creates a new array with the swapped food
    const updatedMeals = meals.map(meal => 
      meal.food_id === originalFoodId ? newFood : meal
    );
    // It then calls the parent's function to update the main state
    onMealUpdate(mealType, updatedMeals);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base capitalize">{mealType}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">{totalCalories} cal</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.length > 0 ? (
          meals.map((meal) => (
            <div key={`${meal.food_id}-${Math.random()}`} className="flex items-center justify-between text-sm gap-2">
              <div className="flex-1">
                <div className="font-medium">{meal.food_name}</div>
                <div className="text-muted-foreground text-xs">{meal.quantity} {meal.unit}</div>
              </div>
              <div className="text-xs text-muted-foreground">{meal.calories} cal</div>
              <SwapFoodButton
                foodId={meal.food_id}
                foodName={meal.food_name}
                currentMeal={meal}
                onFoodSwap={handleFoodSwap}
              />
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No meal assigned.</p>
        )}
      </CardContent>
    </Card>
  )
}
