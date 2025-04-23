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

      return {
        id: resource.id,
        name: resource.name || "Unnamed Temple",
        address: {
          street: address.line1,
          city: address.city,
          state: address.state,
          postcode: address.zipcode,
        },
        lat: null, // Add lat/lon if available from the dataset
        lon: null,
        website: contact.website,
        phone: contact.phone?.[0]?.number || null,
        denomination: null, // Add denomination if available
        hoursOpen: resource.hoursOpen || null,
        imageURL: resource.imageURL || null,
        detailURL: entry.detailURL || null,
        sponsored: resource.sponsored || false,
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
