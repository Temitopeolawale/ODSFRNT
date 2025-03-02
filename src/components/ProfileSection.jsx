"use client"

import { useState } from "react"
import { User, ChevronUp, ChevronDown, Settings } from "lucide-react"
import { Switch } from "../ui/Switch"
import { useTheme } from "../context/theme-context"
import { useSession } from "../context/session-context"

export default function ProfileSection({ collapsed }) {
  const [expanded, setExpanded] = useState(false)
  const { theme, setTheme } = useTheme()
  const { sessions } = useSession()

  const toggleExpanded = () => {
    if (!collapsed) {
      setExpanded(!expanded)
    }
  }

  return (
    <div className="p-2">
      <div
        onClick={toggleExpanded}
        className={`
          flex items-center cursor-pointer p-2 rounded-md
          ${!collapsed && "hover:bg-muted transition-colors"}
        `}
      >
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <User size={16} />
        </div>

        {!collapsed && (
          <>
            <div className="ml-2 flex-1">
              <div className="font-medium">User</div>
              <div className="text-xs text-muted-foreground">{sessions.length} sessions</div>
            </div>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </>
        )}
      </div>

      {!collapsed && expanded && (
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Settings size={14} />
              <span className="ml-2 text-sm">Settings</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Dark Mode</label>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Front Camera</label>
              <Switch />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

