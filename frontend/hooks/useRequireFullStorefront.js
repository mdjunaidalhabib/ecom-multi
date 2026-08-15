"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useShopPath from "./useShopPath";

// Cart/wishlist/profile/order-history pages only make sense when the shop
// has a full multi-product catalog (fullStorefront: true). A landing-only
// plan shop has no cart to hold or account history to show, so these
// client-rendered pages self-check on mount and bounce to the shop's
// landing page instead of rendering an empty/broken catalog-dependent UI.
export default function useRequireFullStorefront() {
  const router = useRouter();
  const { base } = useShopPath();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/shop-info", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((shop) => {
        if (cancelled || !shop || shop.fullStorefront !== false) return;
        router.replace(
          shop.primaryLandingPageSlug ? `${base}/lp/${shop.primaryLandingPageSlug}` : `${base}/`,
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
