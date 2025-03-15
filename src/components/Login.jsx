import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { saveToken, SetAuthHeader } from '../Service/auth'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    //end point for login
    const API_URL = "http://localhost:2009/api/v1"
    
    // handling the form 
    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${API_URL}/user/login`, {
                email,
                password
            })
            
            // Add console log to debug token
            console.log("Login response:", response.data)
            const token = response.data.data.token
            
            
            // handling the responses 
            if(response.status === 200){
                // First save the token
                saveToken(token)
                
                // Then set the auth header (this function will get the token from localStorage)
                SetAuthHeader()
                
                toast.success("Login Successful")
                navigate("/analysis")
            }
        } catch (error) {
            console.error("Login error:", error)
            if(error.response?.status === 401){
                toast.error("Invalid Username or Password")
            }
            else if (error.response?.status === 400){
                toast.error("Verify your OTP")
            } else {
                toast.error("Login failed. Please try again.")
            }
        }
    }

    return (
        <>
            <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
                        Log in to your account
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Log in
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="w-full h-1 bg-black fixed bottom-0"></div>
            </div>
        </>
    )
}

export default Login