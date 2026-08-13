import { CartProvider } from "../../../../context/CartContext";
import { UserProvider } from "../../../../context/UserContext";
import Navbar from "../../../../components/navbar/Navbar";
import Footer from "../../../../components/home/footer";
import FloatingActionButton from "../../../../components/home/FloatingActionButton";
import { serverFetch } from "../../../../lib/serverApi";

// Both custom-domain visitors (rewritten to /shop/__domain__/... by
// frontend/src/middleware.js) and real path-based visitors (/shop/<slug>/...)
// render through this layout — the backend's resolveShopByDomain
// (backend/src/tenancy/publicShopResolver.js) already 404s any public
// endpoint when the shop can't be resolved, so a cheap existing call is
// enough to turn an unknown slug/domain into a real not-found page instead
// of a silently-empty storefront.
async function shopExists() {
  try {
    await serverFetch("/navbar");
    return true;
  } catch {
    return false;
  }
}

export default async function ShopLayout({ children }) {
  if (!(await shopExists())) {
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

  return (
    <UserProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-grow bg-pink-50">
          <div className="mx-auto w-full">{children}</div>
        </main>
        <Footer />
        <FloatingActionButton />
      </CartProvider>
    </UserProvider>
  );
}
