import { signup } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Phone, MapPin } from "lucide-react"

export function RegisterForm() {
  return (
    // This form now calls the 'signup' server action directly.
    <form action={signup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="fullName" name="fullName" type="text" placeholder="Dr. Your Name" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="email" name="email" type="email" placeholder="your.email@example.com" className="pl-10" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input id="licenseNumber" name="licenseNumber" type="text" placeholder="RD12345" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicName">Clinic/Practice Name</Label>
        <Input id="clinicName" name="clinicName" type="text" placeholder="Your Clinic Name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="address" name="address" type="text" placeholder="Clinic address" className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="password" name="password" type="password" placeholder="Create password" className="pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm password" className="pl-10" required />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  )
}
