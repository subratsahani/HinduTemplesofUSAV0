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

// Helper function to add a delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
  const [geocodingProgress, setGeocodingProgress] = useState(0)

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  
  const mapRef = useRef(null)
  const { toast } = useToast()

  // Default center of USA
  const defaultCenter = [39.8283, -98.5795] // fallback center
  const center = userLocation || defaultCenter

  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon()    
  }, [])
  
  // Geocode function with rate limiting and error handling
  const geocodeAddress = async (address) => {
    if (!address) return null;
    
    try {
      // Ensure we don't have any weird placeholder values in the address
      const cleanAddress = address.replace(/{{.*?}}/g, "").replace(/\s+/g, " ").trim();
      
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Geocoding error for address "${address}":`, error);
      return null;
    }
  }
  
  // Batch geocoding with rate limiting
  const batchGeocodeAddresses = async (temples) => {
    const result = [];
    const total = temples.length;
    
    // Process in small batches to avoid rate limiting
    for (let i = 0; i < temples.length; i++) {
      const temple = temples[i];
      
      // If temple already has coordinates, use them
      if (temple.latitude && temple.longitude) {
        result.push({
          ...temple,
          googleMapsLink: `https://maps.google.com/?q=${temple.latitude},${temple.longitude}`
        });
        
        // Update progress
        setGeocodingProgress(Math.round(((i + 1) / total) * 100));
        continue;
      }
      
      // If not, try to geocode
      try {
        // Add a delay to respect rate limits (1 request per second is safe for Nominatim)
        await delay(1000);
        
        const coords = await geocodeAddress(temple.address);
        
        if (coords) {
          result.push({
            ...temple,
            latitude: coords.latitude,
            longitude: coords.longitude,
            googleMapsLink: `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
          });
        } else {
          // Keep the temple even without coordinates
          result.push(temple);
        }
        
        // Update progress
        setGeocodingProgress(Math.round(((i + 1) / total) * 100));
      } catch (error) {
        // Keep the temple in the list even if geocoding fails
        result.push(temple);
        console.error(`Failed to geocode temple ${temple.name}:`, error);
        
        // Update progress
        setGeocodingProgress(Math.round(((i + 1) / total) * 100));
      }
    }
    
    return result;
  }
  
  useEffect(() => {
    const fetchTempleData = async () => {
      // Set loading state
      setIsLoading(true);
      setGeocodingProgress(0);
      
      try {
        // Call API route to get temple data
        const response = await fetch('/api/temples');
        
        if (!response.ok) {
          throw new Error('API response was not ok');
        }
        
        const data = await response.json();
        const templeData = data.temples || data;
        
        if (!Array.isArray(templeData) || templeData.length === 0) {
          throw new Error('No temple data received');
        }
        
        // First update with raw data to show something
        setTemples(templeData);
        setFilteredTemples(templeData);
        setStates(getUniqueStates(templeData));
        
        // Display message about geocoding
        toast({
          title: "Geocoding temple addresses",
          description: "This may take a moment as we process the locations.",
        });
        
        // Start geocoding in the background
        const geocodedTemples = await batchGeocodeAddresses(templeData);
        
        // Update with geocoded data
        const validTemples = geocodedTemples.filter(temple => temple.latitude && temple.longitude);
        
        setTemples(geocodedTemples);
        setFilteredTemples(geocodedTemples);
        setStates(getUniqueStates(geocodedTemples));
        
        if (validTemples.length < geocodedTemples.length) {
          toast({
            title: "Geocoding complete",
            description: `${validTemples.length} of ${geocodedTemples.length} temples were successfully geocoded.`,
          });
        } else {
          toast({
            title: "Geocoding complete",
            description: `All ${geocodedTemples.length} temples were successfully geocoded.`,
          });
        }
      } catch (error) {
        console.error('Error fetching or processing temple data:', error);
        
        // Use initial data as fallback
        setTemples(initialTemples);
        setFilteredTemples(initialTemples);
        
        toast({
          title: "Error loading temples",
          description: "Using default data instead. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setGeocodingProgress(0);
      }
    };
    
    fetchTempleData();
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
        (temple) => 
          temple.name?.toLowerCase().includes(term) || 
          temple.address?.toLowerCase().includes(term)
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
          {geocodingProgress > 0 && (
            <div className="mt-2">
              <div className="w-48 h-2 mx-auto bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${geocodingProgress}%` }}
                />
              </div>
              <p className="text-sm mt-1 text-muted-foreground">
                Geocoding: {geocodingProgress}% complete
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we load the temple locations
          </p>
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
              temple.latitude && temple.longitude ? (
                <Marker
                  key={temple.id}
                  position={[temple.latitude, temple.longitude]}
                  eventHandlers={{
                    click: () => {
                      setSelectedTemple(temple);
                      if (mapRef.current) {
                         mapRef.current.flyTo([temple.latitude, temple.longitude], 12, {
                         animate: true,
                         });
                      }
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                    <div className="bg-white p-2 rounded-lg shadow-md text-gray-800 max-w-[300px] break-words">
                      <div className="font-semibold text-sm whitespace-normal">{temple.name}</div>
                      <div className="text-xs text-gray-600 whitespace-normal">{temple.address}</div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        {temple.latitude != null && temple.longitude != null
                        ? `${temple.latitude.toFixed(4)}, ${temple.longitude.toFixed(4)}`
                        : "Location not available"}
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
                            <p className="text-sm text-muted-foreground">{temple.address}</p>
                            {temple.hoursOpen && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Hours: {temple.hoursOpen}
                              </p>
                            )}
                            {temple.website && (
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
                            )}
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {temple.latitude != null && temple.longitude != null
                                ? `${temple.latitude.toFixed(4)}, ${temple.longitude.toFixed(4)}`
                                : "Location not available"}
                              </span>
                            </div>
                            <div className="flex justify-between mt-3">
                              {temple.googleMapsLink && (
                                <a
                                  href={temple.googleMapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View on Google Maps
                                </a>
                              )}

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
              ) : null
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTemples.filter(t => t.latitude && t.longitude).length} of {temples.filter(t => t.latitude && t.longitude).length} temples with valid locations
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
