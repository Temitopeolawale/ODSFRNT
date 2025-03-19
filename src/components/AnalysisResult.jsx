
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Download } from "lucide-react"

export default function AnalysisResults({ results }) {
  if (!results) return null

  const handleExport = () => {
    // Create CSV content
    const csvContent = "Object,Confidence\n" + results.objects.map((obj) => `${obj.name},${obj.confidence}`).join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `vision-flow-analysis-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Analysis Results</CardTitle>
        <button onClick={handleExport} className="p-1 hover:bg-muted rounded-full" title="Export results">
          <Download size={18} />
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {results.objects.map((obj, idx) => (
            <div key={idx} className="p-3 bg-muted rounded-lg flex flex-col">
              <span className="font-medium">{obj.name}</span>
              <div className="w-full bg-muted-foreground/20 h-2 rounded-full mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${obj.confidence * 100}%` }}></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{Math.round(obj.confidence * 100)}% confidence</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

