import PlatformLegalPage from "../../../components/platform/PlatformLegalPage";

// Platform's own domain (PLATFORM_DOMAIN in .env) — see
// frontend/src/middleware.js. A shop's own privacy policy lives at
// /shop/<slug>/privacy-policy (frontend/src/app/shop/[shopSlug]/privacy-policy)
// and is unrelated to this platform-level page.
export const metadata = {
  title: "প্রাইভেসি পলিসি | ECMS — Hikmah IT",
};

export default function PrivacyPolicyPage() {
  return <PlatformLegalPage type="privacy" adminUrl={process.env.SHOP_ADMIN_URL} />;
}
