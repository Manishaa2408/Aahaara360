"use client" // This must be a client component to handle user clicks.

import { Button } from "@/components/ui/button"
import { Bell, Settings, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase" // Import the client-side Supabase client
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()

  // This async function signs the user out and redirects them to the login page.
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/") // Redirect to the homepage/login page.
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Aahaara360</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            {/* The onClick handler is added here to trigger the logout function. */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
