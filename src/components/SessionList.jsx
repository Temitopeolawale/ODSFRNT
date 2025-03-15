import { useSession } from "../context/session-context"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Plus, Archive, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SessionsList({ collapsed }) {
  const { 
    sessions, 
    setCurrentSessionId, 
    currentSessionId, 
    deleteSession, 
    createNewSession, 
    isLoading,
    error,
    endSession,
    newSessionCreated,
    acknowledgeNewSession,
    refreshSessions
  } = useSession()
  
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState({})
  const [isEnding, setIsEnding] = useState({})

  const handleSessionClick = (id) => {
    if (id) {
      // Instead of just setting the current session ID, navigate to the session page
      navigate(`/sessions/${id}`);
      
      // Still set the current session ID for context
      setCurrentSessionId(id)
      
      // Acknowledge if this was a new session being selected
      if (newSessionCreated) {
        acknowledgeNewSession()
      }
    }
  }

  const handleViewSession = (e, id) => {
    e.stopPropagation();
    navigate(`/sessions/${id}`);
  }

  const handleDeleteSession = async (e, id) => {
    if (!id) return
    
    e.stopPropagation()
    setIsDeleting(prev => ({ ...prev, [id]: true }))
    
    try {
      await deleteSession(id)
      // After deletion, refresh the sessions list
      refreshSessions()
    } catch (error) {
      console.error("Failed to delete session:", error)
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleEndSession = async (e, id) => {
    if (!id) return
    
    e.stopPropagation()
    setIsEnding(prev => ({ ...prev, [id]: true }))
    
    try {
      await endSession(id)
      // After ending, refresh the sessions list
      refreshSessions()
    } catch (error) {
      console.error("Failed to end session:", error)
    } finally {
      setIsEnding(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleNewSession = async () => {
    try {
      await createNewSession()
    } catch (error) {
      console.error("Failed to create new session:", error)
    }
  }

  // Helper function to format the timestamp safely
  const formatSessionTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    // Check if the timestamp is valid
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    
    // Check if the date is way off (like 55 years ago)
    const now = new Date();
    const yearsDiff = now.getFullYear() - date.getFullYear();
    
    if (yearsDiff > 1) {
      // If the date is more than a year off, it's likely invalid
      return 'Just now';
    }
    
    // Otherwise use formatDistanceToNow
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Just now';
    }
  };

  // Create the header with new session button - this will be used in both cases
  const headerWithNewButton = (
    <div className="flex justify-between items-center">
      <h3 className={`text-sm font-medium px-2 py-1 ${collapsed ? "sr-only" : ""}`}>Sessions</h3>
      <button 
        onClick={handleNewSession}
        className="rounded-md p-1 hover:bg-muted transition-colors"
        aria-label="Create new session"
        disabled={isLoading}
      >
        <Plus size={collapsed ? 20 : 16} />
      </button>
    </div>
  );

  // Safety check to handle empty sessions array
  if (!sessions || sessions.length === 0) {
    return (
      <div className="px-2">
        {headerWithNewButton}
        <div className="text-center py-4 text-sm text-muted-foreground">
          {isLoading ? "Loading sessions..." : "No sessions available"}
        </div>
        {error && (
          <div className="text-center py-2 text-sm text-destructive">
            Error: {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-2">
      {headerWithNewButton}
      {error && (
        <div className="text-center py-2 text-sm text-destructive">
          Error: {error}
        </div>
      )}
      <div className="space-y-1 mt-1">
        {sessions.map((session) => {
          // Skip rendering if session is invalid
          if (!session || typeof session !== 'object') return null
          
          const sessionId = session.id || ''
          const isCurrentSession = currentSessionId === sessionId
          const isActive = session.isActive !== false // Default to true if not specified
          const isJustCreated = newSessionCreated && isCurrentSession
          
          return (
            <div
              key={sessionId || `session-${Math.random()}`}
              onClick={() => handleSessionClick(sessionId)}
              className={`
                cursor-pointer rounded-md transition-colors
                ${isCurrentSession ? "bg-muted" : "hover:bg-muted/50"}
                ${isJustCreated ? "ring-1 ring-primary" : ""}
                ${collapsed ? "p-2" : "p-2"}
              `}
            >
              {collapsed ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    {session.objects?.length || 0}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium truncate flex items-center gap-1">
                      {sessionId ? `Session ${sessionId.slice(0, 6)}` : 'Unknown Session'} 
                      {!isActive && (
                        <span className="text-xs bg-muted-foreground/20 px-1 rounded text-muted-foreground">
                          archived
                        </span>
                      )}
                      {isJustCreated && (
                        <span className="text-xs bg-primary/20 px-1 rounded text-primary">
                          new
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isJustCreated ? 'Just now' : formatSessionTime(session.timestamp)}
                    </div>
                    {session.objects && (
                      <div className="text-xs text-muted-foreground mt-1">{session.objects.length} objects detected</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isActive && (
                      <button
                        onClick={(e) => handleEndSession(e, sessionId)}
                        className="p-1 rounded-full hover:bg-background transition-colors"
                        disabled={isEnding[sessionId] || isLoading}
                        aria-label="Archive session"
                      >
                        <Archive size={16} className={isEnding[sessionId] ? "opacity-50" : ""} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteSession(e, sessionId)}
                      className="p-1 rounded-full hover:bg-background transition-colors"
                      disabled={isDeleting[sessionId] || isLoading}
                      aria-label="Delete session"
                    >
                      <Trash2 size={16} className={isDeleting[sessionId] ? "opacity-50" : ""} />
                    </button>
                    {session.url && (
                      <a
                        href={session.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-full hover:bg-background transition-colors"
                        aria-label="Open session in new tab"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {isLoading && (
        <div className="text-center py-2 text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  )
}