"use client"

import { useState } from "react"
import type { Patient } from "@/types" // Import the Patient type
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation" // Use useRouter for client-side navigation

// This component now receives the list of patients as a prop.
interface PatientSelectorProps {
  patients: Patient[];
}

export function PatientSelector({ patients }: PatientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const router = useRouter()

  // Filter patients on the client-side based on the search term
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  // Helper function to get color based on Prakriti
  const getPrakritiColor = (prakriti: string | null | undefined) => {
    if (!prakriti) return "bg-gray-100 text-gray-800";
    if (prakriti.includes("Vata")) return "bg-blue-100 text-blue-800"
    if (prakriti.includes("Pitta")) return "bg-red-100 text-red-800"
    if (prakriti.includes("Kapha")) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  // Navigate to the dynamic page for the selected patient
  const handleContinue = (patientId: string) => {
    router.push(`/dashboard/diet-charts/${patientId}/new`)
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patient List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className={`border-border/50 hover:shadow-md transition-all cursor-pointer ${
                selectedPatientId === patient.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedPatientId(patient.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{patient.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{patient.age} years</span>
                        <span>•</span>
                        <span>{patient.gender}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                         <Badge className={`text-xs ${getPrakritiColor(patient.prakriti)}`}>{patient.prakriti || 'N/A'}</Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No patients found matching your search.</p>
          </div>
        )}
      </div>

      {/* Continue Button appears only when a patient is selected */}
      {selectedPatientId && (
        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={() => handleContinue(selectedPatientId)} className="gap-2">
            Continue with Selected Patient
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

