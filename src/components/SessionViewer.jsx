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
  const webSocket = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (threadId) {
      // Create WebSocket connection
      const ws = new WebSocket('ws://localhost:2009'); // adjust the URL as needed
      
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
      setCurrentSessionId(threadId);
      fetchSessionData(threadId);
      fetchSessionMessages(threadId);
    }
  }, [threadId]);

  const fetchSessionData = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/sessions/full-data/${id}`);
        const data = response.data;
        console.log("Full session data:", data); // Debug log
        
        if (data.success) {
          setSessionData(data);
          setIsSessionActive(data.isActive);
        
        // Check if messages exist and the first message has an imageUrl
        if (data.messages && data.messages.length > 0 && data.messages[0].metadata?.imageUrl) {
            const url = data.messages[0].metadata.imageUrl;
            console.log("Found image URL:", url);
            setImageUrl(url);
          } else {
            console.log("No image URL found in the first message");
            // Check for image in messages first
            const messageWithImage = data.messages?.find(msg => 
              msg.metadata && msg.metadata.imageUrl
            );
            
            if (messageWithImage?.metadata?.imageUrl) {
              console.log("Found image in message metadata:", messageWithImage.metadata.imageUrl);
              setImageUrl(messageWithImage.metadata.imageUrl);
            } else {
              // Then check detections
              const detectionWithImage = data.detections?.find(det => det.imageUrl);
              if (detectionWithImage?.imageUrl) {
                console.log("Found image in detection:", detectionWithImage.imageUrl);
                setImageUrl(detectionWithImage.imageUrl);
              } else {
                // Finally check timeline as last resort
                const timelineItems = data.timeline || [];
                const imageItem = timelineItems.find(item => {
                  if (item.type === 'detection' && item.data?.imageUrl) return true;
                  if (item.type === 'message' && item.data?.metadata?.imageUrl) return true;
                  return false;
                });
                
                if (imageItem) {
                  const foundUrl = imageItem.type === 'detection' 
                    ? imageItem.data.imageUrl 
                    : imageItem.data.metadata.imageUrl;
                  console.log("Found image in timeline:", foundUrl);
                  setImageUrl(foundUrl);
                } else {
                  console.log("No image found in any data structure");
                }
              }
            }
          }
        
          // Extract detected objects more robustly
          let objectsData = [];
          
          // Try different sources for objects data
          if (data.detections) {
            // First priority: detections array at top level
            objectsData = data.detections
              .filter(det => det.objects && Array.isArray(det.objects))
              .flatMap(det => det.objects);
          } else if (data.timeline) {
            // Second priority: detections in timeline
            objectsData = data.timeline
              .filter(item => item.type === 'detection' && item.data?.objects && Array.isArray(item.data.objects))
              .flatMap(item => item.data.objects);
          }
          
          console.log("Extracted objects:", objectsData);
          if (objectsData.length > 0) {
            setDetectedObjects(objectsData);
          }
        }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
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
    
    // Get image URL from the first message's metadata (regardless of role)
    const firstMessageWithImage = currentSessionMessages.find(msg => msg.metadata?.imageUrl);
    const msgImageUrl = firstMessageWithImage?.metadata?.imageUrl;
    
    // If we found an image URL and the state imageUrl is still null, set it
    if (msgImageUrl && !imageUrl) {
      console.log("Setting image URL from message:", msgImageUrl);
      setImageUrl(msgImageUrl);
    }
    
    if (!firstAssistantMessage) return null;
    
    console.log("Current image URL state:", imageUrl);
    console.log("First message with image metadata:", firstMessageWithImage?.metadata);
    
    return {
      description: firstAssistantMessage.content,
      // Pass the objects array from the state
      objects: detectedObjects
    };
  };

  // Handle sending a new message in the continued session
  const handleSendMessage = async (message) => {
    if (!threadId || !message || message.trim() === '') return;
    
    setIsSending(true);
    
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
    if (currentSessionMessages && currentSessionMessages.length > 0 && !imageUrl) {
      // Try to find image URL in messages
      const messageWithImage = currentSessionMessages.find(msg => msg.metadata?.imageUrl);
      if (messageWithImage?.metadata?.imageUrl) {
        console.log("Found image URL in messages update:", messageWithImage.metadata.imageUrl);
        setImageUrl(messageWithImage.metadata.imageUrl);
      }
    }
  }, [currentSessionMessages, imageUrl]);

  return (
    <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-[-60px] overflow-hidden">
      <div className="flex flex-col max-h-[calc(100vh-120px)] overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {console.log("Rendering with imageUrl:", imageUrl)}
          <AnalysisDisplay 
            image={imageUrl} 
            results={getAnalysisResults()} 
            objects={detectedObjects}
            isLoading={isLoading} 
          />
        </div>
      </div>
      <div className="h-full overflow-hidden">
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
  );
}