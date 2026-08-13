import "./globals.css";
import PWARegister from "../../components/pwa/pwa-register";

// ✅ Metadata (UPDATED)
export const metadata = {
  title: "Cartvan | Trusted Best Online Shopping Platform in Bangladesh",
  description:
    "cartvan is a reliable e-commerce platform in Bangladesh offering quality products at competitive prices.",

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
      <body className="flex flex-col min-h-screen bg-gray-50">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
