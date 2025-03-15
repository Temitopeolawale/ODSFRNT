"use client"

import { useState } from "react"
import Sidebar from "../components/SideBar"
import SessionViewer from "../components/SessionViewer"
import { useTheme } from "../context/theme-context"
import { CaptureModeProvider } from "../context/CaptureMode-context"
import ThemeToggle from "../ui/ThemeToggle"

export default function SessionViewerPage() {
  const { theme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <CaptureModeProvider>
      <div className={`h-screen flex ${theme === "dark" ? "dark" : ""}`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
        <div className="flex flex-col h-screen overflow-hidden flex-1">
          <div className="flex justify-end items-center p-4 border-b">
            <ThemeToggle />
          </div>
          <SessionViewer />
        </div>
      </div>
    </CaptureModeProvider>
  )
}