import { login } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock } from "lucide-react"

export function LoginForm() {
  return (
    // The 'action' attribute is the key here. It tells the form to run our server action
    // securely on the server when submitted.
    <form action={login} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          {/* The 'name' attribute is essential for server actions to read the form data. */}
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a href="#" className="text-sm text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      {/* This button will automatically trigger the form's server action */}
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  )
}

