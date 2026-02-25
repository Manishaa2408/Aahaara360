"use client"

import { addFood } from "@/lib/actions"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Apple, Activity, Flame, Utensils, Tag, Clock } from "lucide-react"

const rasaOptions = ["Sweet", "Sour", "Salty", "Pungent", "Bitter", "Astringent"]
const gunaOptions = ["Heavy", "Light", "Oily", "Dry", "Hot", "Cold", "Smooth", "Rough", "Dense", "Liquid", "Soft", "Hard", "Static", "Mobile", "Gross", "Subtle", "Cloudy", "Clear"]
const mealTypeOptions = ["Breakfast", "Brunch", "Lunch", "Snacks", "Dinner"]
const tagOptions = ["Vegan", "Vegetarian", "Gluten-Free", "Tridoshic"]

// A new component to handle the form's pending state automatically
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full gap-2">
      {pending ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Creating Food...</>
      ) : (
        "Create Food Item"
      )}
    </Button>
  )
}

export function FoodForm() {
  return (
    <form action={addFood} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <Apple className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="name">Food Name *</Label>
                <Input id="name" name="name" placeholder="e.g., Basmati Rice" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="serving_size">Serving Size</Label>
                <Input id="serving_size" name="serving_size" placeholder="e.g., 1 cup cooked" />
            </div>
        </div>
      </div>

      {/* Nutritional Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Nutritional Information</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="space-y-2"><Label htmlFor="calories">Calories</Label><Input id="calories" name="calories" type="number" step="1" placeholder="210" /></div>
          <div className="space-y-2"><Label htmlFor="protein_g">Protein (g)</Label><Input id="protein_g" name="protein_g" type="number" step="0.1" placeholder="5" /></div>
          <div className="space-y-2"><Label htmlFor="carbs_g">Carbs (g)</Label><Input id="carbs_g" name="carbs_g" type="number" step="0.1" placeholder="46" /></div>
          <div className="space-y-2"><Label htmlFor="fat_g">Fat (g)</Label><Input id="fat_g" name="fat_g" type="number" step="0.1" placeholder="0.5" /></div>
          <div className="space-y-2"><Label htmlFor="fiber_g">Fiber (g)</Label><Input id="fiber_g" name="fiber_g" type="number" step="0.1" placeholder="0.7" /></div>
        </div>
      </div>

      {/* Ayurvedic Properties */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <Flame className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Ayurvedic Properties</h3>
        </div>
        <div className="space-y-3"><Label>Rasa (Taste) *</Label><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{rasaOptions.map((rasa) => (<div key={rasa} className="flex items-center space-x-2"><Checkbox id={`rasa-${rasa}`} name="rasa" value={rasa} /><Label htmlFor={`rasa-${rasa}`} className="text-sm">{rasa}</Label></div>))}</div></div>
        <div className="space-y-3"><Label>Guna (Qualities) *</Label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{gunaOptions.map((guna) => (<div key={guna} className="flex items-center space-x-2"><Checkbox id={`guna-${guna}`} name="guna" value={guna} /><Label htmlFor={`guna-${guna}`} className="text-sm">{guna}</Label></div>))}</div></div>
        <div className="space-y-2"><Label htmlFor="virya">Virya (Potency)</Label><Select name="virya"><SelectTrigger><SelectValue placeholder="Select potency" /></SelectTrigger><SelectContent><SelectItem value="Heating">Heating (Ushna)</SelectItem><SelectItem value="Cooling">Cooling (Sheeta)</SelectItem></SelectContent></Select></div>
        <div className="space-y-4"><Label>Effects on Doshas *</Label><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="space-y-2"><Label htmlFor="vata_effect" className="text-blue-600 font-medium">Vata Effect</Label><Select name="vata_effect" defaultValue="neutral"><SelectTrigger><SelectValue placeholder="Select effect" /></SelectTrigger><SelectContent><SelectItem value="aggravates">Aggravates</SelectItem><SelectItem value="pacifies">Pacifies</SelectItem><SelectItem value="neutral">Neutral</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="pitta_effect" className="text-red-600 font-medium">Pitta Effect</Label><Select name="pitta_effect" defaultValue="neutral"><SelectTrigger><SelectValue placeholder="Select effect" /></SelectTrigger><SelectContent><SelectItem value="aggravates">Aggravates</SelectItem><SelectItem value="pacifies">Pacifies</SelectItem><SelectItem value="neutral">Neutral</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="kapha_effect" className="text-green-600 font-medium">Kapha Effect</Label><Select name="kapha_effect" defaultValue="neutral"><SelectTrigger><SelectValue placeholder="Select effect" /></SelectTrigger><SelectContent><SelectItem value="aggravates">Aggravates</SelectItem><SelectItem value="pacifies">Pacifies</SelectItem><SelectItem value="neutral">Neutral</SelectItem></SelectContent></Select></div></div></div>
      </div>

      {/* Categorization */}
      <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-border"><Utensils className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold">Categorization</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="food_category">Food Category</Label><Input id="food_category" name="food_category" placeholder="e.g., Grains, Dal, Vegetable" /></div>
            <div className="space-y-3"><Label>Meal Type</Label><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{mealTypeOptions.map((type) => (<div key={type} className="flex items-center space-x-2"><Checkbox id={`meal-${type}`} name="meal_type" value={type} /><Label htmlFor={`meal-${type}`} className="text-sm">{type}</Label></div>))}</div></div>
          </div>
          <div className="space-y-3"><Label>Tags</Label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{tagOptions.map((tag) => (<div key={tag} className="flex items-center space-x-2"><Checkbox id={`tag-${tag}`} name="tags" value={tag} /><Label htmlFor={`tag-${tag}`} className="text-sm">{tag}</Label></div>))}</div></div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" type="button" asChild><a href="/dashboard/foods">Cancel</a></Button>
        <SubmitButton />
      </div>
    </form>
  )
}

