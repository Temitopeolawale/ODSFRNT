import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { SetAuthHeader, getToken } from '../Service/auth'; // Update this path to match your project structure

// Create the context
const SessionContext = createContext(null);

// Session provider component
export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSessionCreated, setNewSessionCreated] = useState(false);
  const [currentSessionMessages, setCurrentSessionMessages] = useState([]);

  const API_URL = "http://localhost:2009/api/v1";
  
  // Load active session from localStorage on initial render
  useEffect(() => {
    // Set the auth header with the current token
    SetAuthHeader();
    
    const savedThreadId = localStorage.getItem("ai-analyzer-thread-id");
    if (savedThreadId) {
      setCurrentSessionId(savedThreadId);
    }
    
    // Fetch all sessions
    fetchSessions();
  }, []);
  
  // Save current session ID to localStorage whenever it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem("ai-analyzer-thread-id", currentSessionId);
      // Fetch the messages for this session
      fetchSessionMessages(currentSessionId);
    } else {
      localStorage.removeItem("ai-analyzer-thread-id");
      setCurrentSessionMessages([]);
    }
  }, [currentSessionId]);

  // Fetch all sessions from the backend
  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/session/list`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success && Array.isArray(response.data.sessions)) {
        // Map backend sessions to frontend format
        const formattedSessions = response.data.sessions.map(session => ({
          id: session.threadId,
          timestamp: new Date(session.created_at).toISOString(),
          isActive: session.isActive,
          objects: [] // Initialize with empty objects array
        }));
        
        setSessions(formattedSessions);
        
        // If we have a currentSessionId but it's not in the fetched sessions,
        // update to use the first available session or null
        if (currentSessionId && !formattedSessions.some(session => session.id === currentSessionId)) {
          if (formattedSessions.length > 0) {
            setCurrentSessionId(formattedSessions[0].id);
          } else {
            setCurrentSessionId(null);
          }
        } else if (!currentSessionId && formattedSessions.length > 0) {
          // If we don't have a current session but there are sessions available, use the first one
          setCurrentSessionId(formattedSessions[0].id);
        }
      } else {
        // Handle empty or invalid response
        setSessions([]);
        setCurrentSessionId(null);
        console.warn("Invalid sessions response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError(error.response?.data?.message || error.message);
      setSessions([]); // Reset sessions on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a specific session
  const fetchSessionMessages = async (sessionId) => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/session/messages/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success) {
        // Transform the message format to match your frontend expectations
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.messageId,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at).toISOString(),
          metadata: msg.metadata || {}
        }));
        
        setCurrentSessionMessages(formattedMessages);
      } else {
        setCurrentSessionMessages([]);
        setError(response.data?.message || "Failed to fetch session messages");
      }
    } catch (error) {
      console.error("Error fetching session messages:", error);
      setError(error.response?.data?.message || error.message);
      setCurrentSessionMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new session via API
  const createNewSession = async () => {
    setIsLoading(true);
    setError(null);
    try {

     
      const response = await axios.post(`${API_URL}/session/start`, {}, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success) {
        const newSession = {
          id: response.data.threadId,
          timestamp: new Date(response.data.created_at).toISOString(),
          isActive: true,
          objects: []
        };
        
        setSessions(prevSessions => [newSession, ...prevSessions]);
        setCurrentSessionId(newSession.id);
        
        // Update localStorage with the new threadId
        localStorage.setItem("ai-analyzer-thread-id", newSession.id);
        
        // Clear the current session messages
        setCurrentSessionMessages([]);
        
        // Set flag to indicate a new session was created
        setNewSessionCreated(true);
        
        return newSession.id; // Return the new session ID for use in image analysis
      } else {
        throw new Error(response.data?.message || "Failed to create session");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error("Error creating session:", error);
      if (error.response?.status === 409) {
        // Refresh the sessions list to get the active one
        await fetchSessions();
        // You could also add specific handling here based on the error message
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
          return sessions[0].id;
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Method to acknowledge that the new session state has been handled
  const acknowledgeNewSession = () => {
    setNewSessionCreated(false);
  };

  // End current session
  const endSession = async (sessionId) => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/session/end`, {
        threadId: sessionId
      }, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success) {
        // Update the session status in the local state
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === sessionId 
              ? { ...session, isActive: false } 
              : session
          )
        );
        
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to end session");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error("Error ending session:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a session via API
  const deleteSession = async (id) => {
    if (!id) {
      console.error("Attempted to delete session with invalid ID");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${API_URL}/session/delete`, {
        data: { threadId: id },
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success) {
        const updatedSessions = sessions.filter(session => session.id !== id);
        setSessions(updatedSessions);
        
        // If we deleted the current session, switch to another one
        if (id === currentSessionId) {
          if (updatedSessions.length > 0) {
            setCurrentSessionId(updatedSessions[0].id);
          } else {
            setCurrentSessionId(null);
            localStorage.removeItem("ai-analyzer-thread-id");
          }
        }
      } else {
        throw new Error(response.data?.message || "Failed to delete session");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error("Error deleting session:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update session with detected objects
  const updateSessionWithObjects = (sessionId, objects) => {
    if (!sessionId) return;
    
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session && session.id === sessionId 
          ? { ...session, objects } 
          : session
      )
    );
  };

  // Add a new message to the current session
  const addMessage = (message) => {
    if (!currentSessionId) return;
    
    setCurrentSessionMessages(prev => [...prev, message]);
  };

  // Save detection data to a thread
  const saveDetectionData = async (sessionId, detectionData) => {
    if (!sessionId || !detectionData) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/session/save-detection`, {
        threadId: sessionId,
        detectionData
      }, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success) {
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to save detection data");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error("Error saving detection data:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get full session data including messages and detections
  const getFullSessionData = async (sessionId) => {
    if (!sessionId) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/session/full-data/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });

      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to get full session data");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error("Error getting full session data:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the value object that will be provided to consumers
  const contextValue = {
    sessions,
    currentSessionId, 
    setCurrentSessionId,
    deleteSession,
    endSession,
    createNewSession,
    newSessionCreated,
    acknowledgeNewSession,
    isLoading,
    error,
    getCurrentSession: () => sessions.find(s => s && s.id === currentSessionId) || null,
    updateSessionObjects: updateSessionWithObjects,
    refreshSessions: fetchSessions,
    currentSessionMessages,
    setCurrentSessionMessages,
    addMessage,
    fetchSessionMessages,
    saveDetectionData,
    getFullSessionData
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook to use the session context
export function useSession() {
  const context = useContext(SessionContext);
  if (context === null || context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
// "use client"

// import { createContext, useContext, useState, useEffect } from "react"

// const SessionContext = createContext({
//   sessions: [],
//   currentSessionId: null,
//   currentSession: null,
//   startNewSession: () => {},
//   setCurrentSessionId: () => {},
//   addMessageToCurrentSession: () => {},
//   deleteSession: () => {},
// })

// export function SessionProvider({ children }) {
//   const [sessions, setSessions] = useState([])
//   const [currentSessionId, setCurrentSessionId] = useState(null)

//   useEffect(() => {
//     // Load sessions from localStorage
//     const savedSessions = localStorage.getItem("visionflow-sessions")
//     if (savedSessions) {
//       const parsedSessions = JSON.parse(savedSessions)
//       setSessions(parsedSessions)

//       // Set current session to the most recent one
//       if (parsedSessions.length > 0) {
//         setCurrentSessionId(parsedSessions[0].id)
//       }
//     } else {
//       // Create initial session if none exists
//       const initialSession = createNewSession()
//       setSessions([initialSession])
//       setCurrentSessionId(initialSession.id)
//     }
//   }, [])

//   useEffect(() => {
//     // Save sessions to localStorage whenever they change
//     if (sessions.length > 0) {
//       localStorage.setItem("visionflow-sessions", JSON.stringify(sessions))
//     }
//   }, [sessions])

//   const createNewSession = () => {
//     return {
//       id: `session_${Date.now()}`,
//       timestamp: new Date().toISOString(),
//       messages: [],
//       objects: [],
//     }
//   }

//   const startNewSession = () => {
//     const newSession = createNewSession()
//     setSessions((prevSessions) => [newSession, ...prevSessions])
//     setCurrentSessionId(newSession.id)
//   }

//   const addMessageToCurrentSession = (message) => {
//     if (!currentSessionId) return

//     setSessions((prevSessions) =>
//       prevSessions.map((session) =>
//         session.id === currentSessionId
//           ? {
//               ...session,
//               messages: [...session.messages, message],
//               // If it's a system message with analysis results, store objects
//               ...(message.objects && { objects: message.objects }),
//             }
//           : session,
//       ),
//     )
//   }

//   const deleteSession = (sessionId) => {
//     setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId))

//     // If we're deleting the current session, switch to the first available one
//     if (sessionId === currentSessionId) {
//       setSessions((prevSessions) => {
//         if (prevSessions.length > 0) {
//           setCurrentSessionId(prevSessions[0].id)
//         } else {
//           const newSession = createNewSession()
//           setSessions([newSession])
//           setCurrentSessionId(newSession.id)
//         }
//         return prevSessions
//       })
//     }
//   }

//   const currentSession = sessions.find((session) => session.id === currentSessionId) || null

//   return (
//     <SessionContext.Provider
//       value={{
//         sessions,
//         currentSessionId,
//         currentSession,
//         startNewSession,
//         setCurrentSessionId,
//         addMessageToCurrentSession,
//         deleteSession,
//       }}
//     >
//       {children}
//     </SessionContext.Provider>
//   )
// }

// export const useSession = () => useContext(SessionContext)

