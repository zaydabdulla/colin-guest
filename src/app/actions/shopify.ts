"use server";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

async function getAdminToken() {
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


export async function adminAddAddress(email: string, address: any) {
  if (!domain || !clientId || !clientSecret) {
    return { success: false, error: "Shopify Admin API is not configured. Please add SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET to .env.local" };
  }

  try {
    const adminToken = await getAdminToken();

    // 1. Find customer ID by email
    const findQuery = `
      query {
        customers(first: 1, query: "email:${email}") {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const findResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({ query: findQuery }),
    });

    const findData = await findResponse.json();
    let customerId = findData.data?.customers?.edges[0]?.node?.id;

    // 2. If customer doesn't exist, CREATE them
    if (!customerId) {
      const createMutation = `
        mutation customerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id }
            userErrors { message }
          }
        }
      `;

      const createResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({
          query: createMutation,
          variables: {
            input: {
              email: email,
              firstName: address.firstName || "",
              lastName: address.lastName || "",
              acceptsMarketing: false
            }
          }
        }),
      });

      const createData = await createResponse.json();
      console.log("Customer Create Response:", JSON.stringify(createData, null, 2));
      customerId = createData.data?.customerCreate?.customer?.id;

      if (!customerId) {
        return { 
          success: false, 
          error: createData.data?.customerCreate?.userErrors[0]?.message || `Could not link account. Response: ${JSON.stringify(createData)}` 
        };
      }

    }

    // 3. Add address to customer
    const addQuery = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            addresses {
              id
              address1
              address2
              city
              province
              country
              zip
              phone
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const addResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: addQuery,
        variables: {
          input: {
            id: customerId,
            addresses: [address]
          }
        }
      }),
    });

    const addData = await addResponse.json();
    if (addData.data?.customerUpdate?.userErrors?.length > 0) {
      return { success: false, error: addData.data.customerUpdate.userErrors[0].message };
    }

    return { 
      success: true, 
      address: addData.data?.customerUpdate?.customer?.addresses?.slice(-1)[0] 
    };

  } catch (error: any) {
    console.error("Admin API error:", error);
    return { success: false, error: `Shopify Error: ${error.message || "Internal server error"}` };
  }

}
