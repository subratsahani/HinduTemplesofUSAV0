"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin } from "lucide-react"
import L from "leaflet"
import { useToast } from "@/components/ui/use-toast"
import AdminEditModal from "./admin-edit-modal"

// Sample data - fallback in case JSON fetch fails
const initialTemples = [
  {
    id: "1",
    name: "BAPS Shri Swaminarayan Mandir",
    address: "460 Rockbridge Rd NW, Lilburn, GA 30047",
    state: "Georgia",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 33.8896,
    longitude: -84.143,
    googleMapsLink: "https://maps.google.com/?q=33.8896,-84.1430",
  },
  {
    id: "2",
    name: "Sri Siva Vishnu Temple",
    address: "6905 Cipriano Rd, Lanham, MD 20706",
    state: "Maryland",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 38.9647,
    longitude: -76.8483,
    googleMapsLink: "https://maps.google.com/?q=38.9647,-76.8483",
  },
  {
    id: "3",
    name: "Hindu Temple of Minnesota",
    address: "10530 Troy Ln N, Maple Grove, MN 55311",
    state: "Minnesota",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 45.1151,
    longitude: -93.4659,
    googleMapsLink: "https://maps.google.com/?q=45.1151,-93.4659",
  },
  {
    id: "4",
    name: "Shri Swaminarayan Mandir",
    address: "1020 Tyinn St, Robbinsville, NJ 08691",
    state: "New Jersey",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 40.1973,
    longitude: -74.6199,
    googleMapsLink: "https://maps.google.com/?q=40.1973,-74.6199",
  },
  {
    id: "5",
    name: "Sri Venkateswara Temple",
    address: "1230 S Pennsylvania Ave, Penn Hills, PA 15235",
    state: "Pennsylvania",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 40.4395,
    longitude: -79.8282,
    googleMapsLink: "https://maps.google.com/?q=40.4395,-79.8282",
  },
  {
    id: "6",
    name: "Hindu Temple of Greater Chicago",
    address: "10915 Lemont Rd, Lemont, IL 60439",
    state: "Illinois",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 41.6823,
    longitude: -87.9553,
    googleMapsLink: "https://maps.google.com/?q=41.6823,-87.9553",
  },
  {
    id: "7",
    name: "Sri Meenakshi Temple",
    address: "17130 McLean Rd, Pearland, TX 77584",
    state: "Texas",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 29.559,
    longitude: -95.3228,
    googleMapsLink: "https://maps.google.com/?q=29.5590,-95.3228",
  },
  {
    id: "8",
    name: "Malibu Hindu Temple",
    address: "1600 Las Virgenes Canyon Rd, Calabasas, CA 91302",
    state: "California",
    image: "/placeholder.svg?height=200&width=300",
    latitude: 34.0953,
    longitude: -118.7081,
    googleMapsLink: "https://maps.google.com/?q=34.0953,-118.7081",
  },
]

// Component to recenter map when filters change
function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 4)
  }, [center, map])
  return null
}

// Fix for Leaflet icon in Next.js
const fixLeafletIcon = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: "/marker-icon.png",
      iconRetinaUrl: "/marker-icon-2x.png",
      shadowUrl: "/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }
}

// Get all unique states from the temples data
const getUniqueStates = (temples) => {
  const states = temples.map((temple) => temple.state)
  return [...new Set(states)].sort()
}

export default function TempleMap() {
  const [temples, setTemples] = useState(initialTemples)
  const [filteredTemples, setFilteredTemples] = useState(initialTemples)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedTemple, setSelectedTemple] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [states, setStates] = useState(getUniqueStates(initialTemples))
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef(null)
  const { toast } = useToast()

  // Center of USA
  const center = [39.8283, -98.5795]

  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Use the initial data directly instead of fetching
  useEffect(() => {
    // We're using the hardcoded data directly
    setTemples(initialTemples)
    setFilteredTemples(initialTemples)
    setStates(getUniqueStates(initialTemples))
    setIsLoading(false)

    // Log that we're using hardcoded data
    console.log("Using hardcoded temple data")
  }, [])

  // Handle state selection
  const handleStateChange = (value) => {
    // Explicitly handle the "all" case
    if (value === "all") {
      setSelectedState("")
    } else {
      setSelectedState(value)
    }
  }

  // Filter temples based on search term and selected state
  useEffect(() => {
    if (temples.length === 0) return

    let filtered = [...temples]

    if (selectedState) {
      filtered = filtered.filter((temple) => temple.state === selectedState)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (temple) => temple.name.toLowerCase().includes(term) || temple.address.toLowerCase().includes(term),
      )
    }

    setFilteredTemples(filtered)
  }, [searchTerm, selectedState, temples])

  // Handle temple update from admin
  const handleTempleUpdate = (updatedTemple) => {
    setTemples(temples.map((temple) => (temple.id === updatedTemple.id ? updatedTemple : temple)))
    setIsEditModalOpen(false)
    toast({
      title: "Temple Updated",
      description: `${updatedTemple.name} has been updated successfully.`,
    })
  }

  if (isLoading) {
    return (
      <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-md flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-medium">Loading Temple Data...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load the temple locations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row gap-4 relative z-20">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search temples by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={selectedState || "all"} onValueChange={handleStateChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all">All States</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Admin mode button commented out as requested */}
        {/* <Button variant={isAdmin ? "destructive" : "outline"} onClick={toggleAdminMode} className="w-full md:w-auto">
          {isAdmin ? "Exit Admin Mode" : "Admin Mode"}
        </Button> */}
      </div>

      <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-md relative z-10">
        <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%" }} ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />

          {filteredTemples.map((temple) => (
            <Marker
              key={temple.id}
              position={[temple.latitude, temple.longitude]}
              eventHandlers={{
                click: () => {
                  setSelectedTemple(temple)
                },
              }}
            >
              <Popup>
                <Card className="w-[250px] border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      <img
                        src={temple.image || "/placeholder.svg"}
                        alt={temple.name}
                        className="w-full h-[150px] object-cover rounded-t-lg"
                      />
                      <div className="p-2">
                        <h3 className="font-bold text-lg">{temple.name}</h3>
                        <p className="text-sm text-muted-foreground">{temple.address}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {temple.latitude.toFixed(4)}, {temple.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between mt-3">
                          <a
                            href={temple.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View on Google Maps
                          </a>

                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTemple(temple)
                                setIsEditModalOpen(true)
                              }}
                              className="text-xs h-7 px-2"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTemples.length} of {temples.length} temples
      </div>

      {isEditModalOpen && selectedTemple && (
        <AdminEditModal
          temple={selectedTemple}
          onSave={handleTempleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}
