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

import { useState, useRef } from "react"
import { Upload, AlertCircle } from "lucide-react"

export default function ImageUpload({ onUpload, isLoading, error }) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

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

  // Process the file to create a URL that can be used for display
  const processFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUpload(null, 'Invalid file type. Please upload an image.');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      onUpload(null, 'File size exceeds 10MB limit.');
      return;
    }
  
    const imageURL = URL.createObjectURL(file);
    onUpload(imageURL);
  }

  const handleClick = () => {
    inputRef.current.click()
  }

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
          {isLoading ? (
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-6"></div>
          ) : (
            <div className="p-4 rounded-full bg-primary/10 mb-6">
              {error ? (
                <AlertCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Upload className="h-12 w-12 text-primary" />
              )}
            </div>
          )}

          <h3 className="text-xl font-medium mb-3">
            {isLoading ? "Analyzing image..." : error ? "Upload Error" : "Upload an image"}
          </h3>

          <p className="text-base text-muted-foreground mb-3">{error ? error : "Drag and drop or click to upload"}</p>

          <p className="text-sm text-muted-foreground">Supports: JPG, PNG, GIF (max 10MB)</p>
        </div>
      </div>
    </div>
  )
}