"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin } from "lucide-react"
import L from "leaflet"
import { useToast } from "@/components/ui/use-toast"
import AdminEditModal from "./admin-edit-modal"
import MarkerClusterGroup from 'react-leaflet-cluster';

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
  }
]
// Component to recenter map when filters change
function MapUpdater({ center }) {
  const map = useMap()
  const hasUpdatedRef = useRef(false)

  useEffect(() => {
    if (!hasUpdatedRef.current) {
      map.setView(center, 4) // your initial zoom level
      hasUpdatedRef.current = true
    }
  }, [center, map])
  return null
}

// Fix for Leaflet icon in Next.js
const fixLeafletIcon = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: "/marker-icon-om.png",
      iconRetinaUrl: "/marker-icon-om.png",
      shadowUrl: "/marker-shadow.png",
      iconSize: [39, 41],
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

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const mapRef = useRef(null)
  const { toast } = useToast()

  // Center of USA
  //const center = [39.8283, -98.5795]
  // Replace `center` definition
  const defaultCenter = [39.8283, -98.5795] // fallback center
  const center = userLocation || defaultCenter // 👈 UPDATED to prefer user location

  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon()

    // 👇 NEW: Try to get user's location
  // if (navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       setUserLocation([pos.coords.latitude, pos.coords.longitude])
  //       console.log("User location found:", pos.coords)
  //     },
  //     (err) => {
  //       console.warn("Geolocation error:", err)
  //     }
  //   )
  // }

  }, [])
  // Use the initial data directly instead of fetching
  // useEffect(() => {
  //   // We're using the hardcoded data directly
  //   setTemples(initialTemples)
  //   setFilteredTemples(initialTemples)
  //   setStates(getUniqueStates(initialTemples))
  //   setIsLoading(false)

  //   // Log that we're using hardcoded data
  //   console.log("Using hardcoded temple data")
  // }, [])

  // useEffect(() => {
  //   // Fetch the JSON file from the public directory
  //   fetch('/data/temples.json')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setTemples(data);
  //       setFilteredTemples(data);
  //       setStates(getUniqueStates(data)); // You can keep this logic
  //       setIsLoading(false);
        
  //       console.log('Data fetched from temples.json');
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching temples data:', error);
  //       setIsLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    
    // Call your API route instead of the static JSON file
    fetch('/api/temples')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Assuming your API returns { temples: [...] }
        const templeData = data.temples || data; // Handle both formats
        setTemples(templeData);
        setFilteredTemples(templeData);
        setStates(getUniqueStates(templeData)); // You can keep this logic
        setIsLoading(false);

        console.log('Data fetched from API');
      })
      .catch((error) => {
        console.error('Error fetching temples data:', error);
        setIsLoading(false);
      });
  }, []);





























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

  // // Reference to the marker
  // const markerRef = useRef(null);
  // // Hook to manage popup behavior
  // const PopupControl = ({ markerRef }) => {
  //   const map = useMap();

  //   useEffect(() => {
  //     if (markerRef.current) {
  //       markerRef.current.openPopup(); // Automatically open popup
  //       setTimeout(() => {
  //         markerRef.current.closePopup(); // Close popup after 3 seconds
  //       }, 3000);
  //     }
  //   }, [map, markerRef]);

  //   return null;
  // };

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
        <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%" }} whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
        }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          <MarkerClusterGroup>
          {filteredTemples.map((temple) => (
            <Marker
              key={temple.id}
              position={[temple.lat, temple.lng]}
              eventHandlers={{
                click: () => {
                  setSelectedTemple(temple);
                  if (mapRef.current) {
                     mapRef.current.flyTo([temple.lat, temple.lng], 12, {
                     animate: true,
                     });
                  }
                },
                // mouseover: (e) => {
                //   e.target.openPopup(); // Show popup on hover
                // },
                // mouseout: (e) => {
                //   e.target.closePopup(); // Hide popup when mouse leaves
                // },
              }}
            >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <div className="bg-white p-2 rounded-lg shadow-md text-gray-800 max-w-[300px] break-words">
                <div className="font-semibold text-sm whitespace-normal">{temple.name}</div>
                <div className="text-xs text-gray-600 whitespace-normal">{temple.street}, {temple.city}, {temple.state} {temple.postalCode}</div>
                <div className="mt-1 text-[10px] text-gray-500">
                  {temple.lat.toFixed(4)}, {temple.lng.toFixed(4)}
                </div>
              </div>
            </Tooltip>

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
                        <p className="text-sm text-muted-foreground">{temple.street}, {temple.city}, {temple.state} {temple.postalCode}</p>
                        <div className="text-sm text-muted-foreground">
                          <a
                            href={temple.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {temple.website}
                          </a>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {temple.lat.toFixed(4)}, {temple.lng.toFixed(4)}
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
          </MarkerClusterGroup>

        {/*          
            {userLocation && (
            <Marker position={userLocation} ref={markerRef}>
              <Popup>You are here</Popup>
              <PopupControl markerRef={markerRef} />
            </Marker>
            )} 
        */}
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
