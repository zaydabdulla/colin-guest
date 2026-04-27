import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Move DB to temp folder to prevent Next.js rebuild loops in development
const DB_PATH = path.join(os.tmpdir(), 'colin-guest-sync-db.json');

// Helper to read DB
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      console.log('Sync DB: File does not exist, initializing empty.');
      return {};
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Sync DB: Read Error:', error);
    return {};
  }
}

// Helper to write DB
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    console.log('Sync DB: Successfully written to disk.');
  } catch (error) {
    console.error('Sync DB: Write Error:', error);
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, wishlist, cart } = await request.json();

    if (!customerId) {
      console.error('Sync POST: Missing customerId in request body');
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const db = readDB();
    db[customerId] = {
      wishlist: wishlist || [],
      cart: cart || [],
      updatedAt: new Date().toISOString()
    };
    
    writeDB(db);

    console.log(`Sync POST: Saved data for ${customerId} (${(wishlist || []).length} items)`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sync POST: Catch Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      console.error('Sync GET: Missing customerId in query params');
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const db = readDB();
    const userData = db[customerId] || { wishlist: [], cart: [] };

    console.log(`Sync GET: Retrieved data for ${customerId}: ${userData.wishlist.length} wishlist items`);
    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Sync GET: Catch Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
