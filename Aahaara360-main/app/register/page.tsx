import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Create a Professional Account</h1>
          <p className="text-muted-foreground text-pretty">
            Join Aahaara360 to start managing your patients and creating diet plans.
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Register as a Dietitian</CardTitle>
            <CardDescription>Fill in the details below to create your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {searchParams.message && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{searchParams.message}</AlertDescription>
              </Alert>
            )}
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
