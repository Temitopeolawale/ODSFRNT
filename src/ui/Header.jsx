"use client"

import { Menu, Zap } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"

export default function Header({ toggleSidebar }) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card text-card-foreground">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-muted mr-2" aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className="flex items-center">
          <Zap className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold">AI Image Analyzer</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <ThemeToggle />
      </div>
    </header>
  )
}

