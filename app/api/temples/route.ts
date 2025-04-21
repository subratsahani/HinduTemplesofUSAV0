import axios from 'axios';

// GET handler for fetching temples
export async function GET() {
  try {
    const query = `
      [out:json][timeout:25];
      area["ISO3166-1"="US"][boundary=administrative];
      (
        node["amenity"="place_of_worship"]["religion"="hindu"](area);
        way["amenity"="place_of_worship"]["religion"="hindu"](area);
        relation["amenity"="place_of_worship"]["religion"="hindu"](area);
      );
      out center;
    `;
    
    const response = await axios.get(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { 
        headers: { 'Accept': 'application/json' },
        timeout: 30000
      }
    );
    
    const temples = response.data.elements.map(element => {
      // Extract relevant information
      const position = element.center || element;
      return {
        id: element.id,
        type: element.type,
        name: element.tags?.name || "Unnamed temple",
        address: {
          street: element.tags?.["addr:street"],
          housenumber: element.tags?.["addr:housenumber"],
          city: element.tags?.["addr:city"],
          state: element.tags?.["addr:state"],
          postcode: element.tags?.["addr:postcode"]
        },
        lat: position.lat,
        lon: position.lon,
        website: element.tags?.website,
        phone: element.tags?.phone,
        denomination: element.tags?.denomination
      };
    });
    
    return NextResponse.json({ temples });
  } catch (error) {
    console.error("Error fetching Hindu temples:", error);
    return NextResponse.json({ error: "Failed to fetch temple data" }, { status: 500 });
  }
}
