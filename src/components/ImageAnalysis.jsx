import { useState, useEffect, useRef } from "react"
import axios from "axios"

import ImageUpload from "../components/ImageUpload"
import CameraView from "../components/Camera"
import AnalysisDisplay from "../components/AnalysisDisplay"
import ChatInterface from "./ChatInterface"
import { useTheme } from "../context/theme-context"
import { useCaptureMode } from "../context/CaptureMode-context"

export default function ImageAnalyzer() {
  const { theme } = useTheme()
  const { captureMode } = useCaptureMode()
  // Set camera as the default mode
  // const [captureMode, setCaptureMode] = useState("camera")
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [detectedObjects, setDetectedObjects] = useState([])
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)

  const API_URL = "http://localhost:2009/api/v1"
  const WS_URL = "ws://localhost:2009" // Adjust based on your WebSocket endpoint

  // Load thread ID from localStorage on initial render
  useEffect(() => {
    const savedThreadId = localStorage.getItem("ai-analyzer-thread-id")
    if (savedThreadId) {
      setThreadId(savedThreadId)
    }
  }, [])

  // Connect to WebSocket when threadId changes
  useEffect(() => {
    if (!threadId) return

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Connect to WebSocket server
    const ws = new WebSocket(`${WS_URL}?threadId=${threadId}`)

    ws.onopen = () => {
      console.log("WebSocket connection established")
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Process incoming message based on your backend's response format
        if (data.type === 'response' && data.content) {
          // Parse the content if it's a stringified JSON
          let messageContent;
          
          try {
            // If content is a string that contains JSON, parse it
            const parsedContent = typeof data.content === 'string' 
              ? JSON.parse(data.content) 
              : data.content;
              
            // If parsedContent is an object with content/history/threadId structure
            if (typeof parsedContent === 'object' && parsedContent !== null) {
              // Extract the actual text content - this is likely the message content
              if (parsedContent.content) {
                // If content itself is a string that looks like JSON, parse it again
                messageContent = typeof parsedContent.content === 'string' && 
                                parsedContent.content.startsWith('"') && 
                                parsedContent.content.endsWith('"')
                  ? JSON.parse(parsedContent.content)  // Remove extra quotes
                  : parsedContent.content;
              } else {
                // Fallback to stringifying the object if no content property
                messageContent = JSON.stringify(parsedContent);
              }
            } else {
              // If parsedContent is already a string or other primitive
              messageContent = parsedContent;
            }
          } catch (e) {
            // If parsing fails, use the original content
            console.error("Error parsing message content:", e);
            messageContent = typeof data.content === 'string' 
              ? data.content 
              : JSON.stringify(data.content);
          }
    
          const newMessage = {
            id: Date.now(),
            role: "assistant",
            content: messageContent, // Now contains string content
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, newMessage])
          setIsLoading(false)
        } else if (data.type === 'status') {
          // Handle status updates to show loading state
          console.log("Status update:", data.content)
          // Only show loading if we're in a state that indicates processing
          setIsLoading(['queued', 'in_progress'].includes(data.content))
        } else if (data.type === 'error') {
          setError(data.content || "An error occurred")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
        setIsLoading(false)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setWsConnected(false)
      setError("Connection error. Please refresh the page.")
      setIsLoading(false)
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed")
      setWsConnected(false)
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (threadId) {
          console.log("Attempting to reconnect WebSocket...")
          // Only attempt to reconnect if component is still mounted
          // This will trigger the useEffect again
          setThreadId(prevId => {
            if (prevId) return prevId; // Keep the same ID to trigger the effect
            return null;
          });
        }
      }, 5000);
    }

    wsRef.current = ws

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [threadId])

  const handleImageSource = async (imageData, errorMessage, previewUrl = null) => {
    setIsLoading(true)
    setError(null)
  
    if (errorMessage) {
      setError(errorMessage)
      setIsLoading(false)
      return
    }
  
    try {
      // If a preview URL was provided, use it for display
      if (previewUrl) {
        setImage(previewUrl)
      } else {
        // Otherwise, use the image data directly (for camera capture)
        setImage(imageData)
      }
      
      // Create FormData object to send to backend
      const formData = new FormData()
      
      // Convert base64/dataURL to blob if necessary (for camera captures)
      if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        const blob = await fetch(imageData).then(res => res.blob())
        formData.append('image', blob, 'camera_capture.jpg')
      } else if (imageData instanceof Blob || imageData instanceof File) {
        // If imageData is already a Blob or File object (from upload)
        formData.append('image', imageData)
      }
      
      // Add thread ID if we have one
      if (threadId) {
        formData.append('threadId', threadId)
      }
      
      // Send the form data to your backend
      const response = await axios.post(`${API_URL}/analyse/analysingImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      })
  
      // Log the complete response to see its structure
      console.log("Backend response:", response.data)
  
      // Handle response based on backend format
      const data = response.data
      
      if (data.threadId) {
        setThreadId(data.threadId)
        localStorage.setItem("ai-analyzer-thread-id", data.threadId)
      }
      
      if (data.url) {
        setImageUrl(data.url)
      }
      
      // Process any backend analysis data for the analysis display
      if (data.data && Array.isArray(data.data)) {
        // Find the assistant message that contains the analysis
        const assistantMessages = data.data.filter(msg => msg.role === "assistant")
        if (assistantMessages.length > 0) {
          const analysisMessage = assistantMessages[0]
          
          // Set the analysis results with the assistant's message
          setAnalysisResults({
            description: analysisMessage.content,
            timestamp: new Date(analysisMessage.created_at * 1000).toISOString()
          })
          
          // Extract objects from the message if needed
          const extractedObjects = extractObjectsFromMessage(analysisMessage.content)
          if (extractedObjects.length > 0) {
            setDetectedObjects(extractedObjects)
          }
        }
      }
      
      // Add initial welcome messages to the chat interface
      // These are hardcoded messages to match the UI example
      const currentTime = new Date().toISOString()
      const welcomeMessages = [
        {
          id: Date.now(),
          role: "assistant",
          content: "I'm ready to analyze your image. Ask me questions about what I see!",
          timestamp: currentTime
        },
        // {
        //   id: Date.now() + 1,
        //   role: "assistant",
        //   content: `Analysis complete! I've detected ${detectedObjects.length || "several"} objects in your image.`,
        //   timestamp: new Date(Date.now() + 1000).toISOString() // 1 second later
        // }
      ]
      
      setMessages(welcomeMessages)
      
    } catch (err) {
      console.error("Error analyzing image:", err)
      setError(err.response?.data?.message || "Failed to analyze image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to extract objects from the message text
  // This is still useful for the AnalysisDisplay component
  const extractObjectsFromMessage = (messageText) => {
    const objects = []
    let objectId = 1
    
    // For UML diagrams, we can extract the classes/components mentioned
    const classRegex = /\*\*(.*?)\*\*/g
    let match
    
    while ((match = classRegex.exec(messageText)) !== null) {
      const className = match[1].trim()
      
      // Skip if it's not actually a class name (e.g., "Purpose", "Attributes", etc.)
      const skipWords = ["Purpose", "Attributes", "Methods", "Attributes and Methods"]
      if (!skipWords.includes(className) && !objects.some(obj => obj.name === className)) {
        objects.push({
          id: objectId++,
          name: className,
          type: "Class/Component",
          confidence: 1.0 // High confidence since these are explicitly mentioned
        })
      }
    }
    
    return objects
  }

  const sendMessage = async (message) => {
    if (!message.trim() || !threadId) return

    // Set loading state while waiting for response
    setIsLoading(true)

    // Create new message locally
    const newMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    // Add message to local state
    setMessages(prev => [...prev, newMessage])
    
    try {
      // Send message via WebSocket instead of REST API
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          threadId: threadId,
          message: message
        }))
      } else {
        throw new Error("WebSocket connection not available")
      }
      
      // Response will be handled by the WebSocket onmessage handler
      
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Failed to send message. Please try again.")
      setIsLoading(false)
      
      // Remove the message from the UI if it failed to send
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id))
    }
  }

  // Reset the analysis to capture a new image
  const resetAnalysis = () => {
    setImage(null)
    setImageUrl(null)
    setAnalysisResults(null)
    setDetectedObjects([])
    setMessages([]) // Clear messages when resetting
    setError(null)
    // Keep threadId for conversation continuity if needed
  }

  return (
   <div className={`min-h-screen flex flex-col`}>
      <main className="flex-1">
        {!image ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center p-6">
            
            {captureMode === "camera" ? (
              <div className="w-full max-w-3xl flex items-center justify-center h-full">
                <CameraView onCapture={handleImageSource} />
              </div>
            ) : (
              <ImageUpload 
                onUpload={handleImageSource}
                isLoading={isLoading}
                error={error}/>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-screen">
            
            <div className="flex flex-row flex-wrap md:flex-nowrap flex-1">
              <div className="w-full md:w-1/2 p-4 overflow-auto">
                <AnalysisDisplay 
                  image={imageUrl || image} 
                  results={analysisResults} 
                  objects={detectedObjects}
                  isLoading={isLoading} 
                />
                
                {/* Moved the button here to be closer to the analysis display */}
                <div className="mt-4">
                  <button 
                    onClick={resetAnalysis}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Capture New Image
                  </button>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-4 overflow-hidden flex flex-col">
                <ChatInterface
                  messages={messages}
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  wsConnected={wsConnected || !!threadId} // Consider thread existence as "connected"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}





// import { useState, useEffect, useRef, useCallback } from "react"
// import { AlertCircle, RefreshCw, Upload, Camera } from "lucide-react"
// import ImageUpload from "./ImageUpload"
// import CameraView from "./Camera"
// import AnalysisResults from "./AnalysisResult"
// import { Button } from "../ui/Button"
// import { useTheme } from "../context/theme-context"
// import { useSession } from "../context/session-context"

// export default function ImageAnalyzer() {
//   const { theme } = useTheme()
//   const { addMessageToCurrentSession } = useSession()

//   const [image, setImage] = useState(null)
//   const [captureMode, setCaptureMode] = useState('upload') // 'upload' or 'camera'
//   const [isLoading, setIsLoading] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [threadId, setThreadId] = useState(null)
//   const [analysisResults, setAnalysisResults] = useState(null)
//   const [detectedObjects, setDetectedObjects] = useState([])
//   const [messages, setMessages] = useState([])
//   const [error, setError] = useState(null)
//   const [uploadError, setUploadError] = useState(null)
//   const [analysisError, setAnalysisError] = useState(null)
//   const [cloudinaryUrl, setCloudinaryUrl] = useState(null)
//   const [wsConnected, setWsConnected] = useState(false)
//   const wsRef = useRef(null)

//   // Load thread ID from localStorage on initial render
//   useEffect(() => {
//     const savedThreadId = localStorage.getItem("ai-analyzer-thread-id")
//     if (savedThreadId) {
//       setThreadId(savedThreadId)
//     }
//   }, [])

//   // Connect to WebSocket when threadId changes
//   useEffect(() => {
//     if (!threadId) return

//     // Close existing connection if any
//     if (wsRef.current) {
//       wsRef.current.close()
//     }

//     // In a real app, this would connect to your actual WebSocket server
//     // For demo purposes, we'll simulate WebSocket behavior
//     const mockWs = {
//       send: (data) => {
//         console.log("WebSocket message sent:", data)
//         // Simulate server response after a delay
//         setTimeout(() => {
//           const parsedData = JSON.parse(data)
//           handleServerResponse(parsedData)
//         }, 1000)
//       },
//       close: () => {
//         console.log("WebSocket closed")
//         setWsConnected(false)
//       },
//     }

//     // Simulate connection established
//     setTimeout(() => {
//       setWsConnected(true)
//       // Add initial system message
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now(),
//           role: "system",
//           content: "I'm ready to analyze your image. Ask me questions about what I see!",
//           timestamp: new Date().toISOString(),
//         },
//       ])
//     }, 500)

//     wsRef.current = mockWs

//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close()
//       }
//     }
//   }, [threadId])

//   const handleServerResponse = (data) => {
//     // Simulate AI response based on user message
//     if (data.type === "message") {
//       const responseContent = generateResponse(data.message, analysisResults)

//       const newMessage = {
//         id: Date.now(),
//         role: "assistant",
//         content: responseContent,
//         timestamp: new Date().toISOString(),
//       }

//       setMessages((prev) => [...prev, newMessage])
//     }
//   }

//   const generateResponse = (userMessage, results) => {
//     if (!results) return "I don't see any image to analyze. Please upload or capture an image first."

//     const message = userMessage.toLowerCase()

//     if (message.includes("how many")) {
//       return `I detected ${results.objects.length} objects in the image.`
//     } else if (message.includes("what") && message.includes("see")) {
//       const objectNames = results.objects.map((obj) => obj.name).join(", ")
//       return `I can see: ${objectNames}.`
//     } else if (message.includes("color")) {
//       return "I can identify objects but can't determine specific colors in this demo version."
//     } else {
//       return "I'm analyzing the objects in your image. Feel free to ask specific questions about what you see!"
//     }
//   }

//   const handleImageCapture = useCallback((imageSrc) => {
//     setImage(imageSrc)
//     setUploadError(null)
//     setAnalysisError(null)
//     setAnalysisResults(null)
//     setCloudinaryUrl(null)
//     setError(null)
//   }, [])

//   const toggleCaptureMode = () => {
//     setCaptureMode(current => current === 'upload' ? 'camera' : 'upload')
//     setImage(null)
//     setAnalysisResults(null)
//     setError(null)
//     setUploadError(null)
//     setAnalysisError(null)
//   }

//   const uploadToCloudinary = async (imageUrl) => {
//     if (!imageUrl) return

//     setIsUploading(true)
//     setUploadError(null)

//     try {
//       // Convert base64 image to blob if from camera
//       let blob;
//       if (imageUrl.startsWith('data:')) {
//         const response = await fetch(imageUrl)
//         blob = await response.blob()
//       } else {
//         // If from file upload, it's already a blob URL
//         const response = await fetch(imageUrl)
//         blob = await response.blob()
//       }

//       // In a real app, this would upload to Cloudinary
//       // For demo purposes, we'll simulate a successful upload
      
//       // Create a fake Cloudinary URL
//       const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/${Math.random().toString(36).substring(2, 15)}`
//       setCloudinaryUrl(mockCloudinaryUrl)

//       // Proceed to analyze the image
//       await analyzeImage(mockCloudinaryUrl)
//     } catch (error) {
//       console.error("Upload error:", error)
//       setUploadError(error.message || "Failed to upload image")
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const analyzeImage = async (imageUrl) => {
//     setIsAnalyzing(true)
//     setAnalysisError(null)

//     try {
//       // Generate a fake thread ID if we don't have one
//       const newThreadId = threadId || `thread_${Math.random().toString(36).substring(2, 15)}`
//       setThreadId(newThreadId)
//       localStorage.setItem("ai-analyzer-thread-id", newThreadId)

//       // Simulate API call to analyze image with delay
//       await new Promise((resolve) => setTimeout(resolve, 2000))

//       // Simulate analysis results
//       const mockResults = {
//         objects: [
//           { id: 1, name: "Person", confidence: 0.98, box: { x: 50, y: 30, width: 200, height: 300 } },
//           { id: 2, name: "Chair", confidence: 0.85, box: { x: 300, y: 200, width: 150, height: 120 } },
//           { id: 3, name: "Coffee Cup", confidence: 0.76, box: { x: 400, y: 150, width: 50, height: 60 } },
//           { id: 4, name: "Laptop", confidence: 0.92, box: { x: 200, y: 250, width: 180, height: 120 } },
//         ],
//       }

//       setAnalysisResults(mockResults)

//       // Update detected objects list
//       setDetectedObjects((prev) => {
//         const newObjects = mockResults.objects.filter((obj) => !prev.some((prevObj) => prevObj.name === obj.name))
//         return [...prev, ...newObjects]
//       })

//       // Add system message about analysis completion
//       const systemMessage = {
//         id: Date.now(),
//         role: "system",
//         content: `Analysis complete! I've detected ${mockResults.objects.length} objects in your image.`,
//         timestamp: new Date().toISOString(),
//         objects: mockResults.objects,
//       }

//       setMessages((prev) => [...prev, systemMessage])

//       // If session context is available, add to current session
//       if (addMessageToCurrentSession) {
//         addMessageToCurrentSession(systemMessage)
//       }
//     } catch (error) {
//       console.error("Analysis error:", error)
//       setAnalysisError(error.message || "Failed to analyze image")
//     } finally {
//       setIsAnalyzing(false)
//     }
//   }

//   const handleFileUpload = async (file) => {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Create a URL for the uploaded image
//       const imageUrl = URL.createObjectURL(file)
//       setImage(imageUrl)

//       // Upload to Cloudinary and analyze
//       await uploadToCloudinary(imageUrl)
//     } catch (err) {
//       console.error("Error processing image:", err)
//       setError("Failed to process image. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleRetry = () => {
//     if (uploadError && image) {
//       // Retry upload
//       uploadToCloudinary(image)
//     } else if (analysisError && cloudinaryUrl) {
//       // Retry analysis with existing Cloudinary URL
//       analyzeImage(cloudinaryUrl)
//     } else {
//       // Reset everything and start over
//       setImage(null)
//       setUploadError(null)
//       setAnalysisError(null)
//       setAnalysisResults(null)
//       setCloudinaryUrl(null)
//       setError(null)
//     }
//   }

//   const sendMessage = (message) => {
//     if (!message.trim() || !wsRef.current) return

//     const newMessage = {
//       id: Date.now(),
//       role: "user",
//       content: message,
//       timestamp: new Date().toISOString(),
//     }

//     setMessages((prev) => [...prev, newMessage])

//     // Send message through WebSocket
//     wsRef.current.send(
//       JSON.stringify({
//         type: "message",
//         threadId,
//         message,
//       }),
//     )
//   }

//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev)
//   }

//   return (
//     <div className={`min-h-screen flex flex-col `}>
     

//       <div className="flex flex-1 overflow-hidden bg-background text-foreground">
      
//         <main>
//           {!image ? (
//             <div className="flex-1 flex flex-col items-center justify-center p-6">
            
//               {captureMode === 'upload' ? (
//                 <ImageUpload onUpload={handleFileUpload} isLoading={isLoading} error={error} />
//               ) : (
//                 <div className="bg-card rounded-xl overflow-hidden shadow-lg w-full max-w-2xl">
//                   <CameraView onCapture={handleImageCapture} capturedImage={null} />
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="w-full md:w-1/2 p-4 overflow-auto">
//                 {/* Image and Analysis Display */}
//                 <div className="bg-card rounded-xl overflow-hidden shadow-lg mb-4">
//                   <div className="relative">
//                     <AnalysisDisplay image={image} results={analysisResults} isLoading={isLoading} />
                    
//                     {/* Loading Overlay */}
//                     {(isUploading || isAnalyzing) && (
//                       <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
//                         <p className="text-lg font-medium">{isUploading ? "Uploading image..." : "Analyzing image..."}</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Error Messages */}
//                   {(uploadError || analysisError) && (
//                     <div className="p-4 bg-destructive/10 border-l-4 border-destructive m-4 rounded-md">
//                       <div className="flex items-center">
//                         <AlertCircle className="h-5 w-5 text-destructive mr-2" />
//                         <p className="text-destructive font-medium">{uploadError || analysisError}</p>
//                       </div>
//                       <Button variant="outline" className="mt-2 w-full" onClick={handleRetry}>
//                         <RefreshCw className="h-4 w-4 mr-2" />
//                         Retry
//                       </Button>
//                     </div>
//                   )}

//                   {/* Action Buttons */}
//                   {image && !analysisResults && !isUploading && !isAnalyzing && !uploadError && !analysisError && (
//                     <div className="p-4 flex justify-center">
//                       <Button onClick={() => uploadToCloudinary(image)} className="px-6 py-2 flex items-center">
//                         <Upload className="h-4 w-4 mr-2" />
//                         Analyze
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Analysis Results */}
//                 {analysisResults && (
//                   <div className="transition-all duration-300 ease-in-out">
//                     <AnalysisResults results={analysisResults} />
//                   </div>
//                 )}
//               </div>
//               <div className="w-full md:w-1/2 p-4 overflow-hidden flex flex-col">
//                 <ConversationInterface
//                   messages={messages}
//                   onSendMessage={sendMessage}
//                   isLoading={isLoading || isUploading || isAnalyzing}
//                   wsConnected={wsConnected}
//                 />
//               </div>
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   )
// }


// import { useState, useEffect, useRef, useCallback } from "react"
// import { AlertCircle, RefreshCw, Upload, Camera } from "lucide-react"
// import ImageUpload from "./ImageUpload"
// import CameraView from "./Camera"
// import AnalysisResults from "./AnalysisResult"
// import { Button } from "../ui/Button"
// import { useTheme } from "../context/theme-context"
// import { useSession } from "../context/session-context"

// export default function ImageAnalyzer() {
//   const { theme } = useTheme()
//   const { addMessageToCurrentSession } = useSession()

//   const [image, setImage] = useState(null)
//   const [captureMode, setCaptureMode] = useState('upload') // 'upload' or 'camera'
//   const [isLoading, setIsLoading] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [threadId, setThreadId] = useState(null)
//   const [analysisResults, setAnalysisResults] = useState(null)
//   const [detectedObjects, setDetectedObjects] = useState([])
//   const [messages, setMessages] = useState([])
//   const [error, setError] = useState(null)
//   const [uploadError, setUploadError] = useState(null)
//   const [analysisError, setAnalysisError] = useState(null)
//   const [cloudinaryUrl, setCloudinaryUrl] = useState(null)
//   const [wsConnected, setWsConnected] = useState(false)
//   const wsRef = useRef(null)

//   // Load thread ID from localStorage on initial render
//   useEffect(() => {
//     const savedThreadId = localStorage.getItem("ai-analyzer-thread-id")
//     if (savedThreadId) {
//       setThreadId(savedThreadId)
//     }
//   }, [])

//   // Connect to WebSocket when threadId changes
//   useEffect(() => {
//     if (!threadId) return

//     // Close existing connection if any
//     if (wsRef.current) {
//       wsRef.current.close()
//     }

//     // In a real app, this would connect to your actual WebSocket server
//     // For demo purposes, we'll simulate WebSocket behavior
//     const mockWs = {
//       send: (data) => {
//         console.log("WebSocket message sent:", data)
//         // Simulate server response after a delay
//         setTimeout(() => {
//           const parsedData = JSON.parse(data)
//           handleServerResponse(parsedData)
//         }, 1000)
//       },
//       close: () => {
//         console.log("WebSocket closed")
//         setWsConnected(false)
//       },
//     }

//     // Simulate connection established
//     setTimeout(() => {
//       setWsConnected(true)
//       // Add initial system message
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now(),
//           role: "system",
//           content: "I'm ready to analyze your image. Ask me questions about what I see!",
//           timestamp: new Date().toISOString(),
//         },
//       ])
//     }, 500)

//     wsRef.current = mockWs

//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close()
//       }
//     }
//   }, [threadId])

//   const handleServerResponse = (data) => {
//     // Simulate AI response based on user message
//     if (data.type === "message") {
//       const responseContent = generateResponse(data.message, analysisResults)

//       const newMessage = {
//         id: Date.now(),
//         role: "assistant",
//         content: responseContent,
//         timestamp: new Date().toISOString(),
//       }

//       setMessages((prev) => [...prev, newMessage])
//     }
//   }

//   const generateResponse = (userMessage, results) => {
//     if (!results) return "I don't see any image to analyze. Please upload or capture an image first."

//     const message = userMessage.toLowerCase()

//     if (message.includes("how many")) {
//       return `I detected ${results.objects.length} objects in the image.`
//     } else if (message.includes("what") && message.includes("see")) {
//       const objectNames = results.objects.map((obj) => obj.name).join(", ")
//       return `I can see: ${objectNames}.`
//     } else if (message.includes("color")) {
//       return "I can identify objects but can't determine specific colors in this demo version."
//     } else {
//       return "I'm analyzing the objects in your image. Feel free to ask specific questions about what you see!"
//     }
//   }

//   const handleImageCapture = useCallback((imageSrc) => {
//     setImage(imageSrc)
//     setUploadError(null)
//     setAnalysisError(null)
//     setAnalysisResults(null)
//     setCloudinaryUrl(null)
//     setError(null)
//   }, [])

//   const toggleCaptureMode = () => {
//     setCaptureMode(current => current === 'upload' ? 'camera' : 'upload')
//     setImage(null)
//     setAnalysisResults(null)
//     setError(null)
//     setUploadError(null)
//     setAnalysisError(null)
//   }

//   const uploadToCloudinary = async (imageUrl) => {
//     if (!imageUrl) return

//     setIsUploading(true)
//     setUploadError(null)

//     try {
//       // Convert base64 image to blob if from camera
//       let blob;
//       if (imageUrl.startsWith('data:')) {
//         const response = await fetch(imageUrl)
//         blob = await response.blob()
//       } else {
//         // If from file upload, it's already a blob URL
//         const response = await fetch(imageUrl)
//         blob = await response.blob()
//       }

//       // In a real app, this would upload to Cloudinary
//       // For demo purposes, we'll simulate a successful upload
      
//       // Create a fake Cloudinary URL
//       const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/${Math.random().toString(36).substring(2, 15)}`
//       setCloudinaryUrl(mockCloudinaryUrl)

//       // Proceed to analyze the image
//       await analyzeImage(mockCloudinaryUrl)
//     } catch (error) {
//       console.error("Upload error:", error)
//       setUploadError(error.message || "Failed to upload image")
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const analyzeImage = async (imageUrl) => {
//     setIsAnalyzing(true)
//     setAnalysisError(null)

//     try {
//       // Generate a fake thread ID if we don't have one
//       const newThreadId = threadId || `thread_${Math.random().toString(36).substring(2, 15)}`
//       setThreadId(newThreadId)
//       localStorage.setItem("ai-analyzer-thread-id", newThreadId)

//       // Simulate API call to analyze image with delay
//       await new Promise((resolve) => setTimeout(resolve, 2000))

//       // Simulate analysis results
//       const mockResults = {
//         objects: [
//           { id: 1, name: "Person", confidence: 0.98, box: { x: 50, y: 30, width: 200, height: 300 } },
//           { id: 2, name: "Chair", confidence: 0.85, box: { x: 300, y: 200, width: 150, height: 120 } },
//           { id: 3, name: "Coffee Cup", confidence: 0.76, box: { x: 400, y: 150, width: 50, height: 60 } },
//           { id: 4, name: "Laptop", confidence: 0.92, box: { x: 200, y: 250, width: 180, height: 120 } },
//         ],
//       }

//       setAnalysisResults(mockResults)

//       // Update detected objects list
//       setDetectedObjects((prev) => {
//         const newObjects = mockResults.objects.filter((obj) => !prev.some((prevObj) => prevObj.name === obj.name))
//         return [...prev, ...newObjects]
//       })

//       // Add system message about analysis completion
//       const systemMessage = {
//         id: Date.now(),
//         role: "system",
//         content: `Analysis complete! I've detected ${mockResults.objects.length} objects in your image.`,
//         timestamp: new Date().toISOString(),
//         objects: mockResults.objects,
//       }

//       setMessages((prev) => [...prev, systemMessage])

//       // If session context is available, add to current session
//       if (addMessageToCurrentSession) {
//         addMessageToCurrentSession(systemMessage)
//       }
//     } catch (error) {
//       console.error("Analysis error:", error)
//       setAnalysisError(error.message || "Failed to analyze image")
//     } finally {
//       setIsAnalyzing(false)
//     }
//   }

//   const handleFileUpload = async (file) => {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Create a URL for the uploaded image
//       const imageUrl = URL.createObjectURL(file)
//       setImage(imageUrl)

//       // Upload to Cloudinary and analyze
//       await uploadToCloudinary(imageUrl)
//     } catch (err) {
//       console.error("Error processing image:", err)
//       setError("Failed to process image. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleRetry = () => {
//     if (uploadError && image) {
//       // Retry upload
//       uploadToCloudinary(image)
//     } else if (analysisError && cloudinaryUrl) {
//       // Retry analysis with existing Cloudinary URL
//       analyzeImage(cloudinaryUrl)
//     } else {
//       // Reset everything and start over
//       setImage(null)
//       setUploadError(null)
//       setAnalysisError(null)
//       setAnalysisResults(null)
//       setCloudinaryUrl(null)
//       setError(null)
//     }
//   }

//   const sendMessage = (message) => {
//     if (!message.trim() || !wsRef.current) return

//     const newMessage = {
//       id: Date.now(),
//       role: "user",
//       content: message,
//       timestamp: new Date().toISOString(),
//     }

//     setMessages((prev) => [...prev, newMessage])

//     // Send message through WebSocket
//     wsRef.current.send(
//       JSON.stringify({
//         type: "message",
//         threadId,
//         message,
//       }),
//     )
//   }

//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev)
//   }

//   return (
//     <div className={`min-h-screen flex flex-col `}>
     

//       <div className="flex flex-1 overflow-hidden bg-background text-foreground">
      
//         <main>
//           {!image ? (
//             <div className="flex-1 flex flex-col items-center justify-center p-6">
            
//               {captureMode === 'upload' ? (
//                 <ImageUpload onUpload={handleFileUpload} isLoading={isLoading} error={error} />
//               ) : (
//                 <div className="bg-card rounded-xl overflow-hidden shadow-lg w-full max-w-2xl">
//                   <CameraView onCapture={handleImageCapture} capturedImage={null} />
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="w-full md:w-1/2 p-4 overflow-auto">
//                 {/* Image and Analysis Display */}
//                 <div className="bg-card rounded-xl overflow-hidden shadow-lg mb-4">
//                   <div className="relative">
//                     <AnalysisDisplay image={image} results={analysisResults} isLoading={isLoading} />
                    
//                     {/* Loading Overlay */}
//                     {(isUploading || isAnalyzing) && (
//                       <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
//                         <p className="text-lg font-medium">{isUploading ? "Uploading image..." : "Analyzing image..."}</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Error Messages */}
//                   {(uploadError || analysisError) && (
//                     <div className="p-4 bg-destructive/10 border-l-4 border-destructive m-4 rounded-md">
//                       <div className="flex items-center">
//                         <AlertCircle className="h-5 w-5 text-destructive mr-2" />
//                         <p className="text-destructive font-medium">{uploadError || analysisError}</p>
//                       </div>
//                       <Button variant="outline" className="mt-2 w-full" onClick={handleRetry}>
//                         <RefreshCw className="h-4 w-4 mr-2" />
//                         Retry
//                       </Button>
//                     </div>
//                   )}

//                   {/* Action Buttons */}
//                   {image && !analysisResults && !isUploading && !isAnalyzing && !uploadError && !analysisError && (
//                     <div className="p-4 flex justify-center">
//                       <Button onClick={() => uploadToCloudinary(image)} className="px-6 py-2 flex items-center">
//                         <Upload className="h-4 w-4 mr-2" />
//                         Analyze
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Analysis Results */}
//                 {analysisResults && (
//                   <div className="transition-all duration-300 ease-in-out">
//                     <AnalysisResults results={analysisResults} />
//                   </div>
//                 )}
//               </div>
//               <div className="w-full md:w-1/2 p-4 overflow-hidden flex flex-col">
//                 <ConversationInterface
//                   messages={messages}
//                   onSendMessage={sendMessage}
//                   isLoading={isLoading || isUploading || isAnalyzing}
//                   wsConnected={wsConnected}
//                 />
//               </div>
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   )
// }

// // "use client"

// import { useState, useCallback } from "react"
// import { AlertCircle, RefreshCw, Upload } from "lucide-react"
// import CameraView from "./Camera"
// import AnalysisResults from "./AnalysisResult"
// import { Button } from "../ui/Button"
// import { useSession } from "../context/session-context"

// export default function ImageAnalyzer() {
//   const { addMessageToCurrentSession } = useSession()
//   const [capturedImage, setCapturedImage] = useState(null)
//   const [isUploading, setIsUploading] = useState(false)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [uploadError, setUploadError] = useState(null)
//   const [analysisError, setAnalysisError] = useState(null)
//   const [analysisResults, setAnalysisResults] = useState(null)
//   const [cloudinaryUrl, setCloudinaryUrl] = useState(null)

//   const handleImageCapture = useCallback((imageSrc) => {
//     setCapturedImage(imageSrc)
//     setUploadError(null)
//     setAnalysisError(null)
//     setAnalysisResults(null)
//     setCloudinaryUrl(null)
//   }, [])

//   const uploadToCloudinary = async () => {
//     if (!capturedImage) return

//     setIsUploading(true)
//     setUploadError(null)

//     try {
//       // Convert base64 image to blob
//       const response = await fetch(capturedImage)
//       const blob = await response.blob()

//       // Create FormData and append the image
//       const formData = new FormData()
//       formData.append("file", blob)
//       formData.append("upload_preset", "visionflow") // Replace with your Cloudinary upload preset

//       // Upload to Cloudinary
//       const cloudinaryResponse = await fetch(
//         `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`, // Replace with your Cloudinary cloud name
//         {
//           method: "POST",
//           body: formData,
//         },
//       )

//       if (!cloudinaryResponse.ok) {
//         throw new Error("Failed to upload image to Cloudinary")
//       }

//       const cloudinaryData = await cloudinaryResponse.json()
//       setCloudinaryUrl(cloudinaryData.secure_url)

//       // Proceed to analyze the image
//       await analyzeImage(cloudinaryData.secure_url)
//     } catch (error) {
//       console.error("Upload error:", error)
//       setUploadError(error.message || "Failed to upload image")
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const analyzeImage = async (imageUrl) => {
//     setIsAnalyzing(true)
//     setAnalysisError(null)

//     try {
//       // In a real app, this would call your backend API that integrates with OpenAI
//       const response = await fetch("/api/analyze", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ imageUrl }),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to analyze image")
//       }

//       const results = await response.json()
//       setAnalysisResults(results)

//       // Add analysis results to the current session
//       const systemMessage = {
//         id: Date.now(),
//         role: "system",
//         content: "Image analyzed successfully. I've detected several objects.",
//         timestamp: new Date().toISOString(),
//         objects: results.objects,
//       }

//       addMessageToCurrentSession(systemMessage)
//     } catch (error) {
//       console.error("Analysis error:", error)
//       setAnalysisError(error.message || "Failed to analyze image")
//     } finally {
//       setIsAnalyzing(false)
//     }
//   }

//   const handleRetry = () => {
//     if (uploadError) {
//       // Retry upload
//       uploadToCloudinary()
//     } else if (analysisError && cloudinaryUrl) {
//       // Retry analysis with existing Cloudinary URL
//       analyzeImage(cloudinaryUrl)
//     } else {
//       // Reset everything and start over
//       setCapturedImage(null)
//       setUploadError(null)
//       setAnalysisError(null)
//       setAnalysisResults(null)
//       setCloudinaryUrl(null)
//     }
//   }

//   return (
//     <div className="flex flex-col space-y-6">
//       <div className="bg-card rounded-xl overflow-hidden shadow-lg">
//         {/* Camera or Captured Image */}
//         <div className="relative">
//           <CameraView onCapture={handleImageCapture} capturedImage={capturedImage} />

//           {/* Loading Overlay */}
//           {(isUploading || isAnalyzing) && (
//             <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
//               <p className="text-lg font-medium">{isUploading ? "Uploading image..." : "Analyzing image..."}</p>
//             </div>
//           )}
//         </div>

//         {/* Error Messages */}
//         {(uploadError || analysisError) && (
//           <div className="p-4 bg-destructive/10 border-l-4 border-destructive m-4 rounded-md">
//             <div className="flex items-center">
//               <AlertCircle className="h-5 w-5 text-destructive mr-2" />
//               <p className="text-destructive font-medium">{uploadError || analysisError}</p>
//             </div>
//             <Button variant="outline" className="mt-2 w-full" onClick={handleRetry}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Retry
//             </Button>
//           </div>
//         )}

//         {/* Action Buttons */}
//         {capturedImage && !analysisResults && !isUploading && !isAnalyzing && !uploadError && !analysisError && (
//           <div className="p-4 flex justify-center">
//             <Button onClick={uploadToCloudinary} className="px-6 py-2 flex items-center">
//               <Upload className="h-4 w-4 mr-2" />
//               Upload & Analyze
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Analysis Results */}
//       {analysisResults && (
//         <div className="transition-all duration-300 ease-in-out">
//           <AnalysisResults results={analysisResults} />
//         </div>
//       )}
//     </div>
//   )
// }

