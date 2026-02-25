import { viewPatientDashboard } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

export function PatientLoginForm() {
  return (
    // This form calls the 'viewPatientDashboard' server action directly.
    <form action={viewPatientDashboard} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Your Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter the email your dietitian used"
            className="pl-10"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        View My Dashboard
      </Button>
    </form>
  )
}

