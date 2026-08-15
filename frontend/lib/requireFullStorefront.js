import { redirect } from "next/navigation";
import { getShopInfo } from "./serverApi";
import { shopBasePath } from "./shopMode";

// Server Component guard for catalog/cart-only routes (categories,
// checkout, ...) — a landing-page-only plan shop (fullStorefront: false)
// has no catalog to browse or cart to check out, so these routes bounce to
// the shop's landing page instead of rendering broken/empty catalog UI.
export async function requireFullStorefront(shopSlug) {
  const shop = await getShopInfo().catch(() => null);
  if (!shop || shop.fullStorefront !== false) return shop;

  const base = shopBasePath(shopSlug);
  redirect(shop.primaryLandingPageSlug ? `${base}/lp/${shop.primaryLandingPageSlug}` : `${base}/`);
}
