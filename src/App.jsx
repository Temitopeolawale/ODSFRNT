import './App.css'
import { useState, useEffect } from "react"
import { SessionProvider } from "./context/session-context"
import { ThemeProvider } from "./context/theme-context"
import Layout from './pages/Layout'
function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading (e.g., checking for camera permissions)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">VisionFlow</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Initializing camera and services...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <ThemeProvider>
    <SessionProvider>
    <Layout/>
    </SessionProvider>
    </ThemeProvider>
    </>
  )
}

export default App
