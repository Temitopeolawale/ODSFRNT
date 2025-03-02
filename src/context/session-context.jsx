"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid" // Make sure to install this package

// Create the context
const SessionContext = createContext(null)

// Session provider component
export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)

  // Load sessions on initial render
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem("sessions")
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions)
        setSessions(parsedSessions)
        
        // Set current session to the most recent one if none is selected
        if (!currentSessionId && parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    }
  }, [])

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("sessions", JSON.stringify(sessions))
    }
  }, [sessions])

  // Create a new session
  const createNewSession = () => {
    console.log("Creating new session") // Debugging log
    const newSession = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      objects: []
    }
    
    setSessions([newSession, ...sessions])
    setCurrentSessionId(newSession.id)
  }

  // Delete a session
  const deleteSession = (id) => {
    const updatedSessions = sessions.filter(session => session.id !== id)
    setSessions(updatedSessions)
    
    // If we deleted the current session, switch to another one
    if (id === currentSessionId && updatedSessions.length > 0) {
      setCurrentSessionId(updatedSessions[0].id)
    } else if (updatedSessions.length === 0) {
      setCurrentSessionId(null)
    }
  }

  // Create the value object that will be provided to consumers
  const contextValue = {
    sessions,
    currentSessionId, 
    setCurrentSessionId,
    deleteSession,
    createNewSession,
    getCurrentSession: () => sessions.find(s => s.id === currentSessionId) || null,
    updateSessionObjects: (sessionId, objects) => {
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, objects } 
            : session
        )
      )
    }
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

// Custom hook to use the session context
export function useSession() {
  const context = useContext(SessionContext)
  if (context === null || context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
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

