import { createContext, useContext, useState } from "react";

// Create the context
const CaptureModeContext = createContext();

// Create a provider component
export function CaptureModeProvider({ children }) {
  const [captureMode, setCaptureMode] = useState("camera");
  
  return (
    <CaptureModeContext.Provider value={{ captureMode, setCaptureMode }}>
      {children}
    </CaptureModeContext.Provider>
  );
}

// Create a custom hook to use the context
export function useCaptureMode() {
  const context = useContext(CaptureModeContext);
  if (context === undefined) {
    throw new Error("useCaptureMode must be used within a CaptureModeProvider");
  }
  return context;
}