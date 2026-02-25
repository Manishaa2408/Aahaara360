// components/patients/prakriti-result-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Activity, Droplets } from "lucide-react"

interface PrakritiResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prakritiResult: string
  scores: { vata: number; pitta: number; kapha: number }
  patientName: string
  onConfirm: () => void
  isSubmitting: boolean
}

// A helper object to keep display data clean
const doshaDescriptions = {
  Vata: { element: "Air & Space", characteristics: "Creative, energetic, but prone to anxiety.", color: "text-blue-600", icon: Activity },
  Pitta: { element: "Fire & Water", characteristics: "Intelligent, focused, but prone to anger.", color: "text-red-600", icon: Droplets },
  Kapha: { element: "Earth & Water", characteristics: "Calm, stable, but prone to sluggishness.", color: "text-green-600", icon: User },
}

export function PrakritiResultDialog({
  open,
  onOpenChange,
  prakritiResult,
  scores,
  patientName,
  onConfirm,
  isSubmitting,
}: PrakritiResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Prakriti Assessment Complete</DialogTitle>
          <DialogDescription>
            Based on the responses, here is {patientName}'s Ayurvedic constitution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 text-center">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">{prakritiResult}</CardTitle>
              <p className="text-muted-foreground">Dominant Ayurvedic Constitution</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Detailed Dosha Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(scores).map(([dosha, score]) => {
                const doshaInfo = doshaDescriptions[dosha.charAt(0).toUpperCase() + dosha.slice(1) as keyof typeof doshaDescriptions];
                if (!doshaInfo) return null; // Safety check
                return (
                  <div key={dosha} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <doshaInfo.icon className={`h-4 w-4 ${doshaInfo.color}`} />
                        <span className="font-medium capitalize">{dosha}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{score}/10</span>
                    </div>
                    <Progress value={(score / 10) * 100} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          <Alert>
            <AlertDescription>
              Please review the assessment results. Once confirmed, this patient profile will be saved.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Review Answers
            </Button>
            
            <Button type="button" onClick={onConfirm} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating Patient...</>
              ) : (
                "Confirm & Save Patient"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}