"use server";

import { getAdminToken } from "@/lib/shopify-admin";
import { customerRecover } from "@/lib/shopify";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;


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
              lastName: address.lastName || ""
            }

          }
        }),
      });

      const createData = await createResponse.json();
      customerId = createData.data?.customerCreate?.customer?.id;

      if (!customerId) {
        return { 
          success: false, 
          error: createData.data?.customerCreate?.userErrors[0]?.message || "Could not link your Google account to Shopify." 
        };
      }


    }

    // 3. Add address to customer using specialized address create mutation
    const addQuery = `
      mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
        customerAddressCreate(customerId: $customerId, address: $address) {
          address {
            id
            address1
            address2
            city
            province
            country
            zip
            phone
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
          customerId: customerId,
          address: address
        }
      }),
    });
 
    const addData = await addResponse.json();
    if (addData.errors && addData.errors.length > 0) {
      console.error("Shopify GraphQL errors in customerAddressCreate:", addData.errors);
      return { success: false, error: addData.errors[0]?.message || "Shopify GraphQL error" };
    }
    if (addData.data?.customerAddressCreate?.userErrors?.length > 0) {
      return { success: false, error: addData.data.customerAddressCreate.userErrors[0].message };
    }
 
    const createdAddress = addData.data?.customerAddressCreate?.address;
    if (!createdAddress || !createdAddress.id) {
      return { success: false, error: "Shopify did not return a valid address." };
    }

    return { 
      success: true, 
      address: createdAddress
    };

  } catch (error: any) {
    console.error("Admin API error:", error);
    return { success: false, error: `Shopify Error: ${error.message || "Internal server error"}` };
  }
}

export async function adminUpdateAddress(email: string, addressId: string, address: any) {
  if (!domain || !clientId || !clientSecret) {
    return { success: false, error: "Shopify Admin API is not configured." };
  }

  try {
    const adminToken = await getAdminToken();

    // Find customer by email
    const findQuery = `query { customers(first: 1, query: "email:${email}") { edges { node { id } } } }`;
    const findResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query: findQuery }),
    });
    const findData = await findResponse.json();
    const customerId = findData.data?.customers?.edges[0]?.node?.id;
    if (!customerId) return { success: false, error: "Customer not found" };

    // Update the address using Admin API
    const updateMutation = `
      mutation customerAddressUpdate($customerId: ID!, $addressId: ID!, $address: MailingAddressInput!) {
        customerAddressUpdate(customerId: $customerId, addressId: $addressId, address: $address) {
          customerAddress {
            id
            address1
            address2
            city
            province
            country
            zip
            phone
          }
          userErrors { field message }
        }
      }
    `;

    const updateResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({
        query: updateMutation,
        variables: { customerId, addressId, address }
      }),
    });

    const updateData = await updateResponse.json();
    if (updateData.errors && updateData.errors.length > 0) {
      console.error("Shopify GraphQL errors in customerAddressUpdate:", updateData.errors);
      return { success: false, error: updateData.errors[0]?.message || "Shopify GraphQL error" };
    }
    if (updateData.data?.customerAddressUpdate?.userErrors?.length > 0) {
      return { success: false, error: updateData.data.customerAddressUpdate.userErrors[0].message };
    }

    const updatedAddress = updateData.data?.customerAddressUpdate?.customerAddress;
    if (!updatedAddress || !updatedAddress.id) {
      return { success: false, error: "Shopify did not return the updated address." };
    }

    return {
      success: true,
      address: updatedAddress
    };

  } catch (error: any) {
    console.error("Admin address update error:", error);
    return { success: false, error: `Shopify Error: ${error.message || "Internal server error"}` };
  }
}

export async function adminDeleteAddress(addressId: string, email?: string, explicitCustomerId?: string) {
  if (!domain || !clientId || !clientSecret) {
    return { success: false, error: "Shopify Admin API is not configured." };
  }

  try {
    const adminToken = await getAdminToken();

    // 1. Resolve customer ID
    let customerId = explicitCustomerId && explicitCustomerId.startsWith("gid://shopify/Customer/") 
      ? explicitCustomerId 
      : null;

    if (!customerId && email) {
      const findQuery = `query { customers(first: 1, query: "email:${email}") { edges { node { id } } } }`;
      const findResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
        body: JSON.stringify({ query: findQuery }),
      });
      const findData = await findResponse.json();
      customerId = findData.data?.customers?.edges[0]?.node?.id;
    }

    if (!customerId) {
      return { success: false, error: "Customer account could not be identified for address deletion." };
    }

    const deleteMutation = `
      mutation customerAddressDelete($addressId: ID!, $customerId: ID!) {
        customerAddressDelete(addressId: $addressId, customerId: $customerId) {
          deletedAddressId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const deleteResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({
        query: deleteMutation,
        variables: { addressId, customerId },
      }),
    });

    const deleteData = await deleteResponse.json();
    if (deleteData.errors && deleteData.errors.length > 0) {
      console.error("Shopify GraphQL errors in customerAddressDelete:", deleteData.errors);
      return { success: false, error: deleteData.errors[0]?.message || "Shopify GraphQL error" };
    }

    const payload = deleteData.data?.customerAddressDelete;
    if (payload?.userErrors && payload.userErrors.length > 0) {
      return { success: false, error: payload.userErrors[0].message };
    }

    return {
      success: true,
      deletedAddressId: payload?.deletedAddressId || addressId
    };

  } catch (error: any) {
    console.error("Admin address delete error:", error);
    return { success: false, error: `Shopify Error: ${error.message || "Internal server error"}` };
  }
}

