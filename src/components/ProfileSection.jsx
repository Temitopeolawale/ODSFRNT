"use client"

import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown, Settings, LogOut } from "lucide-react"
import { Switch } from "../ui/Switch"
import { useTheme } from "../context/theme-context"
import { useSession } from "../context/session-context"
import { useNavigate } from "react-router-dom"
import { logout } from "../Service/auth"
import axios from "axios"

export default function ProfileSection({ collapsed }) {
  const [expanded, setExpanded] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const { sessions } = useSession()
  const navigate = useNavigate()

  const API_URl = "https://visionflow.up.railway.app/api/v1";
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        const authToken = localStorage.getItem('userToken')
        if (!authToken) {
          console.log("No auth token found")
          setIsLoading(false)
          return
        }
        
        console.log("Fetching user profile with axios...")
        
        // Using axios instead of fetch
        const response = await axios.get(`${API_URl}/user/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })
        
        console.log("Profile data:", response.data)
        
        if (response.data && response.data.success && response.data.data && response.data.data.email) {
          console.log("Setting email:", response.data.data.email)
          setUserEmail(response.data.data.email)
        } else {
          console.log("Email not found in response data")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error.response || error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [])
  
  const getInitial = () => {
    if (userEmail && userEmail.length > 0) {
      return userEmail.charAt(0).toUpperCase()
    }
    return ""
  }

  // Function to truncate email for display
  const formatEmail = () => {
    if (!userEmail) return "User";
    
    // If email is short enough, return it as is
    if (userEmail.length <= 15) return userEmail;
    
    // Split the email at the @ symbol
    const [username, domain] = userEmail.split('@');
    
    // Truncate the username part if it's too long
    const truncatedUsername = username.length > 8 ? username.substring(0, 8) + '...' : username;
    
    // Return the truncated email
    return domain ? `${truncatedUsername}@${domain}` : truncatedUsername;
  }

  const toggleExpanded = () => {
    if (!collapsed) {
      setExpanded(!expanded)
    }
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('userToken') // Fixed to match the token name used in fetchUserProfile
    navigate('/login')
    console.log("Logging out...")
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
          {!isLoading && getInitial() ? (
            <span className="font-medium text-sm">{getInitial()}</span>
          ) : (
            <div className="animate-pulse bg-primary/10 w-4 h-4 rounded-full"></div>
          )}
        </div>

        {!collapsed && (
          <>
            <div className="ml-2 flex-1 min-w-0"> {/* Added min-w-0 to allow truncation */}
              <div className="font-medium text-sm truncate" title={userEmail}>{formatEmail()}</div>
              <div className="text-xs text-muted-foreground">{sessions.length} sessions</div>
            </div>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </>
        )}
      </div>

      {!collapsed && expanded && (
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between mb-3 relative">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            >
              <Settings size={14} />
              <span className="ml-2 text-sm flex items-center">
                Settings
                {showSettingsDropdown ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </span>
            </div>
            
            {showSettingsDropdown && (
              <div className="absolute top-6 left-0 bg-background border rounded-md shadow-md z-10 w-32">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left p-2 flex items-center text-sm hover:bg-muted"
                >
                  <LogOut size={14} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
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
            
            {/* Added full email display in the expanded section */}
            {userEmail && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-xs break-all">{userEmail}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}