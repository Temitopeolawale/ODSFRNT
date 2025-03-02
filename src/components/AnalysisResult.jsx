

// import { useState } from "react"
// import { Download, ZoomIn, ZoomOut } from "lucide-react"

// export function AnalysisResults({ image, detectionResult, isLoading }) {
//   const [zoomLevel, setZoomLevel] = useState(1)

//   const handleZoomIn = () => {
//     setZoomLevel((prev) => Math.min(prev + 0.1, 2))
//   }

//   const handleZoomOut = () => {
//     setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
//   }

//   const handleDownload = () => {
//     const link = document.createElement("a")
//     link.href = image
//     link.download = `analyzed-image-${Date.now()}.jpg`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   // Process detection results
//   const processedObjects = detectionResult?.objects || []
  
//   return (
//     <div className="h-full flex flex-col">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-medium">Image Analysis</h2>
//         <div className="flex items-center space-x-2">
//           <button onClick={handleZoomOut} className="p-1 rounded-md hover:bg-muted" aria-label="Zoom out">
//             <ZoomOut size={18} />
//           </button>
//           <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
//           <button onClick={handleZoomIn} className="p-1 rounded-md hover:bg-muted" aria-label="Zoom in">
//             <ZoomIn size={18} />
//           </button>
//           <button onClick={handleDownload} className="p-1 rounded-md hover:bg-muted" aria-label="Download image">
//             <Download size={18} />
//           </button>
//         </div>
//       </div>

//       <div className="relative flex-1 overflow-auto border rounded-lg">
//         <div
//           className="relative min-h-full"
//           style={{
//             transform: `scale(${zoomLevel})`,
//             transformOrigin: "top left",
//             transition: "transform 0.2s ease-out",
//           }}
//         >
//           <img src={image || "/placeholder.svg"} alt="Analyzed" className="max-w-full h-auto" />

//           {isLoading && (
//             <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//             </div>
//           )}

//           {detectionResult && !isLoading && (
//             <div className="absolute top-0 left-0 w-full h-full">
//               {processedObjects.map((obj, idx) => (
//                 <div
//                   key={idx}
//                   className="absolute border-2 border-primary rounded-md"
//                   style={{
//                     left: `${obj.box.x}px`,
//                     top: `${obj.box.y}px`,
//                     width: `${obj.box.width}px`,
//                     height: `${obj.box.height}px`,
//                   }}
//                 >
//                   <span className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded">
//                     {obj.name} ({Math.round(obj.confidence * 100)}%)
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {detectionResult && !isLoading && (
//         <div className="mt-4 p-4 bg-muted rounded-lg">
//           <h3 className="text-sm font-medium mb-2">Detection Summary</h3>
//           <div className="text-sm">
//             <p>Detected {processedObjects.length} objects in this image.</p>
//             {processedObjects.length > 0 && (
//               <p className="text-muted-foreground mt-1">
//                 Objects: {processedObjects.map((obj) => obj.name).join(", ")}
//               </p>
//             )}
//             {detectionResult.description && (
//               <p className="mt-2">{detectionResult.description}</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// "use client"
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

