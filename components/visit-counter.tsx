"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"

export default function VisitCounter() {
  const [visits, setVisits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run this code on the client side
    if (typeof window === "undefined") return

    async function fetchAndUpdateVisits() {
      try {
        setIsLoading(true)
        
        // Check if this visit has been counted in this session
        const visitCounted = sessionStorage.getItem("visitCounted")
        
        if (!visitCounted) {
          // Increment the visit counter on the server
          await fetch('/api/visits', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          // Mark that we've counted this visit in this session
          sessionStorage.setItem("visitCounted", "true")
        }
        
        // Get the current visit count
        const response = await fetch('/api/visits')
        const data = await response.json()
        
        setVisits(data.visits)
        setIsLoading(false)
      } catch (error) {
        console.error("Error updating visit counter:", error)
        setIsLoading(false)
      }
    }

    fetchAndUpdateVisits()
    
    // Set up a periodic refresh to show other visits without incrementing
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/visits')
        const data = await response.json()
        setVisits(data.visits)
      } catch (error) {
        console.error("Error refreshing visit counter:", error)
      }
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-center">
      <Card className="w-auto inline-flex">
        <CardContent className="flex items-center space-x-2 py-4">
          <Eye className="h-4 w-4 text-muted-foreground" />
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading visits...</span>
          ) : (
            <span className="text-sm text-muted-foreground">{visits.toLocaleString()} page visits</span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Eye } from "lucide-react"

// export default function VisitCounter() {
//   const [visits, setVisits] = useState(0)

//   useEffect(() => {
//     // Only run this code on the client side
//     if (typeof window === "undefined") return

//     try {
//       // Get stored visits without updating state immediately
//       const storedVisits = localStorage.getItem("templeMapVisits")
//       let currentVisits = storedVisits ? Number.parseInt(storedVisits) : 0

//       // Increment visit count only once per session
//       if (!sessionStorage.getItem("visitCounted")) {
//         currentVisits++
//         localStorage.setItem("templeMapVisits", currentVisits.toString())
//         sessionStorage.setItem("visitCounted", "true")
//       }

//       // Set the initial state without causing a re-render loop
//       setVisits(currentVisits)

//       // Simulate other people visiting the site with a less frequent interval
//       const interval = setInterval(() => {
//         setVisits((prev) => {
//           const newCount = prev + 1
//           // Update localStorage but don't trigger another state update from it
//           localStorage.setItem("templeMapVisits", newCount.toString())
//           return newCount
//         })
//       }, 60000) // Reduced frequency to once per minute

//       return () => clearInterval(interval)
//     } catch (error) {
//       // Handle the case where localStorage is not available
//       console.error("localStorage is not available:", error)
//     }
//   }, []) // Empty dependency array ensures this only runs once

//   return (
//     <div className="flex justify-center">
//       <Card className="w-auto inline-flex">
//         <CardContent className="flex items-center space-x-2 py-4">
//           <Eye className="h-4 w-4 text-muted-foreground" />
//           <span className="text-sm text-muted-foreground">{visits.toLocaleString()} page visits</span>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
