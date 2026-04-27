"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { useSession } from "next-auth/react";

export function SyncManager() {
  const { isLoggedIn, syncData, isSyncing, customerId, hasLoggedOut } = useCartStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If user is logged in via Google but not in our store, sync them
    // ONLY if they haven't explicitly logged out in this session
    if (status === "authenticated" && session?.user && !isLoggedIn && !hasLoggedOut) {
      useCartStore.setState({
        isLoggedIn: true,
        user: {
          email: session.user.email || "",
          firstName: session.user.name?.split(" ")[0] || "",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        },
        customerId: `google-${session.user.email}`,
        hasLoggedOut: false
      });
    }
  }, [status, session, isLoggedIn, hasLoggedOut]);

  useEffect(() => {
    if (isLoggedIn && !isSyncing && customerId) {
      syncData();
    }
    // We only want to trigger this when the user identity actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, customerId]);

  return null;
}
