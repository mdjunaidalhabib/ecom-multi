"use client";

import { usePathname } from "next/navigation";
import { DOMAIN_MODE_MARKER, shopBasePath, shopHref } from "../lib/shopMode";

export { shopHref };

/**
 * Tells components whether the current page was reached via the
 * platform's own path-based route (`/shop/<slug>/...`) or via a shop's
 * custom domain (rewritten transparently to `/shop/__domain__/...`).
 *
 * - `base`: prefix to prepend to internal hrefs ("" in domain-mode).
 * - `subPath`: the shop-relative pathname, for isActive-style checks —
 *   use this instead of the raw `usePathname()` result.
 */
export default function useShopPath() {
  const pathname = usePathname();
  const match = pathname.match(/^\/shop\/([^/]+)/);
  const shopSlug = match && match[1] !== DOMAIN_MODE_MARKER ? match[1] : null;
  const base = shopBasePath(shopSlug);
  const subPath = match ? pathname.slice(match[0].length) || "/" : pathname;

  return { base, subPath, shopSlug };
}
