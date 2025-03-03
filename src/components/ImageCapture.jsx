import { useState } from "react"
import CameraView from "../components/Camera"
import { Camera, Upload } from "lucide-react"
import ImageUpload from "./ImageUpload" // Import the external ImageUpload component

// Tab navigation for switching between camera and upload
function CaptureNav({ active, onChange }) {
  return (
    <div className="flex w-full max-w-md mb-6 rounded-lg overflow-hidden border">
      <button
        onClick={() => onChange("camera")}
        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
          active === "camera" 
            ? "bg-primary text-white" 
            : "bg-white hover:bg-gray-100"
        }`}
      >
        <Camera size={18} />
        <span>Camera</span>
      </button>
      <button
        onClick={() => onChange("upload")}
        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
          active === "upload" 
            ? "bg-primary text-white" 
            : "bg-white hover:bg-gray-100"
        }`}
      >
        <Upload size={18} />
        <span>Upload</span>
      </button>
    </div>
  )
}

// Main Component
export default function ImageCaptureSection({ onCapture, isLoading, error }) {
  const [captureMode, setCaptureMode] = useState("camera")
  
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6">
      <CaptureNav 
        active={captureMode} 
        onChange={setCaptureMode} 
      />
      
      {captureMode === "camera" ? (
        <div className="w-full max-w-3xl flex items-center justify-center h-full">
          <CameraView onCapture={onCapture} />
        </div>
      ) : (
        <ImageUpload 
          onUpload={onCapture}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  )
}