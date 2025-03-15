"use client"

import { ChevronLeft, ChevronRight, Plus, Upload, Camera } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import SessionsList from "./SessionList"
import ProfileSection from "./ProfileSection"
import { useSession } from "../context/session-context"
import { useCaptureMode } from "../context/CaptureMode-context"

export default function Sidebar({ collapsed, setCollapsed }) {
  const sessionContext = useSession()
  const { captureMode, setCaptureMode } = useCaptureMode()
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleNewSession = async () => {
  const isSessionViewerPage = location.pathname.startsWith("/sessions/")
  
  if (isSessionViewerPage) {
    navigate('/analysis')
  } else {
    try {
      if (sessionContext?.createNewSession) {
        await sessionContext.createNewSession()
      } else {
        console.error("createNewSession function is not available")
      }
    } catch (error) {
      // If there's a 409 error, the session context should handle it
      // but we can add additional error handling here if needed
      console.error("Error creating new session:", error)
      
      // We could automatically redirect to the active session if we know its ID
      if (error.response?.status === 409 && error.response?.data?.existingThreadId) {
        sessionContext.setCurrentSessionId(error.response.data.existingThreadId)
      }
    }
  }
}
  
  // Updated to toggle between "camera" and "upload" modes
  const handleToggleButton = () => {
    setCaptureMode(captureMode === "camera" ? "upload" : "camera")
  }
  
  // Determine if we're showing upload or camera based on current captureMode
  const showUpload = captureMode === "camera" // If in camera mode, show upload button (and vice versa)
  
  return (
    <div className={`border-r bg-background flex flex-col h-screen transition-all duration-300 ${
      collapsed ? "w-14" : "w-60"
    }`}>
      <div className="flex items-center p-4 border-b justify-between">
        {!collapsed && <h1 className="text-xl font-semibold">VisionFlow</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 rounded-full hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-3 space-y-4">
          <button
            onClick={handleNewSession}
            className="flex items-center gap-2 w-full rounded-md p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            {!collapsed && <span>New Session</span>}
          </button>
          
          <button
            onClick={handleToggleButton}
            className="flex items-center gap-2 w-full rounded-md p-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            {showUpload ? <Camera size={16} /> : <Upload size={16} />}
            {!collapsed && <span>{showUpload ? "Camera" : "Upload Image"}</span>}
          </button>
        </div>
        
        <SessionsList collapsed={collapsed} />
      </div>
      
      <ProfileSection collapsed={collapsed} />
    </div>
  )
}