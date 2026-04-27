import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from './data';
import { customerLogin, getCustomer, getProductsByIds, customerCreate, customerRecover, customerUpdate } from './shopify';
import { signOut } from 'next-auth/react';

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
  id: string; // unique ID mapping to productID-size
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;

  wishlistItems: Product[];
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (product: Product) => void;

  isLoggedIn: boolean;
  user: { email: string; firstName?: string; lastName?: string } | null;
  customerId: string | null;
  accessToken: string | null;
  isSyncing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (input: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  recoverPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  syncData: (merge?: boolean) => Promise<void>;
  saveData: () => Promise<void>;
  updateUser: (firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;

  wishlistPopupProduct: Product | null;
  clearWishlistPopup: () => void;
  hasLoggedOut: boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true, isWishlistOpen: false }), // automatically close wishlist if cart opens safely
      closeCart: () => set({ isOpen: false }),
      addToCart: (product, size) => {
        set((state) => {
          const existingIndex = state.items.findIndex(item => item.product.id === product.id && item.size === size);
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems, isOpen: true, isWishlistOpen: false };
          }
          return {
            items: [...state.items, { product, size, quantity: 1, id: `${product.id}-${size}` }],
            isOpen: true,
            isWishlistOpen: false
          };
        });
        get().saveData();
      },
      removeFromCart: (cartItemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== cartItemId)
        }));
        get().saveData();
      },
      updateQuantity: (cartItemId, delta) => {
        set((state) => ({
          items: state.items.map(item => {
            if (item.id === cartItemId) {
              const newQuantity = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        }));
        get().saveData();
      },

      wishlistItems: [],
      isWishlistOpen: false,
      openWishlist: () => set({ isWishlistOpen: true, isOpen: false }), // safely close cart 
      closeWishlist: () => set({ isWishlistOpen: false }),
      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.wishlistItems.some(item => item.id === product.id);
          if (exists) {
            return { wishlistItems: state.wishlistItems.filter(item => item.id !== product.id) };
          } else {
            return {
              wishlistItems: [...state.wishlistItems, product],
              wishlistPopupProduct: product
            };
          }
        });
        get().saveData();
      },

      isLoggedIn: false,
      user: null,
      customerId: null,
      accessToken: null,
      isSyncing: false,

      login: async (email, password) => {
        set({ isSyncing: true });
        try {
          const result = await customerLogin(email, password);

          if (result?.customerAccessToken) {
            const token = result.customerAccessToken.accessToken;
            const customer = await getCustomer(token);

            if (customer) {
              set({
                isLoggedIn: true,
                user: {
                  email: customer.email,
                  firstName: customer.firstName,
                  lastName: customer.lastName
                },
                customerId: customer.id,
                accessToken: token,
                hasLoggedOut: false
              });

              // Fetch saved data from Shopify and merge with guest data
              await get().syncData(true);
              return { success: true };
            }
          }

          set({ isSyncing: false, hasLoggedOut: false });
          return {
            success: false,
            error: result?.customerUserErrors?.[0]?.message || "Invalid login credentials"
          };
        } catch (error) {
          set({ isSyncing: false });
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      signup: async (input): Promise<{ success: boolean; error?: string }> => {
        set({ isSyncing: true });
        try {
          const result = await customerCreate(input);

          if (result?.customer) {
            // After successful signup, log the user in automatically
            const loginResult = await get().login(input.email, input.password);
            set({ isSyncing: false });
            return loginResult;
          }

          set({ isSyncing: false });
          return {
            success: false,
            error: result?.customerUserErrors?.[0]?.message || "Failed to create account"
          };
        } catch (error) {
          set({ isSyncing: false });
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      recoverPassword: async (email) => {
        set({ isSyncing: true });
        try {
          const result = await customerRecover(email);
          set({ isSyncing: false });

          if (result?.customerUserErrors?.length > 0) {
            return {
              success: false,
              error: result.customerUserErrors[0].message
            };
          }

          return { success: true };
        } catch (error) {
          set({ isSyncing: false });
          return { success: false, error: "An unexpected error occurred" };
        }
      },
      
      updateUser: async (firstName, lastName) => {
        const { accessToken, user } = get();
        if (!accessToken || !user) return { success: false, error: "Not authenticated" };
        
        set({ isSyncing: true });
        try {
          const result = await customerUpdate(accessToken, { firstName, lastName });
          if (result?.customer) {
            set({
              user: {
                ...user,
                firstName: result.customer.firstName,
                lastName: result.customer.lastName
              },
              isSyncing: false
            });
            return { success: true };
          }
          set({ isSyncing: false });
          return {
            success: false,
            error: result?.customerUserErrors?.[0]?.message || "Failed to update profile"
          };
        } catch (error) {
          set({ isSyncing: false });
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      logout: () => {
        // 1. Clear local store state IMMEDIATELY for instant UI feedback
        set({
          isLoggedIn: false,
          user: null,
          customerId: null,
          accessToken: null,
          items: [],
          wishlistItems: [],
          hasLoggedOut: true
        });

        // 2. Sign out of Google/NextAuth session in the background
        signOut({ redirect: false });
        
        // 3. Clear the account dropdown state if open (handled in Navbar component usually)
      },

      syncData: async (merge?: boolean) => {
        const { customerId, isLoggedIn } = get();
        if (!isLoggedIn || !customerId) return;

        set({ isSyncing: true });
        try {
          const response = await fetch(`/api/shopify/sync?customerId=${encodeURIComponent(customerId)}`);
          if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
          
          const data = await response.json();

          if (data && (data.wishlist || data.cart)) {
            // Fetch full product details for wishlist items
            const wishlistIds = data.wishlist || [];
            const cartData = data.cart || []; // array of { productId, size, quantity }

            let newWishlistItems: Product[] = [];
            if (wishlistIds.length > 0) {
              try {
                const products = await getProductsByIds(wishlistIds);
                if (products && products.length > 0) {
                  newWishlistItems = products.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
                    src: p.images.edges[0]?.node.url || "",
                    desc: p.description,
                    category: p.productType,
                    handle: p.handle
                  }));
                } else if (products && products.length === 0) {
                  // If Shopify specifically returned 0 nodes for existing IDs, 
                  // it might mean products were deleted, but we'll be cautious.
                  console.warn("Sync: Shopify returned no products for IDs:", wishlistIds);
                }
              } catch (err) {
                console.error("Failed to fetch wishlist products:", err);
                // Don't overwrite if fetch failed
                set({ isSyncing: false });
                return;
              }
            }

            let newCartItems: CartItem[] = [];
            if (cartData.length > 0) {
              try {
                const cartProductIds = cartData.map((item: any) => item.productId);
                const products = await getProductsByIds(cartProductIds);
                
                if (products) {
                  newCartItems = cartData.map((item: any) => {
                    const product = products.find((p: any) => p.id === item.productId);
                    if (!product) return null;
                    return {
                      product: {
                        id: product.id,
                        title: product.title,
                        price: `${product.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString()}`,
                        src: product.images.edges[0]?.node.url || "",
                        desc: product.description,
                        category: product.productType,
                        handle: product.handle
                      },
                      size: item.size,
                      quantity: item.quantity,
                      id: `${product.id}-${item.size}`
                    };
                  }).filter(Boolean) as CartItem[];
                }
              } catch (err) {
                console.error("Failed to fetch cart products:", err);
                // Don't overwrite if fetch failed
                set({ isSyncing: false });
                return;
              }
            }

            if (merge) {
              // Merge logic: Combine guest items with account items
              const guestWishlist = get().wishlistItems;
              const guestCart = get().items;

              // Merge wishlist (unique by id)
              const mergedWishlist = [...newWishlistItems];
              guestWishlist.forEach((item: Product) => {
                if (!mergedWishlist.find(mw => mw.id === item.id)) {
                  mergedWishlist.push(item);
                }
              });

              // Merge cart (unique by product.id and size)
              const mergedCart = [...newCartItems];
              guestCart.forEach((item: CartItem) => {
                const exists = mergedCart.find(mc => mc.product.id === item.product.id && mc.size === item.size);
                if (exists) {
                  exists.quantity += item.quantity;
                } else {
                  mergedCart.push(item);
                }
              });

              set({
                wishlistItems: mergedWishlist,
                items: mergedCart,
                isSyncing: false
              });

              // Save the merged state back to Shopify
              await get().saveData();
            } else {
              set({
                wishlistItems: newWishlistItems,
                items: newCartItems,
                isSyncing: false
              });
            }
          }
        } catch (error) {
          console.error("Sync error:", error);
          set({ isSyncing: false });
        }
      },

      saveData: async () => {
        const { customerId, isLoggedIn, wishlistItems, items } = get();
        if (!isLoggedIn || !customerId) return;

        try {
          const wishlist = wishlistItems.map((item: Product) => item.id);
          const cart = items.map((item: CartItem) => ({
            productId: item.product.id,
            size: item.size,
            quantity: item.quantity
          }));

          await fetch('/api/shopify/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, wishlist, cart })
          });
        } catch (error) {
          console.error("Save error:", error);
        }
      },

      wishlistPopupProduct: null,
      clearWishlistPopup: () => set({ wishlistPopupProduct: null }),
      hasLoggedOut: false
    }),
    {
      name: 'bluorng-storage',
      partialize: (state) => ({
        items: state.items,
        wishlistItems: state.wishlistItems,
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        customerId: state.customerId,
        accessToken: state.accessToken,
      }),
    }
  )
);
