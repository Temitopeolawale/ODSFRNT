import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  // Use state with a default that will be updated in useEffect
  const [theme, setTheme] = useState("light")
  const [mounted, setMounted] = useState(false)

  // This useEffect handles the initial theme detection
  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("visionflow-theme")
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
    
    // Mark as mounted to prevent hydration mismatch
    setMounted(true)
  }, [])

  // This useEffect handles applying the theme to the document
  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme on initial load and changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    
    // Save to localStorage
    localStorage.setItem("visionflow-theme", theme)
  }, [theme, mounted])

  // Function to change theme
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
  }

  // Function to toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
  }

  // Provide the theme context value
  const contextValue = {
    theme,
    setTheme: handleThemeChange,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

// "use client"

// import { createContext, useContext, useState, useEffect } from "react"

// const ThemeContext = createContext({
//   theme: "light",
//   setTheme: () => {},
// })

// export function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState("light")

//   useEffect(() => {
//     // Check for saved theme in localStorage
//     const savedTheme = localStorage.getItem("visionflow-theme")
//     if (savedTheme) {
//       setTheme(savedTheme)
//     } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//       setTheme("dark")
//     }
//   }, [])

//   const handleThemeChange = (newTheme) => {
//     setTheme(newTheme)
//     localStorage.setItem("visionflow-theme", newTheme)

//     // Apply theme to document
//     if (newTheme === "dark") {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//   }

//   useEffect(() => {
//     // Apply theme on initial load and changes
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//   }, [theme])

//   return <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>{children}</ThemeContext.Provider>
// }

// export const useTheme = () => useContext(ThemeContext)

