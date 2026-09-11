import { Store } from "lucide-react";
import { permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import { CartProvider } from "../../../../context/CartContext";
import { UserProvider } from "../../../../context/UserContext";
import FloatingActionButton from "../../../../components/home/FloatingActionButton";
import StorefrontChrome from "../../../../components/StorefrontChrome";
import ShopSuspensionGuard from "../../../../components/ShopSuspensionGuard";
import LoginNotice from "../../../../components/LoginNotice";
import PlatformLanding from "../../../../components/platform/PlatformLanding";
import PlatformLegalPage from "../../../../components/platform/PlatformLegalPage";
import { getShopInfo } from "../../../../lib/serverApi";
import { getTheme } from "../../../../lib/themeRegistry";
import { buildThemeVars } from "../../../../lib/themeVars";
import { DOMAIN_MODE_MARKER, shopBasePath } from "../../../../lib/shopMode";
import { toShortName } from "../../../../lib/manifest";

// প্ল্যাটফর্মের নিজস্ব ব্র্যান্ড রঙ (src/app/layout.js এর viewport ফলব্যাকের
// সাথে মিলিয়ে রাখা) — কোনো শপ resolve না হলে, বা ECMS-এর নিজের legal পেজে।
const PLATFORM_THEME_COLOR = "#f472b6";

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

// ✅ প্রতিটা শপের নিজস্ব ব্রাউজার ট্যাব শিরোনাম + ফেভিকন (backend already
// resolves shop এর Navbar এ admin-সেট brand name/logo → হার্ডকোডেড platform
// ডিফল্ট "Hikmah IT", দেখুন controllers/shop/public.shop.controller.js ও
// constants/branding.constants.js) — getShopInfo() Next-এর per-request
// fetch cache-এ dedupe হয়, তাই এটা আলাদা কোনো extra backend call করে না
// (ShopLayout নিজেও এটাই কল করে)।
export async function generateMetadata({ params }) {
  // ✅ বেয়ার "/privacy-policy" ও "/terms-of-service" এখন middleware.js-এ
  // rewrite ছাড়াই সরাসরি নিজেদের static top-level page.js-এ যায় (তাই এই
  // ব্লকে আর পড়ে না) — শুধু পুরনো "?view=privacy-policy"/"?view=terms-of-service"
  // কোয়েরি-ফর্ম (যেকোনো path-এ, path/query থেকে middleware.js-এ x-legal-view
  // হেডারে ফরওয়ার্ড করা হয়) এখনো এখানেই resolve হয়, শপ resolve করার আগে —
  // কারণ কোনো ডোমেইনে (যেমন লোকাল dev-এ "localhost") বাস্তবে একটা শপ bound
  // থাকলেও এই ভিউ সবসময় ECMS-এর নিজের কনটেন্ট দেখাবে, শপের নিজস্ব
  // ব্র্যান্ডিং/টাইটেল দিয়ে override হবে না।
  const incomingHeaders = await headers();
  const legalView = incomingHeaders.get("x-legal-view");
  if (legalView === "privacy-policy" || legalView === "terms-of-service") {
    const title = legalView === "privacy-policy" ? "প্রাইভেসি পলিসি" : "ব্যবহারের শর্তাবলী";
    return {
      title: `${title} | ECMS — Hikmah IT`,
      manifest: "/manifest.json",
      icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/favicon.ico" },
    };
  }

  const { shopSlug } = await params;
  const { shop } = await getShop();

  // ✅ কোনো শপের সাথে যুক্ত নয় এমন ডোমেইনে (যেমন প্ল্যাটফর্মের নিজের রুট
  // ডোমেইন) ভিজিটর ঢুকলে নিচে PlatformLanding রেন্ডার হয় — সেই কেসে শপের
  // ডিফল্ট ফলব্যাক টাইটেলের বদলে প্ল্যাটফর্মের নিজস্ব marketing title/description দরকার।
  if (!shop && shopSlug === DOMAIN_MODE_MARKER) {
    return {
      title: "ECMS — সহজ ও শক্তিশালী ই-কমার্স প্ল্যাটফর্ম | Hikmah IT",
      description:
        "ECMS হলো Hikmah IT এর একটি ই-কমার্স সার্ভিস — সহজেই নিজের অনলাইন শপ তৈরি করে প্রোডাক্ট, অর্ডার ও পেমেন্ট নিয়ন্ত্রণ করুন।",
      manifest: "/manifest.json",
      icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/favicon.ico" },
    };
  }

  const title = shop?.branding?.title || "Hikmah IT";
  const favicon = shop?.branding?.favicon;
  // ✅ iOS হোম স্ক্রিনের আইকন ~180×180 এ আঁকে — 64×64 favicon দিলে সেখানে
  // ঝাপসা দেখাতো। logo আপলোডের সময় বানানো 192 PNG ভ্যারিয়েন্টটাই এখানে
  // সবচেয়ে ভালো (backend/src/services/brandIconService.js), সেটা না থাকলে
  // আগের মতোই favicon-এ ফলব্যাক।
  const appleIcon = shop?.branding?.pwaIcon192 || favicon;

  return {
    title,
    // ✅ মোবাইলে "Add to Home Screen"/install করলে এতদিন সব শপেই একটাই
    // স্ট্যাটিক manifest (হার্ডকোডেড "Hikmah IT") যেত। এখন প্রতিটা শপ নিজের
    // ডায়নামিক manifest পায় — path-based শপের ক্ষেত্রে সেটা "/shop/<slug>/"
    // এর নিচে, যাতে এক প্ল্যাটফর্ম ডোমেইনের দুই শপ ব্রাউজারের কাছে আলাদা
    // অ্যাপ হয়। দেখুন lib/manifest.js ও manifest.json/route.js।
    manifest: `${shopBasePath(shopSlug)}/manifest.json`,
    applicationName: title,
    // ✅ iOS Safari "Add to Home Screen"-এ আইকনের নিচের লেখাটা manifest এর
    // name/short_name থেকে নেয় না, এই meta ট্যাগ থেকে নেয় — এটা না দিলে
    // iPhone-এ শপের নামের বদলে পেজের <title> (বা পুরনো ক্যাশড নাম) বসে যেতো।
    appleWebApp: {
      capable: true,
      title: toShortName(title),
      statusBarStyle: "default",
    },
    icons: {
      icon: favicon || "/favicon.ico",
      shortcut: favicon || "/favicon.ico",
      apple: appleIcon || "/favicon.ico",
    },
  };
}

// ✅ Android-এ address bar ও task-switcher এই রঙে আঁকা হয় — src/app/layout.js
// এর হার্ডকোডেড প্ল্যাটফর্ম গোলাপি সব শপেই দেখাতো। শপের storefront theme যে
// primary রঙ ব্যবহার করে (lib/themeVars.js) সেটাই এখানে দেওয়া হয়, যাতে
// ইনস্টল করা PWA-র splash screen ও ব্রাউজার chrome শপের ব্র্যান্ডের সাথে মেলে।
// getShopInfo() Next-এর per-request fetch cache-এ dedupe হয়, তাই এটা বাড়তি
// কোনো backend call করে না।
export async function generateViewport() {
  // generateMetadata-এর মতোই legal view আগে চেক — ওই পেজগুলো শপের ডোমেইনে
  // খুললেও ECMS-এর নিজস্ব কনটেন্ট দেখায়, তাই শপের ব্র্যান্ড রঙ নয়,
  // প্ল্যাটফর্মের রঙই থাকা উচিত।
  const incomingHeaders = await headers();
  const legalView = incomingHeaders.get("x-legal-view");
  if (legalView === "privacy-policy" || legalView === "terms-of-service") {
    return { themeColor: PLATFORM_THEME_COLOR };
  }

  const { shop } = await getShop();
  const themeColor =
    shop?.theme?.colors?.primary ||
    shop?.branding?.themeColor ||
    PLATFORM_THEME_COLOR;

  return { themeColor };
}

export default async function ShopLayout({ children, params }) {
  // ✅ generateMetadata-এর মতো এখানেও legal view চেক শপ resolve করার আগে —
  // দেখুন উপরের generateMetadata-এর কমেন্ট, একই কারণ প্রযোজ্য। এই ব্লক এখন
  // শুধু পুরনো "?view=" কোয়েরি-ফর্মের জন্যই পৌঁছায়, বেয়ার path আর এখানে আসে না।
  const incomingHeaders = await headers();
  const legalView = incomingHeaders.get("x-legal-view");
  if (legalView === "privacy-policy" || legalView === "terms-of-service") {
    return (
      <PlatformLegalPage
        type={legalView === "privacy-policy" ? "privacy" : "terms"}
        adminUrl={process.env.SHOP_ADMIN_URL}
      />
    );
  }

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
    // ✅ কোনো ডোমেইন (path-based /shop/<slug> নয়, বরং সরাসরি কাস্টম বা
    // প্ল্যাটফর্মের নিজের ডোমেইন) কোনো শপের সাথে যুক্ত না থাকলে সাধারণ
    // "শপ খুঁজে পাওয়া যায়নি" 404 না দেখিয়ে প্ল্যাটফর্মের নিজস্ব marketing
    // ল্যান্ডিং পেজ দেখানো হয় — /shop/<ভুল-slug> এর জন্য নিচের real 404-ই থাকে।
    if (shopSlug === DOMAIN_MODE_MARKER) {
      return (
        <PlatformLanding
          adminUrl={process.env.SHOP_ADMIN_URL}
          whatsappNumber={process.env.SALES_WHATSAPP_NUMBER}
        />
      );
    }

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
    const originalPath = incomingHeaders.get("x-original-path") || `/shop/${shopSlug}`;
    const restPath = originalPath.slice(`/shop/${shopSlug}`.length) || "/";
    permanentRedirect(`https://${shop.domain}${restPath}`);
  }

  const { Navbar, Footer, mainClassName = "bg-white" } = getTheme(shop.theme?.baseLayout);
  const themeVars = buildThemeVars(shop.theme);

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
        <LoginNotice />
        <StorefrontChrome
          navbar={<Navbar />}
          footer={<Footer />}
          floatingActionButton={<FloatingActionButton />}
          mainClassName={mainClassName}
          themeVars={themeVars}
        >
          {children}
        </StorefrontChrome>
      </CartProvider>
    </UserProvider>
  );
}
