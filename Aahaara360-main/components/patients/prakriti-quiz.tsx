// components/patients/prakriti-quiz.tsx
"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { useFormStatus } from "react-dom"
import { addPatient } from "@/lib/actions"
import type { PatientFormData } from "./patient-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PrakritiResultDialog } from "./prakriti-result-dialog"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface PrakritiQuizProps {
  patientData: PatientFormData
}

const quizQuestions = [
  { id: 1, question: "Body Frame", options: { vata: "Thin, lean frame", pitta: "Medium, well-proportioned build", kapha: "Large, broad frame" } },
  { id: 2, question: "Skin Type", options: { vata: "Dry, rough, thin", pitta: "Soft, oily, warm, acne-prone", kapha: "Thick, moist, cool" } },
  { id: 3, question: "Body Weight Tendency", options: { vata: "Hard to gain weight", pitta: "Stable weight", kapha: "Gains weight easily" } },
  { id: 4, question: "Hunger Pattern", options: { vata: "Irregular, variable", pitta: "Sharp, urgent, cannot skip", kapha: "Steady, can skip meals" } },
  { id: 5, question: "Weather Tolerance", options: { vata: "Dislikes cold, windy weather", pitta: "Dislikes hot weather", kapha: "Dislikes damp, cool weather" } },
  { id: 6, question: "Reaction to Stress", options: { vata: "Becomes anxious, worried", pitta: "Becomes angry, irritable", kapha: "Becomes calm, withdrawn" } },
  { id: 7, question: "Pace of Activity", options: { vata: "Fast, always moving", pitta: "Focused, intense", kapha: "Slow, steady" } },
  { id: 8, question: "Sleep Pattern", options: { vata: "Light, interrupted", pitta: "Moderate, sound", kapha: "Deep, heavy" } },
  { id: 9, question: "Bowel Movements", options: { vata: "Dry, hard, constipated", pitta: "Soft, loose", kapha: "Heavy, regular" } },
  { id: 10, question: "Hair Type", options: { vata: "Dry, thin, frizzy", pitta: "Fine, thinning, early grey", kapha: "Thick, oily, lustrous" } },
]

export function PrakritiQuiz({ patientData }: PrakritiQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, "vata" | "pitta" | "kapha">>({})
  const [showResult, setShowResult] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleAnswerChange = useCallback((questionId: number, answer: "vata" | "pitta" | "kapha") => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }, [])

  const { prakritiResult, scores } = useMemo(() => {
    const calculatedScores = { vata: 0, pitta: 0, kapha: 0 }
    Object.values(answers).forEach((answer) => { calculatedScores[answer]++ })
    const maxScore = Math.max(calculatedScores.vata, calculatedScores.pitta, calculatedScores.kapha)
    const dominantDoshas = Object.entries(calculatedScores)
      .filter(([_, score]) => score === maxScore)
      .map(([dosha]) => dosha.charAt(0).toUpperCase() + dosha.slice(1))
    
    let result = dominantDoshas.length > 1 ? dominantDoshas.join('-') : dominantDoshas[0] || '';

    return { prakritiResult: result, scores: calculatedScores }
  }, [answers])

  const handleNext = useCallback(() => {
    if (currentQuestion < quizQuestions.length - 1) setCurrentQuestion((prev) => prev + 1)
  }, [currentQuestion])

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1)
  }, [currentQuestion])

  const handleConfirm = useCallback(() => {
    setIsSubmitting(true)
    // Programmatically submit the form
    if (formRef.current) {
      formRef.current.requestSubmit()
    }
  }, [])

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100
  const currentQ = quizQuestions[currentQuestion]
  const allQuestionsAnswered = Object.keys(answers).length === quizQuestions.length

  return (
    <form ref={formRef} action={addPatient} className="space-y-6">
      {/* Hidden inputs for all patient data */}
      {Object.entries(patientData).map(([key, value]) => (
        <input
          key={key}
          type="hidden"
          name={key}
          value={value !== undefined && value !== null ? value.toString() : ''}
        />
      ))}
      <input type="hidden" name="prakritiResult" value={prakritiResult} />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(currentQ.options).map(([dosha, description]) => (
            <div 
              key={dosha} 
              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
              onClick={() => handleAnswerChange(currentQ.id, dosha as "vata" | "pitta" | "kapha")}
            >
              <input 
                type="radio" 
                name={`question-${currentQ.id}`} 
                value={dosha} 
                checked={answers[currentQ.id] === dosha} 
                readOnly 
                className="mt-1"
              />
              <label className="flex-1 cursor-pointer">
                <div className="font-medium capitalize">{dosha}</div>
                <div className="text-sm text-muted-foreground">{description}</div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {currentQuestion < quizQuestions.length - 1 ? (
          <Button type="button" onClick={handleNext} disabled={!answers[currentQ.id]} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={() => setShowResult(true)} disabled={!allQuestionsAnswered}>
            Complete Assessment
          </Button>
        )}
      </div>

      <PrakritiResultDialog
        open={showResult}
        onOpenChange={setShowResult}
        prakritiResult={prakritiResult}
        scores={scores}
        patientName={patientData.name}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </form>
  )
}