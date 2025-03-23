import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../context/session-context";
import AnalysisDisplay from "../components/AnalysisDisplay";
import ChatInterface from "./ChatInterface";
import axios from "axios";

export default function SessionViewer() {
  const API_URL = "https://visionflow.up.railway.app/api/v1"
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { 
    getCurrentSession, 
    currentSessionMessages, 
    fetchSessionMessages,
    isLoading, 
    error,
    setCurrentSessionId,
    sendMessage
  } = useSession();

  const [sessionData, setSessionData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'chat'
  const webSocket = useRef(null);
  
  // This ref tracks whether we've already set an image URL for the current session
  const hasSetImageUrl = useRef(false);

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

  // Initialize WebSocket connection
  useEffect(() => {
    if (threadId) {
      // Create WebSocket connection
      const ws = new WebSocket('wss://visionflow.up.railway.app'); // adjust the URL as needed
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        
        // Load the session data
        ws.send(JSON.stringify({
          type: 'load_session',
          threadId
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'session_data') {
          // Update session active state
          setIsSessionActive(data.content.isActive);
          
          // Refresh session messages
          fetchSessionMessages(threadId);
        } else if (data.type === 'response') {
          // Refresh session messages after receiving a new response
          fetchSessionMessages(threadId);
          setIsSending(false);
          
          // On mobile, automatically switch to chat tab when receiving a response
          if (isMobileView) {
            setActiveTab('chat');
          }
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.content);
          setIsSending(false);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
      };
      
      webSocket.current = ws;
      
      return () => {
        // Close WebSocket when component unmounts
        if (webSocket.current) {
          webSocket.current.close();
        }
      };
    }
  }, [threadId]);

  // Fetch session data when component mounts or threadId changes
  useEffect(() => {
    if (threadId) {
      // Reset state when switching sessions
      setImageUrl(null);
      setDetectedObjects([]);
      setSessionData(null);
      hasSetImageUrl.current = false; // Reset our tracking ref
      
      setCurrentSessionId(threadId);
      fetchSessionData(threadId);
      fetchSessionMessages(threadId);
    }
  }, [threadId]);

  // Log whenever imageUrl changes
  useEffect(() => {
    console.log("Image URL state changed:", imageUrl);
  }, [imageUrl]);

  const fetchSessionData = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/sessions/full-data/${id}`);
      const data = response.data;
      console.log("Full session data:", data); // Debug log
      
      if (data.success) {
        setSessionData(data);
        setIsSessionActive(data.isActive);
        
        // Reset our tracking ref when getting new session data
        hasSetImageUrl.current = false;
        
        // Set image URL only if we haven't already set it for this session
        if (!hasSetImageUrl.current) {
          // Check in session data first
          let foundUrl = findImageUrlInData(data);
          
          if (foundUrl) {
            console.log("Setting image URL from session data:", foundUrl);
            setImageUrl(foundUrl);
            hasSetImageUrl.current = true;
          }
        }
        
        // Extract detected objects
        const extractedObjects = extractDetectedObjects(data);
        if (extractedObjects.length > 0) {
          setDetectedObjects(extractedObjects);
        }
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };
  
  // Comprehensive function to find image URL in data
  const findImageUrlInData = (data) => {
    // Define locations to look for the image URL in order of priority
    const locations = [
      // 1. Check first user message metadata (highest priority)
      () => {
        if (data.messages && data.messages.length > 0) {
          const firstUserMessage = data.messages.find(msg => msg.role === 'user');
          if (firstUserMessage?.metadata?.imageUrl) {
            return { 
              url: firstUserMessage.metadata.imageUrl, 
              source: 'first user message metadata'
            };
          }
        }
        return null;
      },
      
      // 2. Check first message metadata regardless of role
      () => {
        if (data.messages && data.messages.length > 0 && data.messages[0].metadata?.imageUrl) {
          return { 
            url: data.messages[0].metadata.imageUrl, 
            source: 'first message metadata'
          };
        }
        return null;
      },
      
      // 3. Check all messages for image URL
      () => {
        if (data.messages && data.messages.length > 0) {
          const messageWithImage = data.messages.find(msg => msg.metadata?.imageUrl);
          if (messageWithImage?.metadata?.imageUrl) {
            return { 
              url: messageWithImage.metadata.imageUrl,
              source: 'message metadata'
            };
          }
        }
        return null;
      },
      
      // 4. Check detections array
      () => {
        if (data.detections && data.detections.length > 0) {
          // Sort detections by timestamp if available to get the most recent first
          const sortedDetections = [...data.detections].sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return 0;
          });
          
          const detectionWithImage = sortedDetections.find(det => det.imageUrl);
          if (detectionWithImage?.imageUrl) {
            return { 
              url: detectionWithImage.imageUrl,
              source: 'detections array'
            };
          }
        }
        return null;
      },
      
      // 5. Check timeline
      () => {
        if (data.timeline && data.timeline.length > 0) {
          // Sort timeline by timestamp if available
          const sortedTimeline = [...data.timeline].sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return 0;
          });
          
          for (const item of sortedTimeline) {
            if (item.type === 'detection' && item.data?.imageUrl) {
              return { 
                url: item.data.imageUrl,
                source: 'timeline detection'
              };
            }
            if (item.type === 'message' && item.data?.metadata?.imageUrl) {
              return { 
                url: item.data.metadata.imageUrl,
                source: 'timeline message'
              };
            }
          }
        }
        return null;
      }
    ];
    
    // Try each location in order until we find an image URL
    for (const findFn of locations) {
      const result = findFn();
      if (result) {
        console.log(`Found image URL in ${result.source}:`, result.url);
        return result.url;
      }
    }
    
    console.log("No image URL found in any data structure");
    return null;
  };

  // Function to extract detected objects from various data structures
  const extractDetectedObjects = (data) => {
    let objectsData = [];
    
    // Try different sources in order of priority
    
    // 1. Check detections array
    if (data.detections && data.detections.length > 0) {
      const detectionWithObjects = data.detections.find(det => 
        det.objects && Array.isArray(det.objects) && det.objects.length > 0
      );
      
      if (detectionWithObjects?.objects) {
        objectsData = detectionWithObjects.objects;
        console.log("Extracted objects from detections:", objectsData);
        return objectsData;
      }
      
      // If no single detection has objects, try to combine objects from all detections
      const combinedObjects = data.detections
        .filter(det => det.objects && Array.isArray(det.objects))
        .flatMap(det => det.objects);
      
      if (combinedObjects.length > 0) {
        console.log("Extracted combined objects from all detections:", combinedObjects);
        return combinedObjects;
      }
    }
    
    // 2. Check timeline for detections
    if (data.timeline && data.timeline.length > 0) {
      const detectionItem = data.timeline.find(item => 
        item.type === 'detection' && 
        item.data?.objects && 
        Array.isArray(item.data.objects) &&
        item.data.objects.length > 0
      );
      
      if (detectionItem?.data?.objects) {
        objectsData = detectionItem.data.objects;
        console.log("Extracted objects from timeline detection:", objectsData);
        return objectsData;
      }
      
      // Combine objects from all timeline detections
      const combinedObjects = data.timeline
        .filter(item => 
          item.type === 'detection' && 
          item.data?.objects && 
          Array.isArray(item.data.objects)
        )
        .flatMap(item => item.data.objects);
      
      if (combinedObjects.length > 0) {
        console.log("Extracted combined objects from timeline detections:", combinedObjects);
        return combinedObjects;
      }
    }
    
    // 3. Check message metadata as last resort
    if (data.messages && data.messages.length > 0) {
      const messageWithObjects = data.messages.find(msg => 
        msg.metadata?.detectedObjects && 
        Array.isArray(msg.metadata.detectedObjects) &&
        msg.metadata.detectedObjects.length > 0
      );
      
      if (messageWithObjects?.metadata?.detectedObjects) {
        objectsData = messageWithObjects.metadata.detectedObjects;
        console.log("Extracted objects from message metadata:", objectsData);
        return objectsData;
      }
    }
    
    console.log("No objects found in any data structure");
    return [];
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/');
  };

  // Find the analysis results from the assistant's first message
  const getAnalysisResults = () => {
    if (!currentSessionMessages || currentSessionMessages.length === 0) return null;
    
    // Find the first assistant message for the description
    const firstAssistantMessage = currentSessionMessages.find(msg => msg.role === 'assistant');
    
    if (!firstAssistantMessage) return null;
    
    return {
      description: firstAssistantMessage.content,
      objects: detectedObjects
    };
  };

  // Handle sending a new message in the continued session
  const handleSendMessage = async (message) => {
    if (!threadId || !message || message.trim() === '') return;
    
    setIsSending(true);
    
    // On mobile, switch to chat tab when sending a message
    if (isMobileView) {
      setActiveTab('chat');
    }
    
    // Check if WebSocket is connected
    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      // Send via WebSocket
      webSocket.current.send(JSON.stringify({
        type: 'question',
        threadId: threadId,
        message: message
      }));
    } else {
      // Fallback to HTTP if WebSocket is not available
      try {
        await sendMessage({
          sessionId: threadId,
          content: message,
          role: 'user'
        });
        
        // Refresh messages after sending
        await fetchSessionMessages(threadId);
        setIsSending(false);
      } catch (error) {
        console.error("Error sending message:", error);
        setIsSending(false);
      }
    }
  };

  // Update useEffect to check for image URL when messages change
  useEffect(() => {
    if (currentSessionMessages && currentSessionMessages.length > 0 && !hasSetImageUrl.current) {
      // Priority 1: First user message with image
      const firstUserMessage = currentSessionMessages.find(msg => msg.role === 'user');
      if (firstUserMessage?.metadata?.imageUrl) {
        console.log("Setting image from first user message:", firstUserMessage.metadata.imageUrl);
        setImageUrl(firstUserMessage.metadata.imageUrl);
        hasSetImageUrl.current = true;
        return;
      }
      
      // Priority 2: First message in the array
      if (currentSessionMessages[0]?.metadata?.imageUrl) {
        console.log("Setting image from first message:", currentSessionMessages[0].metadata.imageUrl);
        setImageUrl(currentSessionMessages[0].metadata.imageUrl);
        hasSetImageUrl.current = true;
        return;
      }
      
      // Priority 3: Any message with an image
      for (const message of currentSessionMessages) {
        if (message.metadata?.imageUrl) {
          console.log("Setting image from message metadata:", message.metadata.imageUrl);
          setImageUrl(message.metadata.imageUrl);
          hasSetImageUrl.current = true;
          return;
        }
      }
    }
  }, [currentSessionMessages]);

  // Toggle between tabs on mobile
  const toggleTab = (tab) => {
    console.log('Switching to tab:', tab);  // Add this for debugging
    setActiveTab(tab);
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col h-full overflow-hidden">
      {/* Mobile Tab Navigation */}
      {isMobileView && (
        <div className="flex w-full border-b">
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
      
      {/* Main Content Container - Using margin-top to pull it up closer to tabs */}
      <div className="flex-1 flex flex-col h-[calc(100vh-160px)] overflow-hidden mt-[-20px]">
        {/* Content with adjusted positioning */}
        <div className={`flex-1 ${isMobileView ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'} overflow-hidden`}>
          {/* Analysis Display */}
          <div 
            className={`relative flex flex-col ${isMobileView ? (activeTab === 'analysis' ? 'flex' : 'hidden') : 'flex-1'} overflow-hidden`}
          >
            <AnalysisDisplay 
              image={imageUrl} 
              results={getAnalysisResults()} 
              objects={detectedObjects}
              isLoading={isLoading} 
            />
          </div>
          
          {/* Chat Interface */}
          <div 
            className={`relative ${isMobileView ? (activeTab === 'chat' ? 'flex flex-col flex-1' : 'hidden') : 'flex flex-col flex-1'} overflow-hidden`}
          >
            <ChatInterface
              messages={currentSessionMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading || isSending}
              wsConnected={wsConnected}
              readOnly={false}
              sessionActive={isSessionActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}