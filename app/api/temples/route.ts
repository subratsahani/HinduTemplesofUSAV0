import axios from 'axios';

// GET handler for fetching temples
export async function GET() {

  try {
    // Path to your GeoJSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'hindu-temples-usa.geojson');
    
    // Read the file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const geoJson = JSON.parse(fileData);
    
    // Transform GeoJSON features to your temple format
    const temples = geoJson.features.map(feature => {
      const props = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;
      
      return {
        id: props.id || `temple-${Math.random().toString(36).substr(2, 9)}`,
        type: props.type || "node",
        name: props.name || "Unnamed Temple",
        address: {
          street: props.address?.street,
          city: props.address?.city,
          state: props.address?.state,
          postcode: props.address?.postcode
        },
        lat: lat,
        lon: lon,
        website: props.website,
        phone: props.phone,
        denomination: props.denomination
      };
    });
    
    return NextResponse.json({ temples });
  } catch (error) {
    console.error("Error fetching temple data:", error);
    return NextResponse.json(
      { error: "Failed to fetch temple data", details: error.message }, 
      { status: 500 }
    );
  }
  // try {
  //   // Modified query to ensure it returns all Hindu temples in the USA
  //   const query = `
  //     [out:json][timeout:180];
  //     // First get the USA boundary
  //     area["ISO3166-1"="US"][boundary=administrative]->.usa;
  //     // Then find all places of worship with Hindu religion inside that area
  //     (
  //       node["amenity"="place_of_worship"]["religion"="hindu"](area.usa);
  //       way["amenity"="place_of_worship"]["religion"="hindu"](area.usa);
  //       relation["amenity"="place_of_worship"]["religion"="hindu"](area.usa);
  //     );
  //     // Include additional details and output
  //     out body center;
  //     >;
  //     out skel qt;
  //   `;
    
  //   console.log("Sending query to Overpass API...");
    
  //   const response = await axios.get(
  //     `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
  //     { 
  //       headers: { 'Accept': 'application/json' },
  //       timeout: 60000 // Increased timeout to 60 seconds
  //     }
  //   );
    
  //   console.log(`Received ${response.data.elements.length} elements from Overpass API`);
    
  //   if (!response.data.elements || response.data.elements.length === 0) {
  //     console.warn("No temple data returned from API");
  //     return NextResponse.json({ temples: [] });
  //   }
    
  //   const temples = response.data.elements.map(element => {
  //     // Extract relevant information
  //     const position = element.center || element;
  //     return {
  //       id: element.id,
  //       type: element.type,
  //       name: element.tags?.name || "Unnamed temple",
  //       address: {
  //         street: element.tags?.["addr:street"],
  //         housenumber: element.tags?.["addr:housenumber"],
  //         city: element.tags?.["addr:city"],
  //         state: element.tags?.["addr:state"],
  //         postcode: element.tags?.["addr:postcode"]
  //       },
  //       lat: position.lat,
  //       lon: position.lon,
  //       website: element.tags?.website,
  //       phone: element.tags?.phone,
  //       denomination: element.tags?.denomination
  //     };
  //   });
    
  //   console.log(`Processed ${temples.length} temples`);
    
  //   return NextResponse.json({ temples });
  // } catch (error) {
  //   console.error("Error fetching Hindu temples:", error);
  //   return NextResponse.json({ error: "Failed to fetch temple data", details: error.message }, { status: 500 });
  // }
}
