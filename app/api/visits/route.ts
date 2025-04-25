// File: app/api/visits/route.ts
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Path to the visits file
const visitsFilePath = path.join(process.cwd(), 'public', 'data', 'visits.json');

// Ensure the data directory exists
function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Get current visits count
function getVisits() {
  ensureDataDirectoryExists();
  
  try {
    if (fs.existsSync(visitsFilePath)) {
      const data = fs.readFileSync(visitsFilePath, 'utf8');
      return JSON.parse(data).visits;
    } else {
      // Create file with initial count if it doesn't exist
      const initialData = { visits: 0 };
      fs.writeFileSync(visitsFilePath, JSON.stringify(initialData), 'utf8');
      return 0;
    }
  } catch (error) {
    console.error('Error reading visits file:', error);
    return 0;
  }
}

// Increment visits count
function incrementVisits() {
  ensureDataDirectoryExists();
  
  try {
    let currentVisits = 0;
    
    if (fs.existsSync(visitsFilePath)) {
      const data = fs.readFileSync(visitsFilePath, 'utf8');
      currentVisits = JSON.parse(data).visits;
    }
    
    const newVisits = currentVisits + 1;
    fs.writeFileSync(visitsFilePath, JSON.stringify({ visits: newVisits }), 'utf8');
    return newVisits;
  } catch (error) {
    console.error('Error updating visits file:', error);
    return 0;
  }
}

// API handler for GET requests
export async function GET() {
  const visits = getVisits();
  return NextResponse.json({ visits });
}

// API handler for POST requests - increments the counter
export async function POST() {
  const newVisitCount = incrementVisits();
  return NextResponse.json({ visits: newVisitCount });
}
