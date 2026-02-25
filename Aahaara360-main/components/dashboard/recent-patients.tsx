import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit } from "lucide-react"
import type { Patient } from "@/types"
import Link from "next/link" // -> Import the Link component

interface RecentPatientsProps {
  patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">You have not added any patients yet.</p>
          ) : (
            patients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{patient.name}</h4>
                    {patient.prakriti && (
                      <Badge variant="secondary" className="text-xs">
                        {patient.prakriti}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Age: {patient.age ?? 'N/A'} • Added on: {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {/* -> THE FIX: Wrap buttons in a Link component */}
                  <Link href={`/dashboard/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/patients/${patient.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}