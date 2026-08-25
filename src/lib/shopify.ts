// Shopify Integration - COLIN GUEST Architecture
import { Product, Collection } from "./data";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();

export async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  if (!domain || !accessToken) {
    console.error('Shopify Error: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in .env.local');
    return { data: null };
  }

  try {
    const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 60 },
    });

    const result = await response.json();

    if (result.errors) {
      const isUnauthorized = result.errors.some((e: any) => e.extensions?.code === 'UNAUTHORIZED');
      if (isUnauthorized) {
        console.error('Shopify Authorization Failed: Please verify your SHOPIFY_STOREFRONT_ACCESS_TOKEN and ensure the Storefront API is enabled in your Shopify Admin.');
      } else {
        console.error('Shopify API Errors:', JSON.stringify(result.errors, null, 2));
      }
    }
    return result;
  } catch (error: any) {
    console.error('Network Error fetching from Shopify:', error.message);
    return { data: null };
  }
}

export async function getCollectionProducts(handle: string, sortKey: string = 'CREATED', reverse: boolean = true) {
  // First, try fetching by handle
  const query = `
    query getCollection($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
      collection(handle: $handle) {
        title
        products(first: 50, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              id
              title
              handle
              description
              productType
              category {
                name
              }
              color1: metafield(namespace: "custom", key: "color") { value }
              color2: metafield(namespace: "custom", key: "Color") { value }
              color3: metafield(namespace: "shopify", key: "color") { value }
              color4: metafield(namespace: "shopify", key: "Color") { value }
              color5: metafield(namespace: "shopify", key: "color-label") { value }
              color6: metafield(namespace: "shopify", key: "base-color") { value }
              color7: metafield(namespace: "shopify", key: "label") { value }
              color8: metafield(namespace: "shopify", key: "name") { value }
              tags
              createdAt
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              teaser: metafield(namespace: "custom", key: "short_description") {
                value
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              options {
                name
                values
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                    }
                    selectedOptions {
                      name
                      value
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

  let response = await shopifyFetch({
    query,
    variables: { handle, sortKey, reverse },
  });

  // If not found, try to find a collection with a matching title
  if (!response.data?.collection) {
    console.log(`Collection with handle "${handle}" not found, searching by title...`);
    const listQuery = `
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;
    const listResponse = await shopifyFetch({ query: listQuery });
    const collections = listResponse.data?.collections?.edges || [];
    const match = collections.find((edge: any) =>
      edge.node.title.toLowerCase() === handle.replace(/-/g, ' ').toLowerCase() ||
      edge.node.handle === handle.toLowerCase().replace(/\s+/g, '-')
    );

    if (match) {
      console.log(`Found matching collection: ${match.node.title} (${match.node.handle})`);
      response = await shopifyFetch({
        query,
        variables: { handle: match.node.handle, sortKey, reverse },
      });
    }
  }

  return response.data?.collection?.products?.edges.map((edge: any) => ({
    ...edge.node,
    images: edge.node.images?.edges.map((e: any) => e.node) || []
  })) || [];
}

export async function getProductById(id: string) {
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        description
        descriptionHtml
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        details: metafield(namespace: "custom", key: "details") {
          value
        }
        sizeGuide: metafield(namespace: "custom", key: "size_guide") {
          value
        }
        washcare: metafield(namespace: "custom", key: "washcare") {
          value
        }
        shipping: metafield(namespace: "custom", key: "shipping") {
          value
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { id },
  });

  const product = response.data?.product;
  if (product) {
    return {
      ...product,
      images: product.images?.edges.map((e: any) => e.node) || []
    };
  }
  return null;
}

export async function getProductByHandle(handle: string) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        details: metafield(namespace: "custom", key: "details") {
          value
        }
        sizeGuide: metafield(namespace: "custom", key: "size_guide") {
          value
        }
        washcare: metafield(namespace: "custom", key: "washcare") {
          value
        }
        shipping: metafield(namespace: "custom", key: "shipping") {
          value
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { handle },
  });

  const product = response.data?.product;
  if (product) {
    return {
      ...product,
      images: product.images?.edges.map((e: any) => e.node) || []
    };
  }
  return null;
}

