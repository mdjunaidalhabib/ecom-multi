import PlatformLanding from "../../components/platform/PlatformLanding";
import { serverFetch } from "../../lib/serverApi";

// Platform's own domain (PLATFORM_DOMAIN in .env) — see
// frontend/src/middleware.js, which leaves requests to this domain
// unrewritten so this file renders directly instead of going through the
// /shop/[shopSlug] tree's "no shop found" fallback.
export const metadata = {
  title: "ECMS — সহজ ও শক্তিশালী ই-কমার্স প্ল্যাটফর্ম | Hikmah IT",
  description:
    "ECMS হলো Hikmah IT এর একটি ই-কমার্স সার্ভিস — সহজেই নিজের অনলাইন শপ তৈরি করে প্রোডাক্ট, অর্ডার ও পেমেন্ট নিয়ন্ত্রণ করুন।",
};

// ✅ প্ল্যান এখন ডাটাবেস (সুপার-অ্যাডমিন → Plans) থেকে আসে। ব্যাকএন্ড বন্ধ/ফেল
// করলে খালি তালিকা যায়, আর PlatformLanding নিজের ফলব্যাক প্ল্যান দেখায়।
async function getPlans() {
  try {
    const plans = await serverFetch("/plans", { revalidate: 60 });
    return Array.isArray(plans) ? plans : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const plans = await getPlans();
  return (
    <PlatformLanding
      plans={plans}
      adminUrl={process.env.SHOP_ADMIN_URL}
      whatsappNumber={process.env.SALES_WHATSAPP_NUMBER}
      hikmahSiteUrl={process.env.HIKMAH_SITE_URL}
    />
  );
}
