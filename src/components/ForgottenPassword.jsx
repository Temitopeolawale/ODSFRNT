"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()


  const API_URL ="https://visionflow.up.railway.app/api/v1"
  // Load email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("recoveryEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Handle email input change
  const handleEmailChange = (e) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    // Save to localStorage as the user types
    localStorage.setItem("recoveryEmail", newEmail)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // Call the API endpoint using axios
      const response = await axios.post(`${API_URL}/user/forgot-password`, { email })
      
      // Show success message
      setIsSuccess(true)

      // Navigate to reset password page after a short delay
      setTimeout(() => {
        // Navigate to reset password page using React Router
        navigate(`/reset-pass?email=${encodeURIComponent(email)}`)
      }, 1500)
    } catch (err) {
      // Handle error from axios
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle back to login click
  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Increased max-width from max-w-md to max-w-xl for a wider border box */}
      <div className="max-w-xl w-full px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-8 text-center">Account Recovery</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Forgot your password?</h2>
              <p className="mt-2 text-gray-600">
                Enter your email address, and we'll send you a one-time password (OTP) to reset your password.
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">OTP sent successfully! Redirecting...</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      error ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {error}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              </form>
            )}

            <div className="text-sm text-center pt-4 border-t border-gray-200">
              <button
                onClick={handleLoginClick}
                className="font-medium text-purple-600 hover:text-purple-500 flex items-center justify-center mx-auto"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}