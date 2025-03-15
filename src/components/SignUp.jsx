"use client"
import React, { useState } from "react"
import { Mail, Lock } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const navigate = useNavigate()

  const API_URL = "http://localhost:2009/api/v1"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })
    
    try {
      // Send email and password directly in the request body
      const response = await axios.post(`${API_URL}/user/register`, {
        email: formData.email,
        password: formData.password
      })

      if (response.status == 201) {
        // setItem to save user email in the storage
        localStorage.setItem("userEmail", formData.email);
        // toas notificatioon : sign up successufl
        toast.success("Verify Otp",{duration:5000})
        navigate("/verify-otp")
         // setMessage(response.data.message || "otp sent to your email ");
      }
      
      setMessage({ 
        text: "Registration successful! Check your email for verification code.", 
        type: "success" 
      })
      setFormData({ email: "", password: "" })
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again."
      setMessage({ text: errorMessage, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">Hello!</h1>
          <p className="text-xl">Sign Up to Get Started</p>
        </div>
        {message.text && (
          <div className={`mb-4 p-3 rounded-md text-center ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-3 pl-10 pr-3 bg-gray-100 rounded-md focus:outline-none"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-3 pl-10 pr-3 bg-gray-100 rounded-md focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${
              loading ? "bg-gray-400" : "bg-black hover:bg-black/90"
            } text-white rounded-md transition-colors flex justify-center items-center`}
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
      <div className="w-full h-1 bg-blue-500 fixed bottom-0"></div>
    </div>
  )
}