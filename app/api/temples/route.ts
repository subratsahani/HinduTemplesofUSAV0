import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET handler for fetching temples
export async function GET() {
  try {
    // Path to your JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'hindutemples_usa.json');

    // Read and parse the JSON file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const temples = JSON.parse(fileData);

    // Return the parsed temple data directly
    return NextResponse.json({ temples });
  } catch (error) {
    console.error("Error fetching temple data:", error);
    return NextResponse.json(
      { error: "Failed to fetch temple data", details: error.message },
      { status: 500 }
    );
  }
}
