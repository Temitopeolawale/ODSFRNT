

import { useState, useEffect, useRef } from "react"
import { Send, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { useTheme } from "../context/theme-context" // Assuming this exists based on your second snippet

export default function ChatInterface({ 
  messages = [], 
  onSendMessage, 
  isLoading, 
  wsConnected, 
  readOnly = false 
}) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef(null)
  const { theme } = useTheme() // From your second snippet
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && wsConnected && !readOnly) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="w-full max-w-xl h-[600px]  mt-24 flex flex-col border rounded-lg overflow-hidden bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-medium">Conversation</h2>
        {!wsConnected && !readOnly && (
          <div className="flex items-center mt-2 text-sm text-amber-500">
            <AlertCircle size={14} className="mr-1" />
            <span>Connection lost. Trying to reconnect...</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {!messages || messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-lg",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.role === "system"
                        ? "bg-muted text-muted-foreground"
                        : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-lg bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-border">
        {readOnly ? (
          <div className="text-sm text-muted-foreground text-center py-2">
            This is a past session. You cannot send new messages.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={wsConnected ? "Type your message..." : "Reconnecting..."}
              disabled={!wsConnected || isLoading || readOnly}
              className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!wsConnected || isLoading || !message.trim() || readOnly}
              className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              <span className="sr-only">Send message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// import { useState, useEffect, useRef } from "react"
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/Card"
// import { Input } from "../ui/Input"
// import { Button } from "../ui/Button"
// import { Send, Download } from "lucide-react"
// import { useSession } from "../context/session-context"

// export default function ChatInterface({ analysisResults }) {
//   const { addMessageToCurrentSession } = useSession()
//   const [message, setMessage] = useState("")
//   const [messages, setMessages] = useState([])
//   const [isTyping, setIsTyping] = useState(false)
//   const [socket, setSocket] = useState(null)
//   const messagesEndRef = useRef(null)

//   // Initialize WebSocket connection
//   useEffect(() => {
//     // In a real app, this would connect to your WebSocket server
//     // For demo purposes, we'll simulate WebSocket behavior
//     const mockSocket = {
//       send: (data) => {
//         // Simulate server processing
//         setTimeout(() => {
//           const parsedData = JSON.parse(data)
//           handleServerResponse(parsedData.message)
//         }, 1000)
//       },
//       close: () => console.log("WebSocket closed"),
//     }

//     setSocket(mockSocket)

//     // Add initial system message
//     const initialMessage = {
//       id: Date.now(),
//       role: "system",
//       content: "I've analyzed your image. Ask me questions about what I see!",
//       timestamp: new Date().toISOString(),
//     }

//     setMessages([initialMessage])
//     addMessageToCurrentSession(initialMessage)

//     return () => {
//       if (socket && socket.close) {
//         socket.close()
//       }
//     }
//   }, [addMessageToCurrentSession, socket])

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [])

//   const handleServerResponse = (userMessage) => {
//     // Simulate AI response based on user message and analysis results
//     setIsTyping(true)

//     setTimeout(() => {
//       let responseContent = ""

//       if (userMessage.toLowerCase().includes("how many")) {
//         responseContent = `I detected ${analysisResults.objects.length} objects in the image.`
//       } else if (userMessage.toLowerCase().includes("what")) {
//         const objectNames = analysisResults.objects.map((obj) => obj.name).join(", ")
//         responseContent = `I can see: ${objectNames}.`
//       } else {
//         responseContent =
//           "I'm analyzing the objects in your image. Feel free to ask specific questions about what you see!"
//       }

//       const newMessage = {
//         id: Date.now(),
//         role: "assistant",
//         content: responseContent,
//         timestamp: new Date().toISOString(),
//       }

//       setMessages((prev) => [...prev, newMessage])
//       addMessageToCurrentSession(newMessage)
//       setIsTyping(false)
//     }, 1500)
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (!message.trim()) return

//     const newMessage = {
//       id: Date.now(),
//       role: "user",
//       content: message,
//       timestamp: new Date().toISOString(),
//     }

//     setMessages((prev) => [...prev, newMessage])
//     addMessageToCurrentSession(newMessage)

//     if (socket) {
//       socket.send(JSON.stringify({ message }))
//     }

//     setMessage("")
//   }

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp)
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//   }

//   const handleExport = () => {
//     const chatText = messages.map((msg) => `[${formatTime(msg.timestamp)}] ${msg.role}: ${msg.content}`).join("\n")

//     const blob = new Blob([chatText], { type: "text/plain" })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.href = url
//     link.download = `vision-flow-chat-${Date.now()}.txt`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <Card className="flex flex-col h-[600px]">
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-lg font-medium">Chat</CardTitle>
//         <button onClick={handleExport} className="p-1 hover:bg-muted rounded-full" title="Export chat">
//           <Download size={18} />
//         </button>
//       </CardHeader>
//       <CardContent className="flex-1 overflow-y-auto">
//         <div className="space-y-4">
//           {messages.map((msg) => (
//             <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//               <div
//                 className={`max-w-[80%] px-4 py-2 rounded-lg ${
//                   msg.role === "user"
//                     ? "bg-primary text-primary-foreground"
//                     : msg.role === "system"
//                       ? "bg-muted text-muted-foreground"
//                       : "bg-secondary text-secondary-foreground"
//                 }`}
//               >
//                 <p>{msg.content}</p>
//                 <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
//               </div>
//             </div>
//           ))}
//           {isTyping && (
//             <div className="flex justify-start">
//               <div className="max-w-[80%] px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
//                   <div
//                     className="w-2 h-2 rounded-full bg-current animate-bounce"
//                     style={{ animationDelay: "0.2s" }}
//                   ></div>
//                   <div
//                     className="w-2 h-2 rounded-full bg-current animate-bounce"
//                     style={{ animationDelay: "0.4s" }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </CardContent>
//       <CardFooter>
//         <form onSubmit={handleSubmit} className="flex w-full gap-2">
//           <Input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Ask about the image..."
//             className="flex-1"
//           />
//           <Button type="submit" size="icon" disabled={isTyping}>
//             <Send size={18} />
//           </Button>
//         </form>
//       </CardFooter>
//     </Card>
//   )
// }



// import { useState, useEffect, useRef } from "react"
// import { Send, AlertCircle } from "lucide-react"

// export default function ChatInterface({ messages, onSendMessage, isLoading, wsConnected }) {
//   const [message, setMessage] = useState("")
//   const messagesEndRef = useRef(null)

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (!message.trim() || !wsConnected) return

//     onSendMessage(message)
//     setMessage("")
//   }

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp)
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//   }

//   return (
//     <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
//       <div className="p-4 border-b border-border">
//         <h2 className="text-lg font-medium">Conversation</h2>
//         {!wsConnected && (
//           <div className="flex items-center mt-2 text-sm text-destructive">
//             <AlertCircle size={14} className="mr-1" />
//             <span>WebSocket disconnected</span>
//           </div>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="space-y-4">
//           {messages.map((msg) => (
//             <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//               <div
//                 className={`max-w-[80%] px-4 py-2 rounded-lg ${
//                   msg.role === "user"
//                     ? "bg-primary text-primary-foreground"
//                     : msg.role === "system"
//                       ? "bg-muted text-muted-foreground"
//                       : "bg-secondary text-secondary-foreground"
//                 }`}
//               >
//                 <p>{msg.content}</p>
//                 <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
//               </div>
//             </div>
//           ))}

//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="max-w-[80%] px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
//                   <div
//                     className="w-2 h-2 rounded-full bg-current animate-bounce"
//                     style={{ animationDelay: "0.2s" }}
//                   ></div>
//                   <div
//                     className="w-2 h-2 rounded-full bg-current animate-bounce"
//                     style={{ animationDelay: "0.4s" }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       <div className="p-4 border-t border-border">
//         <form onSubmit={handleSubmit} className="flex space-x-2">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder={wsConnected ? "Ask about the image..." : "Reconnecting..."}
//             disabled={!wsConnected || isLoading}
//             className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//           />
//           <button
//             type="submit"
//             disabled={!wsConnected || isLoading || !message.trim()}
//             className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Send size={18} />
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }


// "use client"

