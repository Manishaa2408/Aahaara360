import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FoodCard } from "@/components/foods/food-card"
import { FoodFilters } from "@/components/foods/food-filters"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Plus } from "lucide-react"
import type { Food } from "@/types"
import { createClient } from "@/lib/supabase-server"

// This page now accepts 'searchParams' to read the URL query for searching.
export default async function FoodsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const supabase = createClient();
  const query = searchParams?.q || '';

  // Start building the Supabase query.
  let supabaseQuery = supabase
    .from('foods')
    .select('*')
    .order('name', { ascending: true });
    
  // If a search query exists in the URL, add a filter to the database query.
  if (query) {
    // .ilike() performs a case-insensitive search.
    supabaseQuery = supabaseQuery.ilike('name', `%${query}%`)
  }

  // Execute the final query.
  const { data: foods, error } = await supabaseQuery;

  if (error) {
    console.error("Error fetching foods:", error);
  }
  
  const foodItems = (foods as Food[]) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Food Database</h1>
            <p className="text-muted-foreground text-pretty">
              Manage your custom food library with detailed Ayurvedic properties.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/foods/new">
              <Plus className="h-4 w-4" />
              Add New Food
            </Link>
          </Button>
        </div>

        {/* This is the new Client Component that handles user input for the search. */}
        <FoodFilters />

        {/* The key={query} on Suspense is a trick to make the component re-render when the search changes. */}
        <Suspense fallback={<div className="text-center p-8">Loading food database...</div>} key={query}>
          {foodItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foodItems.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">{query ? "No Foods Found" : "Your Food Database is Empty"}</h3>
                  <p className="text-muted-foreground text-pretty max-w-md">
                    {query ? "No food items match your search. Try a different query or add a new food item." : "Start by adding a food item with its nutritional and Ayurvedic properties."}
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <Link href="/dashboard/foods/new">
                    <Plus className="h-4 w-4" />
                    Add a Food Item
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

