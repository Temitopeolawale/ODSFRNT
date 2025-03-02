"use client"
import { useSession } from "../context/session-context"
import { formatDistanceToNow } from "date-fns"
import { Trash2} from "lucide-react"

export default function SessionsList({ collapsed }) {
  const { sessions, setCurrentSessionId, currentSessionId, deleteSession, createNewSession } = useSession()

  const handleSessionClick = (id) => {
    setCurrentSessionId(id)
  }

  const handleDeleteSession = (e, id) => {
    e.stopPropagation()
    deleteSession(id)
  }

  const handleNewSession = () => {
    createNewSession()
  }

  return (
    <div className="px-2">
      <div className="flex justify-between items-center">
        <h3 className={`text-sm font-medium px-2 py-1 ${collapsed ? "sr-only" : ""}`}>Sessions</h3>
        {/* <button 
          onClick={handleNewSession}
          className="rounded-md p-1 hover:bg-muted transition-colors"
          aria-label="Create new session"
        >
          <Plus size={collapsed ? 20 : 16} />
        </button> */}
      </div>
      <div className="space-y-1 mt-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSessionClick(session.id)}
            className={`
              cursor-pointer rounded-md transition-colors
              ${currentSessionId === session.id ? "bg-muted" : "hover:bg-muted/50"}
              ${collapsed ? "p-2" : "p-2"}
            `}
          >
            {collapsed ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  {session.objects?.length || 0}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium truncate">Session {session.id.slice(0, 6)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                  </div>
                  {session.objects && (
                    <div className="text-xs text-muted-foreground mt-1">{session.objects.length} objects detected</div>
                  )}
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="p-1 rounded-full hover:bg-background transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// "use client"
// import { useSession } from "../context/session-context"
// import { formatDistanceToNow } from "date-fns"
// import { Trash2 } from "lucide-react"

// export default function SessionsList({ collapsed }) {
//   const { sessions, setCurrentSessionId, currentSessionId, deleteSession } = useSession()

//   const handleSessionClick = (id) => {
//     setCurrentSessionId(id)
//   }

//   const handleDeleteSession = (e, id) => {
//     e.stopPropagation()
//     deleteSession(id)
//   }

//   return (
//     <div className="px-2">
//       <h3 className={`text-sm font-medium px-2 py-1 ${collapsed ? "sr-only" : ""}`}>Sessions</h3>
//       <div className="space-y-1 mt-1">
//         {sessions.map((session) => (
//           <div
//             key={session.id}
//             onClick={() => handleSessionClick(session.id)}
//             className={`
//               cursor-pointer rounded-md transition-colors
//               ${currentSessionId === session.id ? "bg-muted" : "hover:bg-muted/50"}
//               ${collapsed ? "p-2" : "p-2"}
//             `}
//           >
//             {collapsed ? (
//               <div className="flex justify-center">
//                 <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
//                   {session.objects?.length || 0}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex justify-between items-center">
//                 <div>
//                   <div className="font-medium truncate">Session {session.id.slice(0, 6)}</div>
//                   <div className="text-xs text-muted-foreground">
//                     {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
//                   </div>
//                   {session.objects && (
//                     <div className="text-xs text-muted-foreground mt-1">{session.objects.length} objects detected</div>
//                   )}
//                 </div>
//                 <button
//                   onClick={(e) => handleDeleteSession(e, session.id)}
//                   className="p-1 rounded-full hover:bg-background transition-colors"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

