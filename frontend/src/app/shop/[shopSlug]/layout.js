import { Store } from "lucide-react";
import { permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import { CartProvider } from "../../../../context/CartContext";
import { UserProvider } from "../../../../context/UserContext";
import FloatingActionButton from "../../../../components/home/FloatingActionButton";
import StorefrontChrome from "../../../../components/StorefrontChrome";
import ShopSuspensionGuard from "../../../../components/ShopSuspensionGuard";
import { getShopInfo } from "../../../../lib/serverApi";
import { getTheme } from "../../../../lib/themeRegistry";
import { DOMAIN_MODE_MARKER } from "../../../../lib/shopMode";

// Both custom-domain visitors (rewritten to /shop/__domain__/... by
// frontend/src/middleware.js) and real path-based visitors (/shop/<slug>/...)
// render through this layout — the backend's resolveShopByDomain
// (backend/src/tenancy/publicShopResolver.js) already 404s any public
// endpoint when the shop can't be resolved, so getShopInfo() failing is
// enough to turn an unknown slug/domain into a real not-found page instead
// of a silently-empty storefront. It also carries effectiveTheme, which
// picks which Navbar/Footer to render for this shop's plan.
async function getShop() {
  try {
    return { shop: await getShopInfo(), suspended: false };
  } catch (err) {
    const suspended =
      err?.status === 403 && err?.body?.errorType === "SHOP_SUSPENDED";
    return { shop: null, suspended };
  }
}

export default async function ShopLayout({ children, params }) {
  const { shopSlug } = await params;
  const { shop, suspended } = await getShop();

  if (suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Store className="h-8 w-8 text-amber-600" strokeWidth={1.75} />
          </div>
          <h1 className="mt-5 text-xl font-bold text-gray-900 sm:text-2xl">
            শপটি সাময়িকভাবে বন্ধ আছে
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
            এই মুহূর্তে এই অনলাইন শপে প্রবেশ করা যাচ্ছে না। অসুবিধার জন্য
            আন্তরিকভাবে দুঃখিত — অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-2xl text-gray-600">
          উফস! এই শপটি খুঁজে পাওয়া যাচ্ছে না
        </p>
        <a
          href="/"
          className="mt-6 rounded-full bg-violet-700 px-6 py-2.5 text-white shadow-xl hover:bg-fuchsia-600 transition-all duration-300"
        >
          হোমে ফিরে যান
        </a>
      </div>
    );
  }

  // ✅ কেউ /shop/<slug>/... দিয়ে ঢুকলেও, শপের নিজস্ব কাস্টম ডোমেইন verified
  // থাকলে সেটাই canonical URL — নাহলে একই কনটেন্ট দুই URL-এ থেকে SEO
  // duplicate-content সমস্যা হয়। domain-mode ভিজিটর (shopSlug ===
  // DOMAIN_MODE_MARKER) ইতিমধ্যেই কাস্টম ডোমেইনে আছে, তাদের বাদ দেওয়া হচ্ছে।
  // প্রোডাকশনের বাইরে স্কিপ করা হয় (backend/src/tenancy/publicShopResolver.js
  // একই কারণে করে) — নাহলে DB-তে verified থাকা কোনো শপ লোকাল dev-এও লাইভ
  // ডোমেইনে রিডাইরেক্ট করে দেবে, স্লাগ-ভিত্তিক লোকাল টেস্টিং ভেঙে যাবে।
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && shopSlug !== DOMAIN_MODE_MARKER && shop.domain && shop.domainStatus === "verified") {
    const incomingHeaders = await headers();
    const originalPath = incomingHeaders.get("x-original-path") || `/shop/${shopSlug}`;
    const restPath = originalPath.slice(`/shop/${shopSlug}`.length) || "/";
    permanentRedirect(`https://${shop.domain}${restPath}`);
  }

  const { Navbar, Footer, mainClassName = "bg-white" } = getTheme(shop.effectiveTheme);

  // ✅ custom-domain ভিজিটর এই routeSlug-এই আসে, শুধু middleware.js এটাকে
  // DOMAIN_MODE_MARKER দিয়ে রিরাইট করে — সেই কেসে x-shop-slug পাঠানো ভুল
  // (backend slug lookup fail করবে), তাই এখানে undefined রাখা হচ্ছে যাতে
  // UserContext.jsx আগের মতোই x-shop-domain (Host header ভিত্তিক) দিয়ে
  // resolve করতে পারে।
  const userShopSlug = shopSlug !== DOMAIN_MODE_MARKER ? shopSlug : undefined;

  return (
    <UserProvider shopSlug={userShopSlug}>
      <CartProvider>
        <ShopSuspensionGuard shopSlug={userShopSlug} />
        <StorefrontChrome
          navbar={<Navbar />}
          footer={<Footer />}
          floatingActionButton={<FloatingActionButton />}
          mainClassName={mainClassName}
        >
          {children}
        </StorefrontChrome>
      </CartProvider>
    </UserProvider>
  );
}
