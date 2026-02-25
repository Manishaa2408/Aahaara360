'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { RefreshCw, Check, Loader2 } from 'lucide-react';
import type { MealItem } from '@/types'; // -> Import the correct, consistent MealItem type

// -> This interface now includes all the data we need from the AI suggestion
interface SimilarFood {
  id: number;
  name: string;
  calories: number; // Assumes this is calories_per_100g
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  similarity: number;
}

interface SwapFoodButtonProps {
  foodId: number;
  foodName: string;
  currentMeal: MealItem;
  onFoodSwap: (originalFoodId: number, newFood: MealItem) => void;
}

export function SwapFoodButton({ foodId, foodName, currentMeal, onFoodSwap }: SwapFoodButtonProps) {
  const [similarFoods, setSimilarFoods] = useState<SimilarFood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFindSimilarFoods = async () => {
    if (!foodId) return;

    setIsLoading(true);
    setError(null);
    setSimilarFoods([]);

    try {
      // This calls your "Specialist AI" Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke('get-similar-foods', {
        body: { foodId: foodId },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data.error) throw new Error(data.error);

      // We expect the function to return an array of similar foods
      setSimilarFoods(data.similarFoods || []);

    } catch (e: any) {
      setError("Could not find similar foods at this time.");
      console.error("Error invoking Supabase function:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = (selectedFood: SimilarFood) => {
    // -> THE FIX: We now calculate ALL macros for the new meal item, not just calories.
    // This ensures the NutritionAnalysis component updates correctly.
    // We assume the quantity unit is 'g' for this calculation.
    const quantityMultiplier = (currentMeal.quantity || 100) / 100;

    const newMealItem: MealItem = {
      ...currentMeal,
      food_id: selectedFood.id,
      food_name: selectedFood.name,
      // Calculate total nutrition based on the new food's per-100g stats and the original quantity
      calories: Math.round(selectedFood.calories * quantityMultiplier),
      protein: Math.round(selectedFood.protein_g * quantityMultiplier),
      carbs: Math.round(selectedFood.carbs_g * quantityMultiplier),
      fat: Math.round(selectedFood.fat_g * quantityMultiplier),
    };
    
    // Call the parent callback to update the state in diet-chart-generator.tsx
    onFoodSwap(foodId, newMealItem);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={handleFindSimilarFoods}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Swap Suggestions</DialogTitle>
          <DialogDescription>
            Ayurvedically similar alternatives for "{foodName}".
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[300px] overflow-y-auto pr-2">
          {isLoading && 
            <div className="flex justify-center items-center p-8 space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Consulting Specialist AI...</p>
            </div>
          }
          {error && <p className="text-center text-destructive">{error}</p>}
          
          {!isLoading && similarFoods.length > 0 && (
            <ul className="space-y-2">
              {similarFoods.map(food => (
                <li key={food.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50">
                  <div>
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.calories} kcal per 100g</p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <p className="text-sm font-medium text-primary">
                      {Math.round(food.similarity * 100)}% Match
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleSelectFood(food)}
                    >
                      <Check className="h-3 w-3 mr-1" /> Select
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && similarFoods.length === 0 && (
            <p className="text-center text-muted-foreground p-8">No suitable swap suggestions found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
