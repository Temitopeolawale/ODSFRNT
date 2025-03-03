// import { useState, useRef } from "react"
// import { Upload, AlertCircle } from "lucide-react"

// export function ImageUpload({ onUpload, isLoading, error }) {
//   const [dragActive, setDragActive] = useState(false)
//   const inputRef = useRef(null)

//   const handleDrag = (e) => {
//     e.preventDefault()
//     e.stopPropagation()

//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       onUpload(e.dataTransfer.files[0])
//     }
//   }

//   const handleChange = (e) => {
//     e.preventDefault()

//     if (e.target.files && e.target.files[0]) {
//       onUpload(e.target.files[0])
//     }
//   }

//   const handleClick = () => {
//     inputRef.current.click()
//   }

//   return (
//     <div className="w-full max-w-2xl mx-auto">
//       <div
//         className={`
//           relative flex flex-col items-center justify-center w-full h-64 p-10
//           border-2 border-dashed rounded-lg transition-colors
//           ${dragActive ? "border-primary bg-primary/5" : "border-border"}
//           ${isLoading ? "opacity-75 pointer-events-none" : "hover:bg-muted/50 cursor-pointer"}
//         `}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//         onClick={handleClick}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           className="hidden"
//           accept="image/*"
//           onChange={handleChange}
//           disabled={isLoading}
//         />

//         <div className="flex flex-col items-center text-center">
//           {isLoading ? (
//             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-6"></div>
//           ) : (
//             <div className="p-4 rounded-full bg-primary/10 mb-6">
//               {error ? (
//                 <AlertCircle className="h-12 w-12 text-destructive" />
//               ) : (
//                 <Upload className="h-12 w-12 text-primary" />
//               )}
//             </div>
//           )}

//           <h3 className="text-xl font-medium mb-3">
//             {isLoading ? "Analyzing image..." : error ? "Upload Error" : "Upload an image"}
//           </h3>

//           <p className="text-base text-muted-foreground mb-3">{error ? error : "Drag and drop or click to upload"}</p>

//           <p className="text-sm text-muted-foreground">Supports: JPG, PNG, GIF (max 10MB)</p>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useRef, useEffect } from "react"
import { Upload, AlertCircle, Check, X } from "lucide-react"

export default function ImageUpload({ onUpload, isLoading, error }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState("idle") // idle, uploading, success, error
  const inputRef = useRef(null)

  // Reset status when error or loading state changes
  useEffect(() => {
    if (error) {
      setUploadStatus("error")
    } else if (!isLoading && uploadStatus === "uploading") {
      setUploadStatus("success")
    }
  }, [error, isLoading])

  // When upload is successful and analysis is complete, reset the component
  useEffect(() => {
    if (uploadStatus === "success" && !isLoading) {
      // Keep status for a moment so user can see success
      const timer = setTimeout(() => {
        // No need to reset here - the parent component will handle showing analysis
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [uploadStatus, isLoading])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadStatus("error")
      onUpload(null, 'Invalid file type. Please upload an image.')
      return
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error")
      onUpload(null, 'File size exceeds 10MB limit.')
      return
    }
  
    // Create a URL for display purposes
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    setUploadedFile(file)
    setUploadStatus("uploading")
    
    // Immediately trigger upload and analysis
    onUpload(file, null, imageUrl)
  }

  const handleClick = () => {
    inputRef.current.click()
  }

  const resetUpload = () => {
    setUploadedImage(null)
    setUploadedFile(null)
    setUploadStatus("idle")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  // If we have an uploaded image, show it with a loading overlay
  if (uploadedImage && (uploadStatus === "uploading" || isLoading)) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
          <img 
            src={uploadedImage} 
            alt="Uploaded image being analyzed" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-medium">Analyzing your image...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If there was an error, show the image with an error overlay
  if (uploadedImage && uploadStatus === "error") {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
          <img 
            src={uploadedImage} 
            alt="Failed upload" 
            className="w-full h-full object-contain opacity-50"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg p-6 flex flex-col items-center">
              <div className="p-3 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-red-500">Upload Error</p>
              <p className="text-sm text-gray-600 mt-2 mb-4 text-center">{error || "Failed to process image. Please try again."}</p>
              <button
                onClick={resetUpload}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default upload UI
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative flex flex-col items-center justify-center w-full h-64 p-10
          border-2 border-dashed rounded-lg transition-colors
          ${dragActive ? "border-primary bg-primary/5" : "border-border"}
          ${isLoading ? "opacity-75 pointer-events-none" : "hover:bg-muted/50 cursor-pointer"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-6">
            <Upload className="h-12 w-12 text-primary" />
          </div>

          <h3 className="text-xl font-medium mb-3">
            Upload an image
          </h3>

          <p className="text-base text-muted-foreground mb-3">
            Drag and drop or click to upload
          </p>

          <p className="text-sm text-muted-foreground">
            Supports: JPG, PNG, GIF (max 10MB)
          </p>
        </div>
      </div>
    </div>
  )
}