export async function getAllProducts(sortKey: string = 'CREATED_AT', reverse: boolean = true): Promise<any[]> {
  const query = `
    query getProducts($sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: 250, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            category {
              name
            }
            color1: metafield(namespace: "custom", key: "color") { value }
            color2: metafield(namespace: "custom", key: "Color") { value }
            color3: metafield(namespace: "shopify", key: "color") { value }
            color4: metafield(namespace: "shopify", key: "Color") { value }
            color5: metafield(namespace: "shopify", key: "color-label") { value }
            color6: metafield(namespace: "shopify", key: "base-color") { value }
            color7: metafield(namespace: "shopify", key: "label") { value }
            color8: metafield(namespace: "shopify", key: "name") { value }
            tags
            createdAt
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            options {
              name
              values
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ 
    query, 
    variables: { sortKey, reverse } 
  });
  return response.data?.products?.edges.map((edge: any) => ({
    ...edge.node,
    images: edge.node.images?.edges.map((e: any) => e.node) || []
  })) || [];
}

export async function getCollection(handle: string) {
  const query = `
    query getCollection($handle: String!) {
      collection(handle: $handle) {
        title
        handle
        description
        image {
          url
          altText
        }
      }
    }
  `;

  let response = await shopifyFetch({
    query,
    variables: { handle },
  });

  // If not found by handle, try to find by Title match
  if (!response.data?.collection) {
    const listQuery = `
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;
    const listResponse = await shopifyFetch({ query: listQuery });
    const collections = listResponse.data?.collections?.edges || [];
    const match = collections.find((edge: any) =>
      edge.node.title.toLowerCase() === handle.replace(/-/g, ' ').toLowerCase() ||
      edge.node.handle === handle.toLowerCase().replace(/\s+/g, '-')
    );

    if (match) {
      response = await shopifyFetch({
        query,
        variables: { handle: match.node.handle },
      });
    }
  }

  return response.data?.collection;
}


export async function getProductRecommendations(productId: string) {
  const query = `
    query getProductRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        title
        handle
        description
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { productId },
  });

  return (response.data?.productRecommendations || []).map((p: any) => ({
    ...p,
    images: p.images?.edges.map((e: any) => e.node) || []
  }));
}

export async function getProductsByIds(ids: string[]) {
  const query = `
    query getProducts($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          handle
          description
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { ids },
  });

  return (response.data?.nodes || [])
    .filter((node: any) => node !== null)
    .map((node: any) => ({
      ...node,
      images: node.images?.edges.map((e: any) => e.node) || []
    }));
}

export async function customerLogin(email: string, password: string) {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: {
      input: {
        email,
        password,
      },
    },
  });

  return response.data?.customerAccessTokenCreate;
}

export async function getCustomer(accessToken: string) {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        addresses(first: 10) {
          edges {
            node {
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

  const response = await shopifyFetch({
    query,
    variables: {
      customerAccessToken: accessToken,
    },
  });

  return response.data?.customer;
}

export async function customerCreate(input: any) {
  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { input },
  });

  return response.data?.customerCreate;
}

export async function customerRecover(email: string) {
  const query = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { email },
  });

  return response.data?.customerRecover;
}

