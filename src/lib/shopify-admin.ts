import "server-only";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

export async function getAdminToken() {
  if (!domain || !clientId || !clientSecret) {
    throw new Error("Shopify Admin credentials missing in .env.local");
  }

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange failed:", errorText);
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}
