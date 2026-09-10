import PlatformLanding from "../../components/platform/PlatformLanding";

// Platform's own domain (PLATFORM_DOMAIN in .env) — see
// frontend/src/middleware.js, which leaves requests to this domain
// unrewritten so this file renders directly instead of going through the
// /shop/[shopSlug] tree's "no shop found" fallback.
export const metadata = {
  title: "ECMS — সহজ ও শক্তিশালী ই-কমার্স প্ল্যাটফর্ম | Hikmah IT",
  description:
    "ECMS হলো Hikmah IT এর একটি ই-কমার্স সার্ভিস — সহজেই নিজের অনলাইন শপ তৈরি করে প্রোডাক্ট, অর্ডার ও পেমেন্ট নিয়ন্ত্রণ করুন।",
};

export default function HomePage() {
  return (
    <PlatformLanding
      adminUrl={process.env.SHOP_ADMIN_URL}
      whatsappNumber={process.env.SALES_WHATSAPP_NUMBER}
    />
  );
}
