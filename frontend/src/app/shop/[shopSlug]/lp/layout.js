import { Store } from "lucide-react";
import { getShopInfo } from "../../../../../lib/serverApi";

// Minimal shell for single-product ad landing pages — just the shop's
// logo/name, no nav links, no cart/wishlist icons, no footer. Renders
// inside shop/[shopSlug]/layout.js's <StorefrontChrome>, which already
// skips the theme Navbar/Footer for any /lp/ path (see StorefrontChrome.jsx)
// — this layout only supplies the tiny header that replaces them.
export default async function LandingLayout({ children }) {
  const shop = await getShopInfo().catch(() => null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 px-4 py-3 flex items-center gap-2.5">
        {shop?.branding?.logo ? (
          <img
            src={shop.branding.logo}
            alt={shop.name}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <span className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            <Store size={16} />
          </span>
        )}
        <span className="font-bold text-gray-800 truncate">{shop?.name || ""}</span>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