export async function customerActivate(id: string, input: any) {
  const query = `
    mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {
      customerActivate(id: $id, input: $input) {
        customer {
          id
          email
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { id, input },
  });

  return response.data?.customerActivate;
}

export async function getAllCollections(): Promise<Collection[]> {
  const query = `
    query getCollections {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query });
  let collections: Collection[] = response.data?.collections?.edges.map((edge: any) => edge.node) || [];

  // Ensure Landing Page and other collections remain accessible for primary cover resolution
  // We keep collections intact so page.tsx can resolve landingPageCollection?.image?.url

  // Ensure "Jackets" collection is included cleanly if present in shopify or fallback
  const hasJackets = collections.some(c => c.handle.toLowerCase() === 'jackets' || c.title.toLowerCase() === 'jackets');
  if (!hasJackets) {
    try {
      const allProds = await getAllProducts();
      const jacketProd = allProds.find((p: any) => {
        const pType = (p.productType || "").toLowerCase();
        const pCat = (p.category?.name || "").toLowerCase();
        const pTitle = (p.title || "").toLowerCase();
        return pType.includes('jacket') || pCat.includes('jacket') || pTitle.includes('jacket');
      });

      if (jacketProd) {
        collections.push({
          id: 'collection-jackets',
          title: 'Jackets',
          handle: 'jackets',
          image: { url: jacketProd.images?.[0]?.url || jacketProd.src || '/collections_hero.jpg', altText: 'Jackets' }
        });
      }
    } catch (err) {
      console.error("Error adding Jackets collection card:", err);
    }
  }

  // Sort logic: Best Sellers, New Arrivals, then core categories
  const priorityOrder = ["best sellers", "new arrivals", "jeans", "hoodies", "co-ord sets", "shirts", "jackets"];
  
  return collections.sort((a: Collection, b: Collection) => {
    const titleA = a.title.toLowerCase().trim();
    const titleB = b.title.toLowerCase().trim();
    
    const indexA = priorityOrder.indexOf(titleA);
    const indexB = priorityOrder.indexOf(titleB);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return titleA.localeCompare(titleB);
  });
}

export async function searchProducts(searchTerm: string): Promise<any[]> {
  const query = `
    query searchProducts($searchTerm: String!, $collectionQuery: String!) {
      products(first: 20, query: $searchTerm) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            category {
              name
            }
            color1: metafield(namespace: "custom", key: "color") { value }
            color2: metafield(namespace: "custom", key: "Color") { value }
            color3: metafield(namespace: "shopify", key: "color") { value }
            color4: metafield(namespace: "shopify", key: "Color") { value }
            color5: metafield(namespace: "shopify", key: "color-label") { value }
            color6: metafield(namespace: "shopify", key: "base-color") { value }
            color7: metafield(namespace: "shopify", key: "label") { value }
            color8: metafield(namespace: "shopify", key: "name") { value }
            tags
            options {
              name
              values
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
      collections(first: 5, query: $collectionQuery) {
        edges {
          node {
            products(first: 20) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  productType
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  category {
                    name
                  }
                  color1: metafield(namespace: "custom", key: "color") { value }
                  color2: metafield(namespace: "custom", key: "Color") { value }
                  color3: metafield(namespace: "shopify", key: "color") { value }
                  color4: metafield(namespace: "shopify", key: "Color") { value }
                  color5: metafield(namespace: "shopify", key: "color-label") { value }
                  color6: metafield(namespace: "shopify", key: "base-color") { value }
                  color7: metafield(namespace: "shopify", key: "label") { value }
                  color8: metafield(namespace: "shopify", key: "name") { value }
                  tags
                  options {
                    name
                    values
                  }
                  images(first: 5) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 50) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price {
                          amount
                        }
                        selectedOptions {
                          name
                          value
                        }
                      }
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

  const cleanTerms = searchTerm.trim().split(/\s+/).filter(t => t.length > 0);
  const queryTerms = cleanTerms.map(t => `${t}*`).join(' AND ');

  const response = await shopifyFetch({
    query,
    variables: { 
      searchTerm: queryTerms,
      collectionQuery: `title:${searchTerm}*`
    },
  });

  const productsFromSearch = response.data?.products?.edges.map((edge: any) => edge.node) || [];
  
  const productsFromCollections = response.data?.collections?.edges.flatMap((cEdge: any) => 
    cEdge.node.products.edges.map((pEdge: any) => pEdge.node)
  ) || [];

  const allProducts = [...productsFromSearch, ...productsFromCollections];
  
  // Deduplicate products by ID
  const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());

  return uniqueProducts.map((product: any) => ({
    ...product,
    images: product.images?.edges.map((e: any) => e.node) || []
  }));
}

export async function customerUpdate(accessToken: string, customer: { firstName?: string; lastName?: string; email?: string }) {
  const query = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          firstName
          lastName
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: {
      customerAccessToken: accessToken,
      customer,
    },
  });

  return response.data?.customerUpdate;
}

export async function customerReset(id: string, input: any) {
  const query = `
    mutation customerReset($id: ID!, $input: CustomerResetInput!) {
      customerReset(id: $id, input: $input) {
        customer {
          id
          email
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { id, input },
  });

  return response.data?.customerReset;
}

export async function customerAddressCreate(customerAccessToken: string, address: any) {
  const query = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
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
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: {
      customerAccessToken,
      address,
    },
  });

  return response.data?.customerAddressCreate;
}

