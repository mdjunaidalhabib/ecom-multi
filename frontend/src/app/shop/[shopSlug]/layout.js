import { CartProvider } from "../../../../context/CartContext";
import { UserProvider } from "../../../../context/UserContext";
import FloatingActionButton from "../../../../components/home/FloatingActionButton";
import StorefrontChrome from "../../../../components/StorefrontChrome";
import { getShopInfo } from "../../../../lib/serverApi";
import { getTheme } from "../../../../lib/themeRegistry";

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
    return await getShopInfo();
  } catch {
    return null;
  }
}

export default async function ShopLayout({ children }) {
  const shop = await getShop();
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

  const { Navbar, Footer, mainClassName = "bg-white" } = getTheme(shop.effectiveTheme);

  return (
    <UserProvider>
      <CartProvider>
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
