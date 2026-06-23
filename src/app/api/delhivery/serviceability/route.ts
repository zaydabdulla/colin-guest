import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode');
  
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: 'Invalid Pincode' }, { status: 400 });
  }

  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Delhivery token not configured' }, { status: 500 });
  }

  try {
    // Delhivery Pincode Serviceability API
    const response = await fetch(
      `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`,
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Delhivery API response error' }, { status: response.status });
    }

    const data = await response.json();
    const item = data.delivery_codes?.[0]?.postal_code;

    if (!item) {
      return NextResponse.json({ deliverable: false, cod: false });
    }

    // Handle both boolean and "Y"/"N" format representation from Delhivery's API
    const isServiceable = item.is_serviceable === true || item.is_serviceable === 'Y' || String(item.is_serviceable).toLowerCase() === 'true';
    const isCod = item.cod === true || item.cod === 'Y' || String(item.cod).toLowerCase() === 'true';

    return NextResponse.json({
      deliverable: isServiceable,
      cod: isCod,
      district: item.district,
      state: item.state_code,
      eta: '3-5 business days'
    });
  } catch (error) {
    console.error("Delhivery API error:", error);
    return NextResponse.json({ error: 'Failed to verify pincode' }, { status: 500 });
  }
}
