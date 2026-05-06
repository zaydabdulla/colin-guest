"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { getOrCreateShopifyCustomer, adminGetCustomerData } from "@/app/actions/shopify";

function SyncManagerInternal() {
  const { isLoggedIn, syncData, isSyncing, customerId, hasLoggedOut, lastSyncedCustomerId } = useCartStore();
  const { data: session, status } = useSession();
  
  // Track state to manage initial merge and prevent redundant syncs
  const wasLoggedIn = useRef(isLoggedIn);

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
      ]).then(([resolveResult, dataResult]) => {
        useCartStore.setState({
          isLoggedIn: true,
          user: { 
            email, 
            firstName: dataResult.success ? dataResult.firstName : firstName, 
            lastName: dataResult.success ? dataResult.lastName : lastName,
            addresses: dataResult.success ? dataResult.addresses : []
          },
          customerId: resolveResult.customerId || `google-${email}`,
          hasLoggedOut: false
        });
      });
    }
  }, [status, session, isLoggedIn, hasLoggedOut]);

  useEffect(() => {
    if (isLoggedIn && !isSyncing && customerId) {
      // Avoid redundant syncs if we've already synced for this specific customer session
      if (lastSyncedCustomerId === customerId) return;

      // If we just transitioned from logged out to logged in, perform a MERGE sync
      // If we are on initial mount and already logged in, shouldMerge will be false because wasLoggedIn.current was initialized to true
      const shouldMerge = !wasLoggedIn.current;
      
      syncData(shouldMerge);
      
      // Update refs to track completion
      wasLoggedIn.current = true;
    } else if (!isLoggedIn) {
      // Reset tracking when logged out
      wasLoggedIn.current = false;
    }
  }, [isLoggedIn, customerId, isSyncing, syncData, lastSyncedCustomerId]);

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