export async function getOrCreateShopifyCustomer(email: string, firstName: string, lastName: string) {
  if (!domain || !clientId || !clientSecret) return { success: false };

  try {
    const adminToken = await getAdminToken();

    // 1. Find existing
    const findQuery = `query { customers(first: 1, query: "email:${email}") { edges { node { id } } } }`;
    const findResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query: findQuery }),
    });
    const findData = await findResponse.json();
    let customerId = findData.data?.customers?.edges[0]?.node?.id;

    // 2. Create if missing
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
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
        body: JSON.stringify({
          query: createMutation,
          variables: { input: { email, firstName, lastName } }
        }),
      });
      const createData = await createResponse.json();
      customerId = createData.data?.customerCreate?.customer?.id;
    }

    return { success: !!customerId, customerId };
  } catch (error) {
    console.error("Resolve customer error:", error);
    return { success: false };
  }
}

export async function adminGetCustomerData(email: string) {
  if (!domain || !clientId || !clientSecret) return { success: false };

  try {
    const adminToken = await getAdminToken();
    const query = `
      query {
        customers(first: 1, query: "email:${email}") {
          edges {
            node {
              id
              firstName
              lastName
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
          }
        }
      }
    `;

    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const customer = data.data?.customers?.edges[0]?.node;

    if (!customer) return { success: false };

    return { 
      success: true, 
      addresses: customer.addresses || [],
      firstName: customer.firstName,
      lastName: customer.lastName
    };
  } catch (error) {
    console.error("Admin Get Customer Data error:", error);
    return { success: false };
  }
}


