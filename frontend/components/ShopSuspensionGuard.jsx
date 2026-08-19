"use client";

import { useEffect, useRef } from "react";

// Public traffic can be far larger than the admin panel's, so this polls
// much less aggressively than AdminSessionGuard (10s) — 60s is frequent
// enough that a suspended shop stops serving already-open tabs within a
// minute, without meaningfully adding to backend load (resolveShopByDomain
// already micro-caches this lookup for 60s per shop regardless of how many
// visitors are polling it).
const CHECK_INTERVAL_MS = 60_000;

// ShopLayout's server-side render (frontend/lib/serverApi.js getShopInfo,
// now revalidate: 0) is the single source of truth for the suspended block
// UI — this guard's only job is noticing that an already-open tab has gone
// stale and forcing a real reload so that server check runs again, rather
// than duplicating the blocked-state UI here on the client. Scoped to
// SHOP_SUSPENDED only, matching what ShopLayout actually renders a distinct
// page for — a reload on some other 403 (e.g. SHOP_PLAN_EXPIRED) would just
// land on ShopLayout's generic not-found page, which is worse than leaving
// the shopper on the page they already have.
const BLOCKING_ERROR_TYPE = "SHOP_SUSPENDED";

// shopSlug: passed down from ShopLayout (the same value UserContext uses) —
// the /api proxy's Referer-based slug sniffing (frontend/src/middleware.js)
// isn't reliable for every path, so path-based storefronts pass it
// explicitly instead of hoping the header gets recovered from the Referer.
// Custom-domain storefronts get undefined here, matching UserProvider, and
// resolve via x-shop-domain (Host header) in the /api proxy instead.
export default function ShopSuspensionGuard({ shopSlug }) {
  const checkingRef = useRef(false);
  const reloadingRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    const checkShopStatus = async () => {
      if (
        disposed ||
        reloadingRef.current ||
        checkingRef.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      checkingRef.current = true;

      try {
        const res = await fetch("/api/shop-info", {
          cache: "no-store",
          headers: shopSlug ? { "x-shop-slug": shopSlug } : undefined,
        });
        if (res.ok || disposed) return;
        if (res.status !== 403) return;

        const data = await res.json().catch(() => ({}));
        if (data?.errorType === BLOCKING_ERROR_TYPE) {
          reloadingRef.current = true;
          window.location.reload();
        }
      } catch {
        // A temporary network blip must not disrupt an active shopper.
      } finally {
        checkingRef.current = false;
      }
    };

    const intervalId = window.setInterval(checkShopStatus, CHECK_INTERVAL_MS);

    // A shopper switching back to a tab that's been idle for a while should
    // find out right away rather than waiting for the next interval tick.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkShopStatus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
