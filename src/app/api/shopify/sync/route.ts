import { NextResponse } from 'next/server';
import { syncWishlist, getWishlist, getAdminToken } from '@/app/actions/shopify';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

// Helper to get customer data from Shopify Metafields
async function getShopifySyncData(customerId: string) {
  try {
    const adminToken = await getAdminToken();
    const query = `
      query {
        customer(id: "${customerId}") {
          wishlist: metafield(namespace: "custom", key: "wishlist") { value }
          cart: metafield(namespace: "custom", key: "cart") { value }
        }
      }
    `;

    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log("Shopify Sync GET Response:", JSON.stringify(data, null, 2));
    
    const wishlist = data.data?.customer?.wishlist?.value;
    const cart = data.data?.customer?.cart?.value;

    return {
      wishlist: wishlist ? JSON.parse(wishlist) : [],
      cart: cart ? JSON.parse(cart) : []
    };
  } catch (error) {
    console.error("Shopify Sync GET Error:", error);
    return { wishlist: [], cart: [] };
  }
}

// Helper to save customer data to Shopify Metafields
async function saveShopifySyncData(customerId: string, wishlist: any[], cart: any[]) {
  try {
    const adminToken = await getAdminToken();
    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { message }
        }
      }
    `;

    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: customerId,
            metafields: [
              { namespace: "custom", key: "wishlist", value: JSON.stringify(wishlist), type: "json" },
              { namespace: "custom", key: "cart", value: JSON.stringify(cart), type: "json" }
            ]
          }
        }
      }),
    });

    const data = await response.json();
    console.log("Shopify Sync POST Response:", JSON.stringify(data, null, 2));
    return data.data?.customerUpdate?.userErrors?.length === 0;
  } catch (error) {
    console.error("Shopify Sync POST Error:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, wishlist, cart } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const success = await saveShopifySyncData(customerId, wishlist, cart);
    
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const userData = await getShopifySyncData(customerId);
    return NextResponse.json(userData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
