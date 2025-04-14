"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the map component with ssr disabled
const TempleMap = dynamic(() => import("@/components/temple-map"), {
  ssr: false,
  loading: () => <MapLoading />,
})

function MapLoading() {
  return (
    <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-md flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-medium">Loading Map...</p>
        <p className="text-sm text-muted-foreground">Please wait while we load the temple locations</p>
      </div>
    </div>
  )
}

export default function MapWrapper() {
  return (
    <Suspense fallback={<MapLoading />}>
      <TempleMap />
    </Suspense>
  )
}
