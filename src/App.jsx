import './App.css'
import { useState, useEffect } from "react"
import { SessionProvider } from "./context/session-context"
import { ThemeProvider } from "./context/theme-context"
import toast, { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage'
import Layout from './pages/Layout'
import SignUpForm from './components/SignUp'
import OTPVerificationPage from './components/Otp';
import Login from './components/Login';
import SessionViewerPage from './pages/SessionviewerP';
import { Route, Routes } from 'react-router-dom'
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
    <Toaster/>
    <ThemeProvider>
    <SessionProvider>
    <Routes>
    <Route path='/' element={<LandingPage/>}/>
    <Route path='/signup' element={<SignUpForm/>} />
    <Route path='/verify-otp' element={<OTPVerificationPage/>} />
    <Route path='/login' element={<Login/>} />
    <Route path='/analysis' element={<Layout/>}/>
    <Route path="/sessions/:threadId" element={<SessionViewerPage />}/>

      </Routes>
    
    </SessionProvider>
    </ThemeProvider>
    </>
  )
}

export default App
