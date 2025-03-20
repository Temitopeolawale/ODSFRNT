"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()

 const API_URL = "https://visionflow.up.railway.app/api/v1"

  const onBackClick = () => {
    navigate("/forgot-pass")
  }

  const onLoginClick = () => {
    navigate("/login")
  }

  useEffect(() => {
    // Get email from localStorage when component mounts
    const recoveryEmail = localStorage.getItem("recoveryEmail")
    if (recoveryEmail) {
      setEmail(recoveryEmail)
    } else {
      // Handle case where email is not in localStorage
      setErrors({ form: "Recovery email not found. Please go back and try again." })
    }
  }, [])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (otp.join("").length !== 6) {
      newErrors.otp = "OTP must be 6 digits"
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Using axios instead of fetch
      const response = await axios.post(`${API_URL}/user/reset-password`, {
        email,
        otp: otp.join(""),
        newPassword: password,
      });

      // If successful, show success message
      setIsSuccess(true)
      
      // Clear recovery email from localStorage
      localStorage.removeItem("recoveryEmail")

      // Redirect to login page after success
      setTimeout(() => {
        onLoginClick()
      }, 3000)
    } catch (err) {
      // Handle axios error
      const errorMessage = err.response?.data?.message || "Failed to reset password. Please try again.";
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="space-y-6 max-w-xl w-full mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-8 text-center">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the OTP sent to {email} and create a new password
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Password reset successful! Redirecting to login...</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <div className="mt-1 flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-lg font-medium text-black caret-black"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.otp && <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-sm font-medium text-black caret-black pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">Use 8+ characters with a mix of letters, numbers & symbols</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-sm font-medium text-black caret-black pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {errors.form && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errors.form}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center pt-4">
          <button
            onClick={onBackClick}
            className="font-medium text-purple-600 hover:text-purple-500 flex items-center justify-center mx-auto"
            disabled={isLoading || isSuccess}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to forgot password
          </button>
        </div>
      </div>
    </div>
  )
}