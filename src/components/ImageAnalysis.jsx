import { useState, useEffect, useRef } from "react"
import axios from "axios"

import ImageUpload from "../components/ImageUpload"
import CameraView from "../components/Camera"
import AnalysisDisplay from "../components/AnalysisDisplay"
import ChatInterface from "./ChatInterface"
import { useTheme } from "../context/theme-context"
import { useCaptureMode } from "../context/CaptureMode-context"
import { useSession } from "../context/session-context" // Import session context

export default function ImageAnalyzer() {
  const { theme } = useTheme()
  const { captureMode } = useCaptureMode()
  const { 
    currentSessionId, 
    setCurrentSessionId, 
    createNewSession, 
    updateSessionObjects,
    newSessionCreated,
    acknowledgeNewSession
  } = useSession() // Use session context
  
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [detectedObjects, setDetectedObjects] = useState([])
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)
  const connectionAttempts = useRef(0)
  const maxRetries = 5

  // Responsive layout management
  const [isMobileView, setIsMobileView] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis') // 'analysis' or 'chat'

  const API_URL = "https://visionflow.up.railway.app/api/v1"
  const WS_URL = "wss://visionflow.up.railway.app" // Adjust based on your WebSocket endpoint

  // Check viewport size and update state
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (newSessionCreated) {
      resetAnalysis();
      acknowledgeNewSession(); // Reset the flag
    }
  }, [newSessionCreated, acknowledgeNewSession]);
  
  // Function to establish WebSocket connection
  const establishWebSocketConnection = () => {
    // Don't attempt connection if we don't have a session ID
    if (!currentSessionId) return null;
    
    console.log(`Establishing WebSocket connection for thread: ${currentSessionId}`);
    
    // Create new WebSocket connection
    const ws = new WebSocket(`${WS_URL}?threadId=${currentSessionId}`);
    
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setWsConnected(true);
      connectionAttempts.current = 0; // Reset connection attempts on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
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
          };
          
          setMessages(prev => [...prev, newMessage]);
          setIsLoading(false);
          
          // On mobile, automatically switch to chat tab when receiving a response
          if (isMobileView) {
            setActiveTab('chat');
          }
        } else if (data.type === 'status') {
          // Handle status updates to show loading state
          console.log("Status update:", data.content);
          // Only show loading if we're in a state that indicates processing
          setIsLoading(['queued', 'in_progress'].includes(data.content));
        } else if (data.type === 'error') {
          setError(data.content || "An error occurred");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        setIsLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
      setError("Connection error. Please refresh the page.");
      setIsLoading(false);
    };

    ws.onclose = (event) => {
      console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      setWsConnected(false);
      
      // Attempt to reconnect after a delay if not intentionally closed
      if (event.code !== 1000) { // 1000 is normal closure
        if (connectionAttempts.current < maxRetries) {
          const delay = Math.min(1000 * (2 ** connectionAttempts.current), 30000); // Exponential backoff with 30s max
          connectionAttempts.current++;
          
          console.log(`Attempting to reconnect (${connectionAttempts.current}/${maxRetries}) in ${delay}ms...`);
          
          setTimeout(() => {
            if (currentSessionId) {
              const newWs = establishWebSocketConnection();
              if (newWs) wsRef.current = newWs;
            }
          }, delay);
        } else {
          console.error(`Maximum reconnection attempts (${maxRetries}) reached.`);
          setError("Connection lost. Please refresh the page to reconnect.");
        }
      }
    };
    
    return ws;
  };
  
  // Connect to WebSocket when currentSessionId changes
  useEffect(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close(1000, "Intentional closure due to session change");
      wsRef.current = null;
    }

    // Don't attempt to connect if we don't have a session ID
    if (!currentSessionId) {
      setWsConnected(false);
      return;
    }
    
    // Establish a new connection
    const ws = establishWebSocketConnection();
    wsRef.current = ws;

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
    };
  }, [currentSessionId]);

  const handleImageSource = async (imageData, errorMessage, previewUrl = null) => {
    setIsLoading(true);
    setError(null);
  
    if (errorMessage) {
      setError(errorMessage);
      setIsLoading(false);
      return;
    }
  
    try {
      // If a preview URL was provided, use it for display
      if (previewUrl) {
        setImage(previewUrl);
      } else {
        // Otherwise, use the image data directly (for camera capture)
        setImage(imageData);
      }
      
      // Create FormData object to send to backend
      const formData = new FormData();
      
      // Convert base64/dataURL to blob if necessary (for camera captures)
      if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        const blob = await fetch(imageData).then(res => res.blob());
        formData.append('image', blob, 'camera_capture.jpg');
      } else if (imageData instanceof Blob || imageData instanceof File) {
        // If imageData is already a Blob or File object (from upload)
        formData.append('image', imageData);
      }
      
      // Check if we have an existing session, if not create one
      let threadIdToUse = currentSessionId;
      if (!threadIdToUse) {
        // Create a new session through the session context
        threadIdToUse = await createNewSession();
        if (!threadIdToUse) {
          throw new Error("Failed to create a new session");
        }
      }
      
      // Add thread ID to the form data
      formData.append('threadID', threadIdToUse);
      
      // Send the form data to your backend
      const response = await axios.post(`${API_URL}/analyse/analysingImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
  
      // Log the complete response to see its structure
      console.log("Backend response:", response.data);
  
      // Handle response based on backend format
      const data = response.data;
      
      if (data.threadId && data.threadId !== currentSessionId) {
        setCurrentSessionId(data.threadId);
      }
      
      if (data.url) {
        setImageUrl(data.url);
      }
      
      // Process any backend analysis data for the analysis display
      if (data.data && Array.isArray(data.data)) {
        // Find the assistant message that contains the analysis
        const assistantMessages = data.data.filter(msg => msg.role === "assistant");
        if (assistantMessages.length > 0) {
          const analysisMessage = assistantMessages[0];
          
          // Set the analysis results with the assistant's message
          // No need to modify the content as ReactMarkdown will handle markdown formatting
          setAnalysisResults({
            description: analysisMessage.content, // This can now be markdown
            timestamp: new Date(analysisMessage.created_at * 1000).toISOString()
          });
          
          // Extract objects from the message if needed
          const extractedObjects = extractObjectsFromMessage(analysisMessage.content);
          if (extractedObjects.length > 0) {
            setDetectedObjects(extractedObjects);
            
            // Update session context with detected objects
            updateSessionObjects(threadIdToUse, extractedObjects);
          }
        }
      }
      
      // Add initial welcome messages to the chat interface
      const currentTime = new Date().toISOString();
      const welcomeMessages = [
        {
          id: Date.now(),
          role: "assistant",
          content: "I'm ready to analyze your image. Ask me questions about what I see!",
          timestamp: currentTime
        },
      ];
      
      setMessages(welcomeMessages);
      
      // Ensure WebSocket connection is established after successful image analysis
      if (!wsConnected && currentSessionId) {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.log("Establishing WebSocket connection after image analysis");
          const ws = establishWebSocketConnection();
          if (ws) wsRef.current = ws;
        }
      }
      
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err.response?.data?.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract objects from the message text
  const extractObjectsFromMessage = (messageText) => {
    const objects = [];
    let objectId = 1;
    
    // For UML diagrams, we can extract the classes/components mentioned
    const classRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = classRegex.exec(messageText)) !== null) {
      const className = match[1].trim();
      
      // Skip if it's not actually a class name (e.g., "Purpose", "Attributes", etc.)
      const skipWords = ["Purpose", "Attributes", "Methods", "Attributes and Methods"];
      if (!skipWords.includes(className) && !objects.some(obj => obj.name === className)) {
        objects.push({
          id: objectId++,
          name: className,
          type: "Class/Component",
          confidence: 1.0 // High confidence since these are explicitly mentioned
        });
      }
    }
    
    return objects;
  };

  const sendMessage = async (message) => {
    if (!message.trim() || !currentSessionId) return;

    // Create new message locally
    const newMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Add message to local state
    setMessages(prev => [...prev, newMessage]);
    
    // Set loading state while waiting for response
    setIsLoading(true);
    
    // On mobile, switch to chat tab when sending a message
    if (isMobileView) {
      setActiveTab('chat');
    }
    
    try {
      // Check if WebSocket is connected first
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        // Try to establish connection if it doesn't exist or isn't open
        console.log("WebSocket not connected. Attempting to establish connection...");
        const ws = establishWebSocketConnection();
        
        if (!ws) {
          throw new Error("Failed to establish WebSocket connection");
        }
        
        wsRef.current = ws;
        
        // Wait for connection to open with timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("WebSocket connection timeout"));
          }, 5000);
          
          ws.addEventListener('open', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
          
          ws.addEventListener('error', () => {
            clearTimeout(timeout);
            reject(new Error("WebSocket connection failed"));
          }, { once: true });
        });
      }
      
      // Now we can be sure the connection is open
      wsRef.current.send(JSON.stringify({
        threadId: currentSessionId,
        message: message,
        messageId: newMessage.id
      }));

      console.log('Message sent to WebSocket:', message);
      
      // Response will be handled by the WebSocket onmessage handler
      
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setIsLoading(false);
      
      // Remove the message from the UI if it failed to send
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  // Reset the analysis to capture a new image
  const resetAnalysis = () => {
    setImage(null);
    setImageUrl(null);
    setAnalysisResults(null);
    setDetectedObjects([]);
    setMessages([]); // Clear messages when resetting
    setError(null);
    setActiveTab('analysis'); // Reset to analysis tab
    // Keep threadId for conversation continuity
  };

  // Toggle between tabs on mobile
  const toggleTab = (tab) => {
    console.log('Switching to tab:', tab);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {!image ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6">
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
            {/* Mobile Tab Navigation */}
            {isMobileView && (
              <div className="flex w-full border-b sticky top-0  ">
                <button 
                  className={`flex-1 py-2 px-3 text-center font-medium ${activeTab === 'analysis' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
                  onClick={() => toggleTab('analysis')}
                >
                  Analysis
                </button>
                <button 
                  className={`flex-1 py-2 px-3 text-center font-medium ${activeTab === 'chat' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
                  onClick={() => toggleTab('chat')}
                >
                  Chat
                </button>
              </div>
            )}
            
            {/* Main Content Container */}
            <div className={`flex-1 ${isMobileView ? 'flex flex-col  mt-12' : 'grid grid-cols-1 md:grid-cols-2 gap-4'} p-2 sm:p-4`}>
              {/* Analysis Display */}
              <div 
                className={`${isMobileView ? (activeTab === 'analysis' ? 'flex flex-col flex-1' : 'hidden') : 'flex flex-col'} overflow-auto`}
              >
                <AnalysisDisplay 
                  image={imageUrl || image} 
                  results={analysisResults} 
                  objects={detectedObjects}
                  isLoading={isLoading} 
                />
                
                {/* Capture New Image button */}
                <div className="mt-4 mb-2">
                  <button 
                    onClick={resetAnalysis}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
                  >
                    Capture New Image
                  </button>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div 
                className={`${isMobileView ? (activeTab === 'chat' ? 'flex flex-col flex-1' : 'hidden') : 'flex flex-col'} ${isMobileView ? 'max-h-[85vh]' : 'h-[calc(100vh-200px)]'} md:h-auto overflow-hidden`}
              >
                <ChatInterface
                  messages={messages}
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  wsConnected={wsConnected}
                  connectionError={!wsConnected && currentSessionId ? "WebSocket disconnected. Trying to reconnect..." : null}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}