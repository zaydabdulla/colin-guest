import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const awb = searchParams.get('awb');
  
  if (!awb) {
    return NextResponse.json({ error: 'Missing AWB tracking number' }, { status: 400 });
  }

  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Delhivery API token not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}`,
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
    
    // Check if ShipmentData array has elements
    const shipment = data.ShipmentData?.[0]?.Shipment;

    if (!shipment) {
      return NextResponse.json({ found: false });
    }

    // Format the scans for easy UI consumption
    const scans = shipment.Scans?.map((s: any) => ({
      status: s.ScanDetail?.Scan,
      location: s.ScanDetail?.Location || s.ScanDetail?.ScannedLocation || '',
      dateTime: s.ScanDetail?.DateTime || s.ScanDetail?.ScanDateTime || '',
      instructions: s.ScanDetail?.Instructions || ''
    })) || [];

    // Sort scans chronologically (latest scan last or first, we will return sorted latest first)
    const sortedScans = [...scans].sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });

    return NextResponse.json({
      found: true,
      awb: shipment.AWB,
      status: shipment.Status?.Status,
      statusDateTime: shipment.Status?.StatusDateTime,
      instructions: shipment.Status?.Instructions,
      scans: sortedScans
    });

  } catch (error) {
    console.error("Delhivery Tracking API error:", error);
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
  }
}
