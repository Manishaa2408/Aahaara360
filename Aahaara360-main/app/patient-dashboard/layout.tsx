import type React from "react"

// For the "demo mode" patient view, this layout's only job is to render its children.
// The security check for a logged-in user has been removed to allow direct access via email lookup.
export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  // It simply returns the page content that it wraps.
  return <>{children}</>
}

