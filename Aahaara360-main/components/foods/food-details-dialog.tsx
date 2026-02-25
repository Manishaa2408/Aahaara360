"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Flame, Snowflake, Activity, Droplets, User } from "lucide-react"
import type { Food } from "@/types"

interface FoodDetailsDialogProps {
  food: Food
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FoodDetailsDialog({ food, open, onOpenChange }: FoodDetailsDialogProps) {
  const getDoshaEffectColor = (effect?: string | null) => {
    switch (effect) {
      case "aggravates": return "bg-red-100 text-red-800"
      case "pacifies": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDoshaEffectText = (effect?: string | null) => {
    switch (effect) {
      case "aggravates": return "Aggravates"
      case "pacifies": return "Pacifies"
      default: return "Neutral"
    }
  }
  
  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case "vata": return <Activity className="h-4 w-4 text-blue-600" />
      case "pitta": return <Droplets className="h-4 w-4 text-red-600" />
      case "kapha": return <User className="h-4 w-4 text-green-600" />
      default: return null
    }
  }

  const getViryaIcon = (virya?: string | null) => {
    return virya?.toLowerCase().includes("heating") ? (
      <Flame className="h-4 w-4 text-red-500" />
    ) : (
      <Snowflake className="h-4 w-4 text-blue-500" />
    )
  }

  // -> THE FIX: Reconstruct the dosha_effects object
  const dosha_effects = {
    vata: food.vata_effect,
    pitta: food.pitta_effect,
    kapha: food.kapha_effect,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{food.name}</DialogTitle>
          <DialogDescription>Complete nutritional and Ayurvedic profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Nutritional Information ({food.serving_size})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center space-y-1"><div className="text-2xl font-bold text-primary">{food.calories}</div><div className="text-sm text-muted-foreground">Calories</div></div>
                <div className="text-center space-y-1"><div className="text-2xl font-bold">{food.protein_g}g</div><div className="text-sm text-muted-foreground">Protein</div></div>
                <div className="text-center space-y-1"><div className="text-2xl font-bold">{food.carbs_g}g</div><div className="text-sm text-muted-foreground">Carbs</div></div>
                <div className="text-center space-y-1"><div className="text-2xl font-bold">{food.fat_g}g</div><div className="text-sm text-muted-foreground">Fat</div></div>
                <div className="text-center space-y-1"><div className="text-2xl font-bold">{food.fiber_g}g</div><div className="text-sm text-muted-foreground">Fiber</div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Ayurvedic Properties</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Rasa (Taste)</h4>
                <div className="flex flex-wrap gap-2">
                  {/* -> THE FIX: Map directly over the 'rasa' array */}
                  {food.rasa?.map((rasa, index) => <Badge key={index} variant="secondary">{rasa}</Badge>)}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Guna (Qualities)</h4>
                <div className="flex flex-wrap gap-2">
                  {/* -> THE FIX: Map directly over the 'guna' array */}
                  {food.guna?.map((guna, index) => <Badge key={index} variant="outline">{guna}</Badge>)}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Virya (Potency)</h4>
                {food.virya && (
                  <div className="flex items-center space-x-2">
                    {getViryaIcon(food.virya)}
                    <Badge variant="outline" className="gap-1">{food.virya}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Effects on Doshas</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(dosha_effects).map(([dosha, effect]) => (
                  <div key={dosha} className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      {getDoshaIcon(dosha)}
                      <span className="font-medium capitalize">{dosha}</span>
                    </div>
                    <Badge className={getDoshaEffectColor(effect)}>{getDoshaEffectText(effect)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
