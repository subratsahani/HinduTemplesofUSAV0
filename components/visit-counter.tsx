"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"

export default function VisitCounter() {
  const [visits, setVisits] = useState(0)

  useEffect(() => {
    // Only run this code on the client side
    if (typeof window === "undefined") return

    try {
      // Get stored visits without updating state immediately
      const storedVisits = localStorage.getItem("templeMapVisits")
      let currentVisits = storedVisits ? Number.parseInt(storedVisits) : 0

      // Increment visit count only once per session
      if (!sessionStorage.getItem("visitCounted")) {
        currentVisits++
        localStorage.setItem("templeMapVisits", currentVisits.toString())
        sessionStorage.setItem("visitCounted", "true")
      }

      // Set the initial state without causing a re-render loop
      setVisits(currentVisits)

      // Simulate other people visiting the site with a less frequent interval
      const interval = setInterval(() => {
        setVisits((prev) => {
          const newCount = prev + 1
          // Update localStorage but don't trigger another state update from it
          localStorage.setItem("templeMapVisits", newCount.toString())
          return newCount
        })
      }, 60000) // Reduced frequency to once per minute

      return () => clearInterval(interval)
    } catch (error) {
      // Handle the case where localStorage is not available
      console.error("localStorage is not available:", error)
    }
  }, []) // Empty dependency array ensures this only runs once

  return (
    <div className="flex justify-center">
      <Card className="w-auto inline-flex">
        <CardContent className="flex items-center space-x-2 py-4">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{visits.toLocaleString()} page visits</span>
        </CardContent>
      </Card>
    </div>
  )
}
