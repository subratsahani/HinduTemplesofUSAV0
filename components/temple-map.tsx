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
    street: "460 Rockbridge Rd NW",
    city: "Lilburn",
    state: "Georgia",
    countryCode: "US",
    postalCode: "30047",
    lat: 33.8896,
    lng: -84.143,
    phone: "",
    website: "",
    image: "/placeholder.svg?height=200&width=300"
  }
]

// Helper function to check if coordinates are valid
const hasValidCoordinates = (temple) => {
  const lat = parseFloat(temple.lat);
  const lng = parseFloat(temple.lng);
  
  // Check if lat and lng are valid numbers and in reasonable range
  return (
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

// Helper function to create Google Maps URL from coordinates or address
const createGoogleMapsUrl = (temple) => {
  // Check if coordinates are valid
  if (hasValidCoordinates(temple)) {
    return `https://maps.google.com/?q=${parseFloat(temple.lat)},${parseFloat(temple.lng)}`;
  }
  
  // Fall back to using the address
  const address = encodeURIComponent(
    `${temple.name}, ${temple.street}, ${temple.city}, ${temple.state} ${temple.postalCode}`
  );
  return `https://maps.google.com/?q=${address}`;
};

// Enhanced component to update map view when filters change
function MapUpdater({ center, temples, selectedState }) {
  const map = useMap()
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Initial setup on component mount
    if (!hasInitializedRef.current) {
      map.setView(center, 4) // Initial zoom level
      hasInitializedRef.current = true
      return
    }

    // If state is selected, zoom to that state's bounds
    if (selectedState) {
      // Filter temples for the selected state
      const stateTemples = temples.filter(temple => temple.state === selectedState && hasValidCoordinates(temple))
      
      if (stateTemples.length > 0) {
        // Create a bounds object from the filtered temples
        const bounds = L.latLngBounds(stateTemples.map(temple => [temple.lat, temple.lng]))
        
        // Fit the map to these bounds with some padding
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 10 // Prevent zooming in too close for states with few temples
        })
      }
    } else {
      // When "All States" is selected, zoom back out to the default view
      map.setView(center, 4)
    }
  }, [selectedState, temples, map, center])
  
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
  const defaultCenter = [39.8283, -98.5795] // fallback center
  const center = userLocation || defaultCenter // Use user location if available

  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    
    // Call your API route
    fetch('/api/temples')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Extract temples from the response
        const templeData = data.temples || data;
        
        // Process temples to ensure proper data types and validate coordinates
        const processedTemples = templeData.map((temple, index) => {
          // Parse coordinates while handling potential invalid values
          const lat = parseFloat(temple.lat);
          const lng = parseFloat(temple.lng);
          
          return {
            ...temple,
            id: temple.id || String(index + 1), // Add id if not present
            lat: isNaN(lat) ? 0 : lat, // Use 0 as fallback if invalid
            lng: isNaN(lng) ? 0 : lng, // Use 0 as fallback if invalid
            // Add image placeholder if not present
            image: temple.image || "/placeholder.svg?height=200&width=300",
            // Flag to indicate if it has valid coordinates for filtering
            hasValidCoordinates: hasValidCoordinates(temple)
          };
        });
        
        // Filter out temples with invalid coordinates to prevent map errors
        const validTemples = processedTemples.filter(temple => temple.hasValidCoordinates);
        
        console.log(`Found ${validTemples.length} temples with valid coordinates out of ${processedTemples.length} total`);
        
        if (validTemples.length === 0) {
          toast({
            title: "No Valid Temple Data",
            description: "None of the temples have valid coordinates. Check your data format.",
            variant: "destructive"
          });
        } else if (validTemples.length < processedTemples.length) {
          toast({
            title: "Some Invalid Temple Data",
            description: `${processedTemples.length - validTemples.length} temples were excluded due to invalid coordinates.`,
            variant: "warning"
          });
        }
        
        setTemples(validTemples);
        setFilteredTemples(validTemples);
        setStates(getUniqueStates(validTemples));
        setIsLoading(false);

        console.log('Data fetched from API');
      })
      .catch((error) => {
        console.error('Error fetching temples data:', error);
        toast({
          title: "Error Loading Temple Data",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
      });
  }, [toast]);

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
          temple.name.toLowerCase().includes(term) || 
          `${temple.street}, ${temple.city}, ${temple.state}`.toLowerCase().includes(term)
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
      </div>

      <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-md relative z-10">
        <MapContainer 
          center={center} 
          zoom={4} 
          style={{ height: "100%", width: "100%" }} 
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} temples={temples} selectedState={selectedState} />
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
              }}
            >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <div className="bg-white p-2 rounded-lg shadow-md text-gray-800 max-w-[300px] break-words">
                <div className="font-semibold text-sm whitespace-normal">{temple.name}</div>
                <div className="text-xs text-gray-600 whitespace-normal">
                  {temple.street}, {temple.city}, {temple.state} {temple.postalCode}
                </div>
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
                        <p className="text-sm text-muted-foreground">
                          {temple.street}, {temple.city}, {temple.state} {temple.postalCode}
                        </p>
                        {temple.phone && (
                          <p className="text-xs text-muted-foreground">
                            {temple.phone}
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
                            {temple.lat.toFixed(4)}, {temple.lng.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between mt-3">
                          <a
                            href={createGoogleMapsUrl(temple)}
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
        </MapContainer>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTemples.length} of {temples.length} temples
        {selectedState && (
          <span> in {selectedState}</span>
        )}
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
// "use client"

// import { useState, useEffect, useRef } from "react"
// import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet"
// import "leaflet/dist/leaflet.css"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent } from "@/components/ui/card"
// import { Search, MapPin } from "lucide-react"
// import L from "leaflet"
// import { useToast } from "@/components/ui/use-toast"
// import AdminEditModal from "./admin-edit-modal"
// import MarkerClusterGroup from 'react-leaflet-cluster';

// // Sample data - fallback in case JSON fetch fails
// const initialTemples = [
//   {
//     id: "1",
//     name: "BAPS Shri Swaminarayan Mandir",
//     street: "460 Rockbridge Rd NW",
//     city: "Lilburn",
//     state: "Georgia",
//     countryCode: "US",
//     postalCode: "30047",
//     lat: 33.8896,
//     lng: -84.143,
//     phone: "",
//     website: "",
//     image: "/placeholder.svg?height=200&width=300"
//   }
// ]

// // Helper function to check if coordinates are valid
// const hasValidCoordinates = (temple) => {
//   const lat = parseFloat(temple.lat);
//   const lng = parseFloat(temple.lng);
  
//   // Check if lat and lng are valid numbers and in reasonable range
//   return (
//     !isNaN(lat) && !isNaN(lng) &&
//     lat >= -90 && lat <= 90 &&
//     lng >= -180 && lng <= 180
//   );
// };

// // Helper function to create Google Maps URL from coordinates or address
// const createGoogleMapsUrl = (temple) => {
//   // Check if coordinates are valid
//   if (hasValidCoordinates(temple)) {
//     return `https://maps.google.com/?q=${parseFloat(temple.lat)},${parseFloat(temple.lng)}`;
//   }
  
//   // Fall back to using the address
//   const address = encodeURIComponent(
//     `${temple.name}, ${temple.street}, ${temple.city}, ${temple.state} ${temple.postalCode}`
//   );
//   return `https://maps.google.com/?q=${address}`;
// };

// // Component to recenter map when filters change
// function MapUpdater({ center }) {
//   const map = useMap()
//   const hasUpdatedRef = useRef(false)

//   useEffect(() => {
//     if (!hasUpdatedRef.current) {
//       map.setView(center, 4) // your initial zoom level
//       hasUpdatedRef.current = true
//     }
//   }, [center, map])
//   return null
// }

// // Fix for Leaflet icon in Next.js
// const fixLeafletIcon = () => {
//   // Only run on client side
//   if (typeof window !== "undefined") {
//     delete L.Icon.Default.prototype._getIconUrl
//     L.Icon.Default.mergeOptions({
//       iconUrl: "/marker-icon-om.png",
//       iconRetinaUrl: "/marker-icon-om.png",
//       shadowUrl: "/marker-shadow.png",
//       iconSize: [39, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowSize: [41, 41],
//     })
//   }
// }

// // Get all unique states from the temples data
// const getUniqueStates = (temples) => {
//   const states = temples.map((temple) => temple.state)
//   return [...new Set(states)].sort()
// }

// export default function TempleMap() {
//   const [temples, setTemples] = useState(initialTemples)
//   const [filteredTemples, setFilteredTemples] = useState(initialTemples)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedState, setSelectedState] = useState("")
//   const [selectedTemple, setSelectedTemple] = useState(null)
//   const [isAdmin, setIsAdmin] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [states, setStates] = useState(getUniqueStates(initialTemples))
//   const [isLoading, setIsLoading] = useState(true)

//   const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

//   const mapRef = useRef(null)
//   const { toast } = useToast()

//   // Center of USA
//   const defaultCenter = [39.8283, -98.5795] // fallback center
//   const center = userLocation || defaultCenter // Use user location if available

//   // Fix Leaflet icon issue
//   useEffect(() => {
//     fixLeafletIcon()
//   }, [])

//   useEffect(() => {
//     // Set loading state
//     setIsLoading(true);
    
//     // Call your API route
//     fetch('/api/temples')
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then((data) => {
//         // Extract temples from the response
//         const templeData = data.temples || data;
        
//         // Process temples to ensure proper data types and validate coordinates
//         const processedTemples = templeData.map((temple, index) => {
//           // Parse coordinates while handling potential invalid values
//           const lat = parseFloat(temple.lat);
//           const lng = parseFloat(temple.lng);
          
//           return {
//             ...temple,
//             id: temple.id || String(index + 1), // Add id if not present
//             lat: isNaN(lat) ? 0 : lat, // Use 0 as fallback if invalid
//             lng: isNaN(lng) ? 0 : lng, // Use 0 as fallback if invalid
//             // Add image placeholder if not present
//             image: temple.image || "/placeholder.svg?height=200&width=300",
//             // Flag to indicate if it has valid coordinates for filtering
//             hasValidCoordinates: hasValidCoordinates(temple)
//           };
//         });
        
//         // Filter out temples with invalid coordinates to prevent map errors
//         const validTemples = processedTemples.filter(temple => temple.hasValidCoordinates);
        
//         console.log(`Found ${validTemples.length} temples with valid coordinates out of ${processedTemples.length} total`);
        
//         if (validTemples.length === 0) {
//           toast({
//             title: "No Valid Temple Data",
//             description: "None of the temples have valid coordinates. Check your data format.",
//             variant: "destructive"
//           });
//         } else if (validTemples.length < processedTemples.length) {
//           toast({
//             title: "Some Invalid Temple Data",
//             description: `${processedTemples.length - validTemples.length} temples were excluded due to invalid coordinates.`,
//             variant: "warning"
//           });
//         }
        
//         setTemples(validTemples);
//         setFilteredTemples(validTemples);
//         setStates(getUniqueStates(validTemples));
//         setIsLoading(false);

//         console.log('Data fetched from API');
//       })
//       .catch((error) => {
//         console.error('Error fetching temples data:', error);
//         toast({
//           title: "Error Loading Temple Data",
//           description: error.message,
//           variant: "destructive"
//         });
//         setIsLoading(false);
//       });
//   }, [toast]);

//   // Handle state selection
//   const handleStateChange = (value) => {
//     // Explicitly handle the "all" case
//     if (value === "all") {
//       setSelectedState("")
//     } else {
//       setSelectedState(value)
//     }
//   }

//   // Filter temples based on search term and selected state
//   useEffect(() => {
//     if (temples.length === 0) return

//     let filtered = [...temples]

//     if (selectedState) {
//       filtered = filtered.filter((temple) => temple.state === selectedState)
//     }

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase()
//       filtered = filtered.filter(
//         (temple) => 
//           temple.name.toLowerCase().includes(term) || 
//           `${temple.street}, ${temple.city}, ${temple.state}`.toLowerCase().includes(term)
//       )
//     }

//     setFilteredTemples(filtered)
//   }, [searchTerm, selectedState, temples])

//   // Handle temple update from admin
//   const handleTempleUpdate = (updatedTemple) => {
//     setTemples(temples.map((temple) => (temple.id === updatedTemple.id ? updatedTemple : temple)))
//     setIsEditModalOpen(false)
//     toast({
//       title: "Temple Updated",
//       description: `${updatedTemple.name} has been updated successfully.`,
//     })
//   }

//   if (isLoading) {
//     return (
//       <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-md flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <p className="text-lg font-medium">Loading Temple Data...</p>
//           <p className="text-sm text-muted-foreground">Please wait while we load the temple locations</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col space-y-4">
//       <div className="flex flex-col md:flex-row gap-4 relative z-20">
//         <div className="flex-1 relative">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search temples by name or address..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-8"
//           />
//         </div>

//         <Select value={selectedState || "all"} onValueChange={handleStateChange}>
//           <SelectTrigger className="w-full md:w-[200px]">
//             <SelectValue placeholder="Filter by state" />
//           </SelectTrigger>
//           <SelectContent className="z-50">
//             <SelectItem value="all">All States</SelectItem>
//             {states.map((state) => (
//               <SelectItem key={state} value={state}>
//                 {state}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-md relative z-10">
//         <MapContainer 
//           center={center} 
//           zoom={4} 
//           style={{ height: "100%", width: "100%" }} 
//           whenCreated={(mapInstance) => {
//             mapRef.current = mapInstance;
//           }}
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           <MapUpdater center={center} />
//           <MarkerClusterGroup>
//           {filteredTemples.map((temple) => (
//             <Marker
//               key={temple.id}
//               position={[temple.lat, temple.lng]}
//               eventHandlers={{
//                 click: () => {
//                   setSelectedTemple(temple);
//                   if (mapRef.current) {
//                      mapRef.current.flyTo([temple.lat, temple.lng], 12, {
//                      animate: true,
//                      });
//                   }
//                 },
//               }}
//             >
//             <Tooltip direction="top" offset={[0, -20]} opacity={1}>
//               <div className="bg-white p-2 rounded-lg shadow-md text-gray-800 max-w-[300px] break-words">
//                 <div className="font-semibold text-sm whitespace-normal">{temple.name}</div>
//                 <div className="text-xs text-gray-600 whitespace-normal">
//                   {temple.street}, {temple.city}, {temple.state} {temple.postalCode}
//                 </div>
//                 <div className="mt-1 text-[10px] text-gray-500">
//                   {temple.lat.toFixed(4)}, {temple.lng.toFixed(4)}
//                 </div>
//               </div>
//             </Tooltip>

//               <Popup>
//                 <Card className="w-[250px] border-0 shadow-none">
//                   <CardContent className="p-0">
//                     <div className="space-y-2">
//                       <img
//                         src={temple.image || "/placeholder.svg"}
//                         alt={temple.name}
//                         className="w-full h-[150px] object-cover rounded-t-lg"
//                       />
//                       <div className="p-2">
//                         <h3 className="font-bold text-lg">{temple.name}</h3>
//                         <p className="text-sm text-muted-foreground">
//                           {temple.street}, {temple.city}, {temple.state} {temple.postalCode}
//                         </p>
//                         {temple.phone && (
//                           <p className="text-xs text-muted-foreground">
//                             {temple.phone}
//                           </p>
//                         )}
//                         {temple.website && (
//                           <div className="text-sm text-muted-foreground">
//                             <a
//                               href={temple.website}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-xs text-blue-600 hover:underline"
//                             >
//                               {temple.website}
//                             </a>
//                           </div>
//                         )}
//                         <div className="flex items-center text-xs text-muted-foreground mt-1">
//                           <MapPin className="h-3 w-3 mr-1" />
//                           <span>
//                             {temple.lat.toFixed(4)}, {temple.lng.toFixed(4)}
//                           </span>
//                         </div>
//                         <div className="flex justify-between mt-3">
//                           <a
//                             href={createGoogleMapsUrl(temple)}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-xs text-blue-600 hover:underline"
//                           >
//                             View on Google Maps
//                           </a>

//                           {isAdmin && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 setSelectedTemple(temple)
//                                 setIsEditModalOpen(true)
//                               }}
//                               className="text-xs h-7 px-2"
//                             >
//                               Edit
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Popup>
//             </Marker>
//           ))}
//           </MarkerClusterGroup>
//         </MapContainer>
//       </div>

//       <div className="text-sm text-muted-foreground">
//         Showing {filteredTemples.length} of {temples.length} temples
//       </div>

//       {isEditModalOpen && selectedTemple && (
//         <AdminEditModal
//           temple={selectedTemple}
//           onSave={handleTempleUpdate}
//           onCancel={() => setIsEditModalOpen(false)}
//         />
//       )}
//     </div>
//   )
// }
