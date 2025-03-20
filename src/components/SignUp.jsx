"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  
  const navigate = useNavigate()
  const API_URL = "https://visionflow.up.railway.app/api/v1"

  const handleSignIn = ()=>{
    navigate("/login")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })
    
    try {
      const response = await axios.post(`${API_URL}/user/register`, {
        email: email,
        password: password
      })

      if (response.status === 201) {
        localStorage.setItem("userEmail", email)
        toast.success("Verify OTP", { duration: 5000 })
        navigate("/verify-otp")
      }
      
      setMessage({ 
        text: "Registration successful! Check your email for verification code.", 
        type: "success" 
      })
      setEmail("")
      setPassword("")
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again."
      setMessage({ text: errorMessage, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-1">VisionFlow</h1>
    
          <p className="text-gray-500">Sign up to get started</p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-md text-center ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black"
                placeholder="••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            {loading ? "Processing..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button  onClick={handleSignIn}  className="font-medium text-black hover:text-indigo-600">
              Log in instead
            </button>
          </p>
        </div>

        <div className="mt-8 border-t border-gray-300"></div>
      </div>
    </div>
  )
}