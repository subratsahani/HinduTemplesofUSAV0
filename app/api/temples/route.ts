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

      // Format complete address for geocoding
      const formattedAddress = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.zipcode,
        address.country || "USA"
      ].filter(Boolean).join(', ');

      return {
        id: resource.id,
        name: resource.name || "Unnamed Temple",
        address: formattedAddress, // Single formatted address string for display
        physicalAddress: address, // Keep original structure for reference
        state: address.state || "Unknown", // Extract state for filtering
        latitude: null, // Will be filled by geocoding
        longitude: null, // Will be filled by geocoding
        website: contact.website,
        phone: contact.phone?.[0]?.number || null,
        hoursOpen: resource.hoursOpen || null,
        image: resource.imageURL || "/placeholder.svg?height=200&width=300",
        detailURL: entry.detailURL || null,
        sponsored: resource.sponsored || false,
        googleMapsLink: null // Will be generated after geocoding
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
