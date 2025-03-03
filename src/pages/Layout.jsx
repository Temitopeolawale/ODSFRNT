"use client"

import { useState } from "react"
import Sidebar from "../components/SideBar"
import MainContent from "./Dashboard"
import { useTheme } from "../context/theme-context"
import { CaptureModeProvider } from "../context/CaptureMode-context"

export default function Layout() {
  const { theme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const handleUploadClick = () => {
    setShowUpload(!showUpload) // Toggle the showUpload state
  }

  return (
    <CaptureModeProvider>
      <div className={`h-screen flex ${theme === "dark" ? "dark" : ""}`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          onUploadClick={handleUploadClick}
          showUpload={showUpload} // Pass the showUpload state
        />
        <MainContent
          sidebarCollapsed={sidebarCollapsed} 
          showUpload={showUpload} 
          setShowUpload={setShowUpload}
        />
      </div>
    </CaptureModeProvider>
  )
}