"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { saveToken, SetAuthHeader } from '../Service/auth'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  
  // API endpoint
  const API_URL = "https://visionflow.up.railway.app/api/v1"

  const validateForm = () => {
    const newErrors = {}
    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await axios.post(`${API_URL}/user/login`, {
          email,
          password
        })
        
        console.log("Login response:", response.data)
        const token = response.data.data.token
        
        if(response.status === 200){
          saveToken(token)
          SetAuthHeader()
          toast.success("Login Successful")
          navigate("/analysis")
          console.log("Login successful, would navigate to /analysis")
        }
      } catch (error) {
        console.error("Login error:", error)
        if(error.response?.status === 401){
          toast.error("Invalid Username or Password")
        }
        else if (error.response?.status === 400){
          toast.error("Invalid Email or password ")
        } else {
          toast.error("Login failed. Please try again.")
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black`}
                placeholder="••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-pass" className="font-medium text-purple-600 hover:text-purple-500 flex items-center justify-center mx-auto">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?
            
             <button onClick={handleSignUp} className="font-medium text-purple-600 hover:text-purple-500 ">Sign up instead</button>
          </p>
        </div>

        <div className="mt-8 border-t border-gray-300"></div>
      </div>
    </div>
  )
}