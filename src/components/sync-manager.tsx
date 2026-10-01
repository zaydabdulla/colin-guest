"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { getOrCreateShopifyCustomer, adminGetCustomerData } from "@/app/actions/shopify";

function SyncManagerInternal() {
  const { isLoggedIn, user, refreshCustomerData, syncData, isSyncing, customerId, hasLoggedOut, lastSyncedCustomerId } = useCartStore();
  const { data: session, status } = useSession();
  
  // Multi-tab sync: automatically rehydrate store when another tab updates localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bluorng-storage" && typeof window !== "undefined") {
        try {
          useCartStore.persist.rehydrate();
        } catch (err) {
          console.error("Storage rehydrate error:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle URL cart parameter to reopen cart after login/checkout flow
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cart") === "open") {
        useCartStore.getState().openCart();
        params.delete("cart");
        const newSearch = params.toString() ? `?${params.toString()}` : "";
        window.history.replaceState({}, "", window.location.pathname + newSearch);
      }
    }
  }, []);

  // Fresh profile & address fetch once on page load/refresh
  const hasRefreshedRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn && user?.email && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      refreshCustomerData();
    }
  }, [isLoggedIn, user?.email, refreshCustomerData]);

  useEffect(() => {
    // If user is logged in via Google but not in our store, sync them
    // ONLY if they haven't explicitly logged out in this session
    if (status === "authenticated" && session?.user && !isLoggedIn && !hasLoggedOut) {
      const email = session.user.email || "";
      const firstName = session.user.name?.split(" ")[0] || "";
      const lastName = session.user.name?.split(" ").slice(1).join(" ") || "";

      // Resolve real Shopify ID and Data for Google users
      Promise.all([
        getOrCreateShopifyCustomer(email, firstName, lastName),
        adminGetCustomerData(email)
      ]).then(async ([resolveResult, dataResult]) => {
        const resolvedCustomerId = resolveResult.customerId || `google-${email}`;
        useCartStore.setState({
          isLoggedIn: true,
          user: { 
            email, 
            firstName: dataResult.success ? dataResult.firstName : firstName, 
            lastName: dataResult.success ? dataResult.lastName : lastName,
            addresses: dataResult.success ? dataResult.addresses : []
          },
          customerId: resolvedCustomerId,
          hasLoggedOut: false
        });

        // Immediately perform merge sync so any guest cart/wishlist items are preserved and synced
        await useCartStore.getState().syncData(true);
      });
    }
  }, [status, session, isLoggedIn, hasLoggedOut]);

  // Window focus & tab visibility change: sync data when returning to tab
  useEffect(() => {
    const handleFocus = () => {
      const state = useCartStore.getState();
      const activeCustomerId = state.customerId || state.user?.email;
      if (state.isLoggedIn && activeCustomerId && !state.isSyncing) {
        state.refreshCustomerData();
        // If not synced for this customer yet, merge; otherwise fetch remote updates
        const shouldMerge = state.lastSyncedCustomerId !== activeCustomerId;
        state.syncData(shouldMerge);
      }
    };

    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const activeCustomerId = customerId || user?.email;
    if (isLoggedIn && !isSyncing && activeCustomerId) {
      // Avoid redundant syncs if we've already synced for this specific customer session
      if (lastSyncedCustomerId === activeCustomerId) return;

      // When a customer logs in on this device, ALWAYS perform a merge sync so guest items are preserved
      syncData(true);
    }
  }, [isLoggedIn, customerId, user?.email, isSyncing, syncData, lastSyncedCustomerId]);

  return null;
}

export function SyncManager() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <SyncManagerInternal />;
}
