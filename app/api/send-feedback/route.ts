import { NextResponse } from "next/server"
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { templeName, address, state, latitude, longitude, submitterName, submitterEmail, additionalInfo } = data

    // In a production environment, you would use a service like SendGrid, Mailgun, etc.
    // For now, we'll just log the data and return a success response
    console.log("Feedback received:", {
      to: "sahani_90@rediffmail.com",
      subject: "New Temple Submission",
      body: `
        Temple Name: ${templeName}
        Address: ${address}
        State: ${state}
        Coordinates: ${latitude}, ${longitude}
        Submitted by: ${submitterName} (${submitterEmail})
        Additional Info: ${additionalInfo}
      `,
    })

    return NextResponse.json({ success: true, message: "Feedback received" })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return NextResponse.json({ success: false, message: "Failed to process feedback" }, { status: 500 })
  }
}

export default async function handler(req, res) {
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
    
    res.status(200).json({ temples });
  } catch (error) {
    console.error("Error fetching Hindu temples:", error);
    res.status(500).json({ error: "Failed to fetch temple data" });
  }
}
