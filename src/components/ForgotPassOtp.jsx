"use client"

import { useRef, useEffect } from "react"

export default function OtpInput({ value, onChange, numDigits = 6, isDisabled = false }) {
  const inputRefs = useRef([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, numDigits)
  }, [numDigits])

  const handleChange = (e, index) => {
    const newValue = e.target.value

    // Only allow digits
    if (!/^\d*$/.test(newValue)) return

    // Update the OTP value
    const newOtp = value.split("")
    newOtp[index] = newValue.slice(-1) // Take only the last character
    const updatedOtp = newOtp.join("")
    onChange(updatedOtp)

    // Auto-focus next input if a digit was entered
    if (newValue && index < numDigits - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1].focus()
      }
    }

    // Handle left arrow key
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    // Handle right arrow key
    if (e.key === "ArrowRight" && index < numDigits - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is all digits and not longer than numDigits
    if (/^\d+$/.test(pastedData) && pastedData.length <= numDigits) {
      const newOtp = pastedData.slice(0, numDigits).padEnd(numDigits, "")
      onChange(newOtp)

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.indexOf("")
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex].focus()
      } else {
        inputRefs.current[numDigits - 1].focus()
      }
    }
  }

  return (
    <div className="flex gap-2 justify-between">
      {[...Array(numDigits)].map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={isDisabled}
          className={`w-10 h-12 text-center text-xl font-semibold border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
            isDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
          aria-label={`Digit ${index + 1} of OTP`}
        />
      ))}
    </div>
  )
}

