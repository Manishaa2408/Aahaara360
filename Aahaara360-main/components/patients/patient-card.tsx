import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Edit, FileText, Trash2, Phone, Mail } from "lucide-react"
import type { Patient } from "@/types"
import Link from "next/link"

interface PatientCardProps {
  patient: Patient
}

export function PatientCard({ patient }: PatientCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getBMI = (weight: number, height: number) => {
    const heightInM = height / 100
    return (weight / (heightInM * heightInM)).toFixed(1)
  }

  const getPrakritiColor = (prakriti: string) => {
    if (prakriti.includes("Vata")) return "bg-blue-100 text-blue-800"
    if (prakriti.includes("Pitta")) return "bg-red-100 text-red-800"
    if (prakriti.includes("Kapha")) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="border-border/50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{patient.age} years</span>
                <span>•</span>
                <span>{patient.gender}</span>
              </div>
            </div>
          </div>
          <Badge className={`text-xs ${getPrakritiColor(patient.prakriti)}`}>{patient.prakriti}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-sm font-medium">{patient.height} cm</div>
            <div className="text-xs text-muted-foreground">Height</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">{patient.weight} kg</div>
            <div className="text-xs text-muted-foreground">Weight</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">{getBMI(patient.weight, patient.height)}</div>
            <div className="text-xs text-muted-foreground">BMI</div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{patient.email}</span>
          </div>
        </div>

        {/* Activity Level & Agni */}
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline">{patient.activity_level}</Badge>
          <Badge variant="outline">Agni: {patient.agni}</Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Link href={`/dashboard/patients/${patient.id}`}>
              <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Eye className="h-3 w-3" />
                    View
              </Button>
          </Link>
            <Link href={`/dashboard/patients/${patient.id}/edit`}>
              <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Edit className="h-3 w-3" />
                    Edit
                </Button>
            </Link>
            <Link href={`/dashboard/diet-charts/${patient.id}/new`}>
            <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
            <FileText className="h-3 w-3" />
            Diet
          </Button>
            </Link>
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
