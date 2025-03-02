"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, RefreshCw, SwitchCamera } from "lucide-react"
import Webcam from "react-webcam"

export default function CameraView({ onCapture }) {
  const webcamRef = useRef(null)
  const [facingMode, setFacingMode] = useState("user")
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [error, setError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  }

  const handleUserMedia = () => {
    setIsInitializing(false)
    setError(null)
  }

  const capture = useCallback(() => {
    if (webcamRef.current) {
      setIsLoading(true)
      try {
        const imageSrc = webcamRef.current.getScreenshot()
        setCapturedImage(imageSrc)
        onCapture(imageSrc)
      } catch (err) {
        setError("Failed to capture image. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [onCapture])

  const retake = () => {
    setCapturedImage(null)
    setError(null)
  }

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-card rounded-lg overflow-hidden shadow-lg">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={retake}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <div className="relative aspect-video">
            <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={retake}
                className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video bg-black">
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              className="w-full h-full object-cover"
              onUserMediaError={() => setError("Unable to access camera. Please check permissions.")}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={toggleCamera}
                  className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors backdrop-blur-sm"
                  disabled={isLoading}
                >
                  <SwitchCamera size={24} />
                </button>
                <button
                  onClick={capture}
                  className="p-6 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors backdrop-blur-sm"
                  disabled={isLoading}
                >
                  <Camera size={32} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-center space-y-2">
        <p className="text-sm font-medium">
          {capturedImage ? "Click the refresh button to retake the photo" : "Center your subject in the frame"}
        </p>
        <p className="text-xs text-muted-foreground">
          {capturedImage
            ? "Make sure the image is clear before proceeding"
            : "Click the camera button when ready to capture"}
        </p>
      </div>
    </div>
  )
}

