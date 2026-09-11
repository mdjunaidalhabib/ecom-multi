import "./globals.css";
import PWARegister from "../../components/pwa/pwa-register";
import FontLoader from "../../components/FontLoader";

// ✅ Metadata (UPDATED) — এটা শুধু আল্টিমেট ফলব্যাক (কোনো কারণে
// shop/[shopSlug]/layout.js এর generateMetadata() না চললে)। আসল
// per-shop title/favicon সেখানেই ঠিক হয় (হার্ডকোডেড platform ডিফল্ট "Hikmah
// IT", বা শপের নিজের Navbar এ সেট করা brand name/logo) — দেখুন
// controllers/shop/public.shop.controller.js
export const metadata = {
  title: "Hikmah IT",
  description:
    "Hikmah IT is a reliable e-commerce platform in Bangladesh offering quality products at competitive prices.",

  // ✅ "/manifest.json" এখন আর স্ট্যাটিক public/ ফাইল নয় — প্রতিটা শপের
  // নিজের নাম/আইকন নিয়ে ডায়নামিকভাবে সার্ভ হয় (custom domain হলে
  // src/app/manifest.json/route.js, path-based হলে
  // src/app/shop/[shopSlug]/manifest.json/route.js)। শপ পেজে
  // shop/[shopSlug]/layout.js এর generateMetadata() এটাকে শপ-স্কোপড URL
  // দিয়ে override করে; এখানকার মানটা শুধু প্ল্যাটফর্মের নিজের পেজগুলোর জন্য।
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// ✅ Correct viewport সেটআপ — শপ স্টোরফ্রন্টে এই হার্ডকোডেড প্ল্যাটফর্ম রঙটা
// shop/[shopSlug]/layout.js এর generateViewport() দিয়ে শপের নিজস্ব theme
// primary রঙ দিয়ে override হয়; এটা শুধু প্ল্যাটফর্মের নিজের পেজগুলোর ফলব্যাক।
export const viewport = {
  themeColor: "#f472b6",
};

// Bare HTML shell — every actual page (both custom-domain and
// /shop/<slug> path-based visitors) is rendered inside
// src/app/shop/[shopSlug]/layout.js, which is where Navbar/Footer/cart
// & user context live, since they're inherently shop-scoped.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Invoice renderer "Hind Siliguri" ফন্ট নাম দিয়ে টেক্সট আঁকে, কিন্তু
        এই ফন্ট আগে কোথাও লোডই হতো না — দেখুন admin/src/app/layout.js এর কমেন্ট।
        স্টাইলশিটটা render-blocking না করে FontLoader দিয়ে async লোড করা হয় —
        নিচের কমেন্ট দেখুন। */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <FontLoader />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
