import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET handler for fetching temples
export async function GET() {
  try {
    // Path to your JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'hindutemples_usa.json');

    // Read the file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const rawData = JSON.parse(fileData);

    // Transform data to your temple format
    const temples = rawData.map((entry: any) => {
      const resource = entry.resource || {};
      const address = resource.physicalAddress || {};
      const contact = resource.contact || {};

      // Format the address more carefully to avoid issues with the geocoder
      // Clean up any empty values, remove potential placeholders
      const addressParts = [
        address.line1 || "",
        address.line2 || "",
        address.city || "",
        address.state || "",
        address.zipcode || "",
        "USA" // Explicitly add USA for better geocoding results
      ].filter(part => part && !part.includes("{{") && !part.includes("}}") && part.trim() !== "");

      const formattedAddress = addressParts.join(', ');

      return {
        id: resource.id || String(Math.random()),
        name: resource.name || "Unnamed Temple",
        address: formattedAddress,
        state: address.state || "Unknown",
        latitude: null,
        longitude: null,
        website: contact.website || null,
        phone: contact.phone?.[0]?.number || null,
        hoursOpen: resource.hoursOpen || null,
        image: resource.imageURL || "/placeholder.svg?height=200&width=300",
        detailURL: entry.detailURL || null,
        sponsored: resource.sponsored || false,
        googleMapsLink: null
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
}
