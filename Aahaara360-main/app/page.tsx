import { LoginForm } from "@/components/auth/login-form"
import { PatientLoginForm } from "@/components/auth/patient-login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, User } from "lucide-react"

export default function UnifiedLoginPage({ searchParams }: { searchParams: { message: string, tab: string } }) {
  
  // This allows the server action to specify which tab should be active
  const defaultTab = searchParams.tab || 'dietitian';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Aahaara360</h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-balance">Ayurvedic Diet Planning Platform</h2>
            <p className="text-muted-foreground text-pretty">
              Secure portal for both dietitians and their patients.
            </p>
          </div>
        </div>

        {/* This component will display any success or error messages from the server */}
        {searchParams.message && (
            <Alert 
              variant={searchParams.message.includes("Could not") || searchParams.message.includes("No patient") ? "destructive" : "default"} 
              className="mb-4"
            >
              <AlertDescription>{searchParams.message}</AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dietitian"><User className="h-4 w-4 mr-2"/>Dietitian</TabsTrigger>
            <TabsTrigger value="patient"><Bot className="h-4 w-4 mr-2"/>Patient</TabsTrigger>
          </TabsList>
          
          {/* Dietitian Login Tab */}
          <TabsContent value="dietitian">
            <Card className="border-t-0 rounded-t-none">
              <CardHeader>
                <CardTitle>Dietitian Portal</CardTitle>
                <CardDescription>Sign in with your email and password.</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Login Tab */}
          <TabsContent value="patient">
            <Card className="border-t-0 rounded-t-none">
              <CardHeader>
                <CardTitle>Patient Portal</CardTitle>
                <CardDescription>Enter your email to receive a secure login link.</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientLoginForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

         <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Are you a dietitian?{" "}
            <a href="/register" className="text-primary hover:underline font-medium">
              Create a professional account
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

