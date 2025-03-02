"use client"

import { useState } from "react"
import { Download, ZoomIn, ZoomOut } from "lucide-react"

export default function AnalysisDisplay({ image, results, objects, isLoading }) {
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleDownload = () => {
    if (!image) return

    const link = document.createElement("a")
    
    if (typeof image === 'string') {
      // For URLs or base64 data URLs
      link.href = image
    } else {
      // For Blob or File objects
      link.href = URL.createObjectURL(image)
    }
    
    link.download = `analyzed-image-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Determine the image source based on type
  const getImageSrc = () => {
    if (!image) return null
    return typeof image === 'string' ? image : URL.createObjectURL(image)
  }

  return (
    <div className="w-full h-[600px] flex flex-col border rounded-lg overflow-hidden bg-card">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-medium">Image Analysis</h2>
        <div className="flex items-center space-x-2">
          <button onClick={handleZoomOut} className="p-1 rounded-md hover:bg-muted" aria-label="Zoom out">
            <ZoomOut size={18} />
          </button>
          <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1 rounded-md hover:bg-muted" aria-label="Zoom in">
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={handleDownload} 
            className="p-1 rounded-md hover:bg-muted" 
            aria-label="Download image"
            disabled={!image}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto h-[300px]">
        <div
          className="relative min-h-[300px] w-full flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center",
            transition: "transform 0.2s ease-out",
          }}
        >
          {image ? (
            <img 
              src={getImageSrc()} 
              alt="Analyzed" 
              className="object-contain max-w-full max-h-[300px]"
              onError={(e) => {
                console.error("Error loading image:", e);
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                e.target.alt = "Error loading image";
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted/20">
              <p className="text-muted-foreground">No image uploaded</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {results && !isLoading && results.objects && (
            <div className="absolute top-0 left-0 w-full h-full">
              {results.objects && results.objects.map((obj, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-primary rounded-md"
                  style={{
                    left: `${obj.box?.x || 0}px`,
                    top: `${obj.box?.y || 0}px`,
                    width: `${obj.box?.width || 0}px`,
                    height: `${obj.box?.height || 0}px`,
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded">
                    {obj.name} ({Math.round((obj.confidence || 0) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {results && !isLoading && (
        <div className="p-4 border-t border-border h-[200px] overflow-y-auto">
          <h3 className="text-sm font-medium mb-2">Detection Summary</h3>
          <div className="text-sm">
            {results.description && (
              <p className="mb-2">{results.description}</p>
            )}
            
            {/* Handle both structures for objects */}
            {(results.objects || objects) && (results.objects || objects).length > 0 && (
              <>
                <p>Detected {(results.objects || objects).length} objects in this image.</p>
                <p className="text-muted-foreground mt-1">
                  Objects: {(results.objects || objects).map((obj) => obj.name).join(", ")}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {!results && !isLoading && image && (
        <div className="p-4 border-t border-border h-[300px] overflow-y-auto">
          <p className="text-sm text-muted-foreground">Image loaded. Waiting for analysis results...</p>
        </div>
      )}
    </div>
  )
}