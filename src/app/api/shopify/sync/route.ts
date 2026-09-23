import { NextResponse } from 'next/server';
import { adminSaveSyncData, adminGetSyncData } from '@/app/actions/shopify';
import { checkRateLimit } from '@/lib/rate-limit';
import { getCustomer } from '@/lib/shopify';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, email: requestedEmail, wishlist, cart } = body;

    // Rate Limit Check
    const rateLimitResponse = await checkRateLimit(request, { userId: customerId || requestedEmail });
    if (rateLimitResponse) return rateLimitResponse;

    if (!customerId && !requestedEmail) {
      return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
    }

    // Authorization Check:
    // 1. Check Storefront Bearer Token (if provided)
    let authenticatedEmail = requestedEmail;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    let isAuthorized = false;

    if (token && token !== 'null' && token !== 'undefined') {
      const customer = await getCustomer(token);
      if (customer && (!customerId || customer.id === customerId)) {
        isAuthorized = true;
        authenticatedEmail = customer.email || authenticatedEmail;
      }
    }

    // 2. Fallback: Check NextAuth Session (for Google OAuth users)
    if (!isAuthorized) {
      const session = await auth();
      if (session?.user?.email) {
        if (!requestedEmail || session.user.email.toLowerCase() === requestedEmail.toLowerCase()) {
          isAuthorized = true;
          authenticatedEmail = session.user.email;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Invalid credentials or session' }, { status: 401 });
    }

    const result = await adminSaveSyncData(authenticatedEmail, customerId, wishlist, cart);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || undefined;
    const requestedEmail = searchParams.get('email') || undefined;

    // Rate Limit Check
    const rateLimitResponse = await checkRateLimit(request, { userId: customerId || requestedEmail });
    if (rateLimitResponse) return rateLimitResponse;

    if (!customerId && !requestedEmail) {
      return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
    }

    // Authorization Check:
    // 1. Check Storefront Bearer Token (if provided)
    let authenticatedEmail = requestedEmail;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    let isAuthorized = false;

    if (token && token !== 'null' && token !== 'undefined') {
      const customer = await getCustomer(token);
      if (customer && (!customerId || customer.id === customerId)) {
        isAuthorized = true;
        authenticatedEmail = customer.email || authenticatedEmail;
      }
    }

    // 2. Fallback: Check NextAuth Session (for Google OAuth users)
    if (!isAuthorized) {
      const session = await auth();
      if (session?.user?.email) {
        if (!requestedEmail || session.user.email.toLowerCase() === requestedEmail.toLowerCase()) {
          isAuthorized = true;
          authenticatedEmail = session.user.email;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Invalid credentials or session' }, { status: 401 });
    }

    const userData = await adminGetSyncData(authenticatedEmail || '', customerId);
    return NextResponse.json(userData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
