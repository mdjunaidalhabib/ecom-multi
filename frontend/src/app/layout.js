import "./globals.css";
import PWARegister from "../../components/pwa/pwa-register";

// ✅ Metadata (UPDATED) — এটা শুধু আল্টিমেট ফলব্যাক (কোনো কারণে
// shop/[shopSlug]/layout.js এর generateMetadata() না চললে)। আসল
// per-shop title/favicon সেখানেই ঠিক হয় (super-admin এর platform ডিফল্ট,
// বা শপের নিজের override) — দেখুন controllers/shop/public.shop.controller.js
export const metadata = {
  title: "Hikmah IT",
  description:
    "Hikmah IT is a reliable e-commerce platform in Bangladesh offering quality products at competitive prices.",

  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// ✅ Correct viewport সেটআপ
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
        এই ফন্ট আগে কোথাও লোডই হতো না — দেখুন admin/src/app/layout.js এর কমেন্ট */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
