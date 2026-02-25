"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Flame, Snowflake } from "lucide-react"
import { FoodDetailsDialog } from "./food-details-dialog"
import type { Food } from "@/types"
import { useState } from "react"

interface FoodCardProps {
  food: Food
}

export function FoodCard({ food }: FoodCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getDoshaEffectColor = (effect?: string | null) => {
    switch (effect) {
      case "aggravates": return "bg-red-100 text-red-800"
      case "pacifies": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDoshaEffectSymbol = (effect?: string | null) => {
    switch (effect) {
      case "aggravates": return "↑"
      case "pacifies": return "↓"
      default: return "="
    }
  }

  const getViryaIcon = (virya?: string | null) => {
    return virya?.toLowerCase().includes("heating") ? (
      <Flame className="h-3 w-3 text-red-500" />
    ) : (
      <Snowflake className="h-3 w-3 text-blue-500" />
    )
  }

  // -> THE FIX: Reconstruct the dosha_effects object from the individual columns
  const dosha_effects = {
    vata: food.vata_effect,
    pitta: food.pitta_effect,
    kapha: food.kapha_effect,
  }

  return (
    <>
      <Card className="border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{food.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {food.calories} cal / {food.serving_size}
                </Badge>
                {food.virya && (
                  <div className="flex items-center space-x-1">
                    {getViryaIcon(food.virya)}
                    <span className="text-xs text-muted-foreground">{food.virya}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="text-sm font-medium">{food.protein_g}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">{food.carbs_g}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">{food.fat_g}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Rasa (Taste)</div>
              <div className="flex flex-wrap gap-1">
                {/* -> THE FIX: Map directly over the 'rasa' array with a safety check */}
                {food.rasa?.map((rasa, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">{rasa}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Dosha Effects</div>
              <div className="flex items-center space-x-2">
                {Object.entries(dosha_effects).map(([dosha, effect]) => (
                  <Badge key={dosha} className={`text-xs ${getDoshaEffectColor(effect)}`}>
                    {dosha.charAt(0).toUpperCase()}
                    {getDoshaEffectSymbol(effect)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent" onClick={() => setShowDetails(true)}>
              <Eye className="h-3 w-3" /> Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
              <Edit className="h-3 w-3" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <FoodDetailsDialog food={food} open={showDetails} onOpenChange={setShowDetails} />
    </>
  )
}
