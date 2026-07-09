import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function getTransitDays(stateCode?: string): { minDays: number; maxDays: number; label: string } {
  if (!stateCode) return { minDays: 3, maxDays: 5, label: '3-5 business days' };
  
  const code = stateCode.toUpperCase();
  
  // Local (Kerala)
  if (code === 'KL') {
    return { minDays: 2, maxDays: 3, label: '2-3 business days' };
  }
  
  // South India Regional (Tamil Nadu, Karnataka, Andhra Pradesh, Telangana, Goa, Pondicherry)
  const southIndia = ['TN', 'KA', 'AP', 'TG', 'GA', 'PY'];
  if (southIndia.includes(code)) {
    return { minDays: 3, maxDays: 4, label: '3-4 business days' };
  }
  
  // Remote / North-East / J&K / Islands
  const remoteStates = ['JK', 'AR', 'AS', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR', 'AN', 'LD', 'HP', 'UT'];
  if (remoteStates.includes(code)) {
    return { minDays: 7, maxDays: 10, label: '7-10 business days' };
  }
  
  // Standard National (Rest of India - UP, Delhi, Maharashtra, Karnataka, etc.)
  return { minDays: 5, maxDays: 7, label: '5-7 business days' };
}

export async function GET(request: Request) {
  // Rate Limit Check (max 30 requests/minute per IP)
  const rateLimitResponse = await checkRateLimit(request, {
    ipConfig: { limit: 30, windowMs: 60 * 1000 }
  });
  if (rateLimitResponse) return rateLimitResponse;

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
    const isCod = item.cod === 'Y' || item.cod === true || String(item.cod).toLowerCase() === 'true';
    const isPrepaid = item.pre_paid === 'Y' || item.pre_paid === true || String(item.pre_paid).toLowerCase() === 'true';
    const isServiceable = isPrepaid || isCod || item.is_serviceable === 'Y' || item.is_serviceable === true;

    const transit = getTransitDays(item.state_code);

    return NextResponse.json({
      deliverable: isServiceable,
      cod: isCod,
      district: item.district,
      state: item.state_code,
      eta: transit.label,
      minDays: transit.minDays,
      maxDays: transit.maxDays
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Delhivery API error:", error);
    return NextResponse.json({ error: 'Failed to verify pincode' }, { status: 500 });
  }
}
