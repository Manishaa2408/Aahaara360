// app/dashboard/summarizer/page.tsx
import { Summarizer } from "@/components/dashboard/summarizer"

export default function SummarizerPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Document Summarizer</h1>
      <Summarizer />
    </div>
  )
}