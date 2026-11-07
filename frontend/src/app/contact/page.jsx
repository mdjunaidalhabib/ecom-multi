import PlatformFooter from "../../../components/platform/PlatformFooter";
import PlatformHeader from "../../../components/platform/PlatformHeader";
import PlatformContactFab from "../../../components/platform/PlatformContactFab";
import LeadForm from "../../../components/platform/LeadForm";
import GoogleTagManager from "../../../components/tracking/GoogleTagManager";
import { serverFetch } from "../../../lib/serverApi";
import { leadPlanName } from "../../../lib/leadGeneration";

export const metadata = {
  title: "আপনার ব্যবসার জন্য সঠিক সমাধান | ECMS — Hikmah IT",
  description: "ECMS দিয়ে অনলাইন ব্যবসা শুরু বা সম্প্রসারণ করুন। আপনার তথ্য দিন, আমাদের টিম সঠিক প্ল্যান বেছে নিতে সাহায্য করবে।",
};

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const plan = leadPlanName(params?.plan);
  let gtmId = "";
  try {
    const tracking = await serverFetch("/platform-tracking", { revalidate: 60 });
    gtmId = typeof tracking?.gtmId === "string" ? tracking.gtmId : "";
  } catch { /* The form remains available when tracking is unavailable. */ }

  return (
    <div className="min-h-screen overflow-x-clip bg-orange-50/40 text-gray-900" style={{ fontFamily: '"Hind Siliguri", ui-sans-serif, system-ui, sans-serif' }}>
      <GoogleTagManager gtmId={gtmId} />
      <PlatformHeader adminUrl={process.env.SHOP_ADMIN_URL} />
      <main><LeadForm key={plan} initialPlan={plan} /></main>
      <PlatformFooter />
      <PlatformContactFab whatsappNumber={process.env.SALES_WHATSAPP_NUMBER} />
    </div>
  );
}