export async function adminSaveSyncData(
  email: string,
  customerId?: string,
  wishlist: string[] = [],
  cart: any[] = []
) {
  if (!domain || !clientId || !clientSecret) return { success: false, error: "Missing Shopify configuration" };

  try {
    const adminToken = await getAdminToken();

    let targetCustomerId = customerId && customerId.startsWith('gid://shopify/Customer/') ? customerId : null;

    if (!targetCustomerId && email) {
      const findQuery = `query { customers(first: 1, query: "email:${email}") { edges { node { id } } } }`;
      const findResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
        body: JSON.stringify({ query: findQuery }),
      });
      const findData = await findResponse.json();
      targetCustomerId = findData.data?.customers?.edges[0]?.node?.id || null;
    }

    if (!targetCustomerId) {
      return { success: false, error: "Customer not found in Shopify" };
    }

    const updateMutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `;

    const updateResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({
        query: updateMutation,
        variables: {
          input: {
            id: targetCustomerId,
            metafields: [
              { namespace: "custom", key: "wishlist", value: JSON.stringify(wishlist), type: "json" },
              { namespace: "custom", key: "cart", value: JSON.stringify(cart), type: "json" }
            ]
          }
        }
      }),
    });

    const updateData = await updateResponse.json();
    const userErrors = updateData.data?.customerUpdate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("Admin save sync data userErrors:", userErrors);
      return { success: false, error: userErrors[0].message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Admin save sync data error:", error);
    return { success: false, error: error?.message || "Sync failed" };
  }
}

export async function adminGetSyncData(email: string, customerId?: string) {
  if (!domain || !clientId || !clientSecret) return { success: false, wishlist: [], cart: [] };

  try {
    const adminToken = await getAdminToken();

    let targetCustomerId = customerId && customerId.startsWith('gid://shopify/Customer/') ? customerId : null;

    let query = '';
    if (targetCustomerId) {
      query = `query {
        customer(id: "${targetCustomerId}") {
          wishlist: metafield(namespace: "custom", key: "wishlist") { value }
          cart: metafield(namespace: "custom", key: "cart") { value }
        }
      }`;
    } else if (email) {
      query = `query {
        customers(first: 1, query: "email:${email}") {
          edges {
            node {
              id
              wishlist: metafield(namespace: "custom", key: "wishlist") { value }
              cart: metafield(namespace: "custom", key: "cart") { value }
            }
          }
        }
      }`;
    } else {
      return { success: false, wishlist: [], cart: [] };
    }

    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const node = targetCustomerId ? data.data?.customer : data.data?.customers?.edges[0]?.node;

    if (!node) {
      return { success: false, wishlist: [], cart: [] };
    }

    const wishlistRaw = node.wishlist?.value;
    const cartRaw = node.cart?.value;

    return {
      success: true,
      wishlist: wishlistRaw ? JSON.parse(wishlistRaw) : [],
      cart: cartRaw ? JSON.parse(cartRaw) : []
    };
  } catch (error) {
    console.error("Admin get sync data error:", error);
    return { success: false, wishlist: [], cart: [] };
  }
}

export async function syncWishlist(email: string, productIds: string[]) {
  return adminSaveSyncData(email, undefined, productIds, []);
}

export async function getWishlist(email: string) {
  const result = await adminGetSyncData(email);
  return { success: result.success, productIds: result.wishlist };
}

export async function createDraftOrder(items: any[], customerInfo: any) {
  if (!domain || !clientId || !clientSecret) return { success: false, error: "Missing config" };

  try {
    const adminToken = await getAdminToken();
    
    const lineItems = items.map(item => {
      let variantId = item.variantId;
      
      // 1. If we have a variants array, find by size title
      if (!variantId && item.product?.variants && item.product.variants.length > 0) {
        const variant = item.product.variants.find((v: any) => v.title === item.size);
        if (variant) variantId = variant.id;
        
        // 2. If only one variant exists (One Size), use it as fallback
        if (!variantId && item.product.variants.length === 1) {
          variantId = item.product.variants[0].id;
        }
      }

      // 3. Log for debugging
      console.log(`DEBUG: Processing Order Item "${item.product?.title}" | Size: ${item.size} | Resolved VariantID: ${variantId}`);

      return {
        variantId: variantId,
        quantity: item.quantity
      };
    });

    // Filter out items with no variantId to avoid Shopify errors
    const validLineItems = lineItems.filter(li => li.variantId && li.variantId.includes('ProductVariant'));
    
    if (validLineItems.length === 0) {
      return { success: false, error: "No valid variants found. Please ensure sizes are selected correctly." };
    }

    const mutation = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email: customerInfo.email,
        lineItems: validLineItems,
        shippingAddress: {
          address1: customerInfo.address1,
          address2: customerInfo.address2 || "",
          city: customerInfo.city,
          province: customerInfo.province || "",
          zip: customerInfo.zip,
          country: customerInfo.country,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone || ""
        },
        note: "Order placed via Next.js Frontend (Test Mode)"
      }
    };

    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error("Shopify GraphQL Error:", data.errors);
      return { success: false, error: data.errors[0].message };
    }

    if (data.data?.draftOrderCreate?.userErrors?.length > 0) {
      console.error("Draft Order User Errors:", data.data.draftOrderCreate.userErrors);
      return { success: false, error: data.data.draftOrderCreate.userErrors[0].message };
    }

    return { 
      success: true, 
      orderId: data.data.draftOrderCreate.draftOrder.id,
      orderName: data.data.draftOrderCreate.draftOrder.name
    };

  } catch (error) {
    console.error("Draft Order Exception:", error);
    return { success: false, error: "Network or Server Error" };
  }
}

export async function getCustomerOrders(email: string) {
  if (!domain || !clientId || !clientSecret) return { success: false, error: "Missing config" };

  try {
    const adminToken = await getAdminToken();
    
    const query = `
      query getOrders($query: String!) {
        orders(first: 20, query: $query, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              tags
              note
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              displayFulfillmentStatus
              fulfillments(first: 2) {
                id
                trackingInfo {
                  company
                  number
                  url
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      image {
                        url
                      }
                      product {
                        handle
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({ 
        query, 
        variables: { query: `email:${email}` } 
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      return { success: false, error: data.errors[0].message };
    }

    const orders = data.data.orders.edges.map((edge: any) => {
      const tags: string[] = edge.node.tags || [];
      let returnStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | null = null;
      let returnType: 'EXCHANGE' | 'REFUND' | null = null;

      if (tags.some((t: string) => t.toLowerCase().includes('return completed') || t.toLowerCase().includes('refunded'))) {
        returnStatus = 'COMPLETED';
      } else if (tags.some((t: string) => t.toLowerCase().includes('return approved'))) {
        returnStatus = 'APPROVED';
      } else if (tags.some((t: string) => t.toLowerCase().includes('return rejected'))) {
        returnStatus = 'REJECTED';
      } else if (tags.some((t: string) => t.toLowerCase().includes('return requested'))) {
        returnStatus = 'PENDING_REVIEW';
      }

      if (tags.some((t: string) => t.toLowerCase().includes('type: exchange') || t.toLowerCase().includes('return: exchange'))) {
        returnType = 'EXCHANGE';
      } else if (tags.some((t: string) => t.toLowerCase().includes('type: refund') || t.toLowerCase().includes('return: refund'))) {
        returnType = 'REFUND';
      }

      return {
        id: edge.node.id,
        name: edge.node.name,
        date: edge.node.createdAt,
        total: edge.node.totalPriceSet.shopMoney.amount,
        currency: edge.node.totalPriceSet.shopMoney.currencyCode,
        status: edge.node.displayFulfillmentStatus,
        tags: tags,
        returnStatus,
        returnType,
        fulfillments: edge.node.fulfillments?.map((f: any) => ({
          company: f.trackingInfo?.[0]?.company || 'Delhivery',
          number: f.trackingInfo?.[0]?.number,
          url: f.trackingInfo?.[0]?.url || (f.trackingInfo?.[0]?.number ? `https://www.delhivery.com/track/package/${f.trackingInfo[0].number}` : null)
        })).filter((f: any) => f.number) || [],
        items: edge.node.lineItems.edges.map((li: any) => ({
          id: li.node.id,
          title: li.node.title,
          quantity: li.node.quantity,
          variantTitle: li.node.variant?.title || null,
          image: li.node.variant?.image?.url || null,
          handle: li.node.variant?.product?.handle || null
        }))
      };
    });

    return { success: true, orders };

  } catch (error) {
    return { success: false, error: "Failed to fetch orders" };
  }
}

export interface ReturnRequestItem {
  title: string;
  quantity: number;
  image?: string | null;
}

export interface ReturnRequestPayload {
  orderId: string;
  orderName: string;
  customerEmail: string;
  customerName?: string;
  returnType: 'EXCHANGE' | 'REFUND';
  reason: string;
  exchangeSize?: string;
  notes?: string;
  items: ReturnRequestItem[];
}

export async function requestOrderReturnAction(payload: ReturnRequestPayload) {
  if (!domain || !clientId || !clientSecret) {
    return { success: false, error: "Shopify Admin API not configured." };
  }

  try {
    // Rate limit check: max 10 requests per minute per IP for return requests
    const headersList = await headers();
    const mockRequest = new Request("http://localhost", { headers: headersList });
    const rateLimitResponse = await checkRateLimit(mockRequest, {
      ipConfig: { limit: 10, windowMs: 60 * 1000 }
    });
    if (rateLimitResponse) {
      return { success: false, error: "Too many return requests submitted. Please try again shortly." };
    }

    const adminToken = await getAdminToken();

    // 1. Fetch current order details (tags & existing note)
    const getOrderQuery = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          tags
          note
        }
      }
    `;

    const getOrderRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: getOrderQuery,
        variables: { id: payload.orderId }
      })
    });

    const getOrderData = await getOrderRes.json();
    const order = getOrderData.data?.order;
    if (!order) {
      return { success: false, error: "Order not found in Shopify." };
    }

    // 2. Prepare updated tags and structured note
    const currentTags: string[] = order.tags || [];
    const newTags = Array.from(new Set([
      ...currentTags,
      "Return Requested",
      `Return: ${payload.returnType}`,
      `Reason: ${payload.reason.slice(0, 30)}`
    ]));

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const formattedItems = payload.items
      .map(it => `• ${it.title} (Qty: ${it.quantity})`)
      .join("\n");

    const returnNoteBlock = `
=== [CUSTOMER RETURN / EXCHANGE REQUEST] ===
Status: PENDING REVIEW
Date: ${timestamp} IST
Requested Action: ${payload.returnType === 'EXCHANGE' ? `Size Exchange (Desired Size: ${payload.exchangeSize || 'Not specified'})` : 'Full Refund'}
Customer: ${payload.customerName || 'Customer'} (${payload.customerEmail})
Reason: ${payload.reason}
Customer Notes: ${payload.notes || 'None provided'}
Items for Return:
${formattedItems}
============================================
`;

    const updatedNote = order.note 
      ? `${order.note}\n\n${returnNoteBlock}`
      : returnNoteBlock;

    // 3. Update Order in Shopify Admin API
    const updateOrderMutation = `
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            tags
            note
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const updateRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: updateOrderMutation,
        variables: {
          input: {
            id: payload.orderId,
            tags: newTags,
            note: updatedNote
          }
        }
      })
    });

    const updateData = await updateRes.json();
    if (updateData.data?.orderUpdate?.userErrors?.length > 0) {
      return {
        success: false,
        error: updateData.data.orderUpdate.userErrors[0].message
      };
    }

    return {
      success: true,
      message: "Return request submitted successfully. Our logistics team will review and coordinate the Delhivery reverse pickup."
    };

  } catch (error: any) {
    console.error("Order return request error:", error);
    return {
      success: false,
      error: error.message || "Failed to submit return request."
    };
  }
}