export async function customerAddressUpdate(customerAccessToken: string, id: string, address: any) {
  const query = `
    mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
      customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
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
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: {
      customerAccessToken,
      id,
      address,
    },
  });

  return response.data?.customerAddressUpdate;
}

export async function customerAddressDelete(customerAccessToken: string, id: string) {
  const query = `
    mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
      customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
        deletedCustomerAddressId
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: {
      customerAccessToken,
      id,
    },
  });

  return response.data?.customerAddressDelete;
}

export async function createShopifyCheckout(items: any[], email?: string, customerAccessToken?: string | null) {
  const lineItems = items.map(item => {
    let variantId = item.variantId;
    
    // Resolve variant ID from product object if not explicitly provided
    if (!variantId && item.product) {
      // Flatten Shopify's GraphQL nested `{ edges: [...] }` structure or use standard array
      let variantsArray: any[] = [];
      if (Array.isArray(item.product.variants)) {
        variantsArray = item.product.variants;
      } else if (item.product.variants?.edges) {
        variantsArray = item.product.variants.edges.map((edge: any) => edge.node);
      } else if (item.product.variants?.nodes) {
        variantsArray = item.product.variants.nodes;
      }

      if (variantsArray.length > 0) {
        // Try finding matching variant by size title or selectedOptions
        const variant = variantsArray.find((v: any) => {
          const vTitle = (v.title || v.node?.title || "").toLowerCase().trim();
          const itemSize = (item.size || "").toLowerCase().trim();

          // 1. Exact match (e.g. "l" === "l")
          if (vTitle === itemSize) return true;

          // 2. SelectedOptions match (e.g. option value "L")
          const opts = v.selectedOptions || v.node?.selectedOptions || [];
          if (opts.some((opt: any) => (opt.value || "").toLowerCase().trim() === itemSize)) {
            return true;
          }

          // 3. Multi-option title match (e.g. "Gray / L")
          const parts = vTitle.split('/').map((p: string) => p.trim());
          return parts.includes(itemSize);
        });

        if (variant) {
          variantId = variant.id || variant.node?.id;
        }

        // Fallback: If no size match, but there is only 1 variant (e.g. Free Size / Default Title)
        if (!variantId && variantsArray.length === 1) {
          variantId = variantsArray[0].id || variantsArray[0].node?.id;
        }

        // Ultimate Fallback: If still not resolved, use the first available variant
        if (!variantId) {
          variantId = variantsArray[0].id || variantsArray[0].node?.id;
        }
      }
    }

    return {
      merchandiseId: variantId,
      quantity: item.quantity
    };
  }).filter(li => li.merchandiseId);

  if (lineItems.length === 0) {
    return { success: false, error: "No valid products found to checkout." };
  }

  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          checkoutUrl
        }
        userErrors {
          message
        }
      }
    }
  `;

  const buyerIdentity: any = {};
  if (email) buyerIdentity.email = email;
  if (customerAccessToken) buyerIdentity.customerAccessToken = customerAccessToken;

  const variables = {
    input: {
      lines: lineItems,
      ...(Object.keys(buyerIdentity).length > 0 ? { buyerIdentity } : {})
    }
  };

  const response = await shopifyFetch({ query, variables });

  if (response.data?.cartCreate?.userErrors?.length > 0) {
    return { success: false, error: response.data.cartCreate.userErrors[0].message };
  }

  const checkoutUrl = response.data?.cartCreate?.cart?.checkoutUrl;

  if (checkoutUrl) {
    return { success: true, url: checkoutUrl };
  }

  return { success: false, error: "Failed to generate checkout URL." };
}
