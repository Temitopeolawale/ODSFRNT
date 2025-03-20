import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };
  
  const API_URL = "https://visionflow.up.railway.app/api/v1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("userEmail");
    const otpString = otp.join("");

    try {
      const response = await axios.post(`${API_URL}/user/verify`, {
        otp: otpString,
        email: userEmail,
      });

      if (response.status === 200) {
        toast.success("Email verified");
        navigate("/login");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Invalid OTP");
      }
      if (error.response?.status === 500) {
        console.log(error);
        toast.error("Server error. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-black mb-4">
          Verify OTP
        </h2>
        <p className="text-center text-gray-800 mb-6">
          Please enter the 6-digit code sent to your email
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-6">
            {otp.map((data, index) => (
              <input
                className="w-12 h-12 border-2 border-gray-300 rounded-lg mx-1 text-center text-2xl font-bold text-black focus:border-black focus:outline-none"
                type="text"
                name="otp"
                maxLength="1"
                key={index}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                ref={(input) => (inputRefs.current[index] = input)}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Verify
          </button>
        </form>
        <p className="text-center text-gray-800 mt-4">
          Didn't receive the code?{" "}
          <a href="#" className="text-black hover:underline font-medium">
            Resend
          </a>
        </p>
      </div>
      <div className="w-full h-1 bg-black fixed bottom-0"></div>
    </div>
  );
};

export default OTPVerificationPage;