export async function checkEmailExists(email: string) {
  if (!domain || !clientId || !clientSecret) return { exists: false };

  try {
    // Rate limit check: max 15 requests per minute per IP for email checking
    const headersList = await headers();
    const mockRequest = new Request("http://localhost", { headers: headersList });
    const rateLimitResponse = await checkRateLimit(mockRequest, {
      ipConfig: { limit: 15, windowMs: 60 * 1000 }
    });
    if (rateLimitResponse) {
      return { exists: false, error: "Too many requests. Please try again later." };
    }

    const adminToken = await getAdminToken();
    const findQuery = `query { customers(first: 1, query: "email:${email}") { edges { node { id state } } } }`;
    const findResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query: findQuery }),
    });
    const findData = await findResponse.json();
    const customer = findData.data?.customers?.edges[0]?.node;
    
    return { 
      exists: !!customer, 
      state: customer?.state || null 
    };
  } catch (error) {
    return { exists: false };
  }
}

export async function recoverPasswordAction(email: string) {
  if (!domain || !clientId || !clientSecret) {
    return { success: false, error: "Shopify Admin API is not configured." };
  }

  try {
    // Rate limit check: max 5 requests per minute per IP for password recovery
    const headersList = await headers();
    const mockRequest = new Request("http://localhost", { headers: headersList });
    const rateLimitResponse = await checkRateLimit(mockRequest, {
      ipConfig: { limit: 5, windowMs: 60 * 1000 }
    });
    if (rateLimitResponse) {
      return { success: false, error: "Too many password recovery requests. Please try again later." };
    }

    const adminToken = await getAdminToken();

    // 1. Find customer by email
    const query = `
      query {
        customers(first: 1, query: "email:${email}") {
          edges {
            node {
              id
              state
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
      body: JSON.stringify({ query }),
    });

    const findData = await findResponse.json();
    const customer = findData.data?.customers?.edges?.[0]?.node;

    if (!customer) {
      return { success: false, error: "No account found with this email address." };
    }

    const { id: customerId, state } = customer;

    // 2. Determine action based on customer state
    if (state === "DISABLED" || state === "INVITED") {
      // Send invite email using Admin API
      const inviteMutation = `
        mutation customerSendAccountInviteEmail($customerId: ID!) {
          customerSendAccountInviteEmail(customerId: $customerId) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const inviteResponse = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({
          query: inviteMutation,
          variables: { customerId }
        }),
      });

      const inviteData = await inviteResponse.json();
      const userErrors = inviteData.data?.customerSendAccountInviteEmail?.userErrors;

      if (userErrors && userErrors.length > 0) {
        return { success: false, error: userErrors[0].message };
      }

      return { success: true, mode: "invite" };

    } else if (state === "ENABLED") {
      // Call standard Storefront recovery
      const storefrontResult = await customerRecover(email);
      
      if (storefrontResult?.customerUserErrors && storefrontResult.customerUserErrors.length > 0) {
        return { success: false, error: storefrontResult.customerUserErrors[0].message };
      }

      return { success: true, mode: "recover" };
    }

    return { success: false, error: "Unknown customer state." };

  } catch (error: any) {
    console.error("Password recovery action error:", error);
    return { success: false, error: "An error occurred during password recovery." };
  }
}
