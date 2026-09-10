import PlatformLegalPage from "../../../components/platform/PlatformLegalPage";

// Platform's own domain (PLATFORM_DOMAIN in .env) — see
// frontend/src/middleware.js. A shop's own terms of service lives at
// /shop/<slug>/terms-of-service (frontend/src/app/shop/[shopSlug]/terms-of-service)
// and is unrelated to this platform-level page.
export const metadata = {
  title: "ব্যবহারের শর্তাবলী | ECMS — Hikmah IT",
};

export default function TermsOfServicePage() {
  return <PlatformLegalPage type="terms" adminUrl={process.env.SHOP_ADMIN_URL} />;
}
