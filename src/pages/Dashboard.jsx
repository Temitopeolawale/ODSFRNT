"use client"

import { useState, useEffect } from "react"
import AnalysisResults from "../components/AnalysisResult"
import ImageAnalyzer from "../components/ImageAnalysis"
import ChatInterface from "../components/ChatInterface"
import ThemeToggle from "../ui/ThemeToggle"
import { useSession } from "../context/session-context"
import ImageUpload from "../components/ImageUpload"

export default function MainContent({ sidebarCollapsed, showUpload, setShowUpload }) {
  const { currentSession, updateSession } = useSession()
  const [analysisResults, setAnalysisResults] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)

  // Listen for changes in the current session
  useEffect(() => {
    if (currentSession?.objects?.length > 0) {
      setAnalysisResults({
        objects: currentSession.objects,
      })
      setCurrentImage(currentSession.capturedImage)
      setShowChat(true)
    } else {
      setShowChat(false)
      setAnalysisResults(null)
    }
  }, [currentSession])

  const handleImageUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create a temporary URL for the file
      const imageUrl = URL.createObjectURL(file)
      setCurrentImage(imageUrl)
      
      // Simulating API response for demonstration
      setTimeout(() => {
        const detectionResult = {
          objects: [
            { name: "Example Object", confidence: 0.95, box: { x: 50, y: 50, width: 100, height: 100 } }
          ]
        }
        
        // Update session with new image and detection results
        if (updateSession && currentSession) {
          updateSession(currentSession.id, {
            capturedImage: imageUrl,
            objects: detectionResult.objects
          })
        }
        
        setAnalysisResults(detectionResult)
        setIsLoading(false)
        setShowUpload(false) // Hide upload component after successful upload
        setShowChat(true)
      }, 2000)
      
    } catch (err) {
      setError("Failed to analyze image. Please try again.")
      setIsLoading(false)
    }
  }
  // overflow scrolling.
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <div className="flex justify-end items-center p-4 border-b">
        <ThemeToggle />
      </div>

      {showUpload ? (
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ marginLeft: sidebarCollapsed ? '7px' : '30px' }}>
            <ImageUpload
              onUpload={handleImageUpload}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      ) : !showChat ? (
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <ImageAnalyzer />
        </div>
      ) : (
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col max-h-[calc(100vh-120px)] overflow-hidden">
            <div className="relative rounded-lg overflow-hidden shadow-md">
              <img
                src={currentImage || currentSession?.capturedImage || "/placeholder.svg"}
                alt="Captured"
                className="w-full rounded-lg"
              />
              {analysisResults && (
                <div className="absolute top-0 left-0 w-full h-full">
                  {analysisResults.objects.map((obj, idx) => (
                    <div
                      key={idx}
                      className="absolute border-2 border-primary rounded-md"
                      style={{
                        left: `${obj.box.x}px`,
                        top: `${obj.box.y}px`,
                        width: `${obj.box.width}px`,
                        height: `${obj.box.height}px`,
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded">
                        {obj.name} ({Math.round(obj.confidence * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden mt-4">
              <AnalysisResults results={analysisResults} />
            </div>
          </div>
          <div className="h-full overflow-hidden">
            <ChatInterface 
              analysisResults={analysisResults} 
              className="h-full"
            />
          </div>
        </div>
      )}
    </main>
  )
}