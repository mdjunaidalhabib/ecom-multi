import InvoicePrintClient from "../../../../../components/invoiceDesigner/InvoicePrintClient";

// প্রতিবার fresh অর্ডার ডেটা লাগবে (headless Chromium যেই মুহূর্তে PDF
// জেনারেট করছে সেই মুহূর্তের ডেটা) — Next.js এর fetch cache-এর উপর নির্ভর
// করা যাবে না।
export const dynamic = "force-dynamic";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

// ✅ headless Chromium (backend/src/services/invoiceExportService.js) সরাসরি
// এই সার্ভারকে হিট করে — কোনো শপ ডোমেইন/স্লাগ হেডার সাথে আসে না, তাই backend-এর
// /print/invoice/:id এন্ডপয়েন্ট ব্যবহার করা হচ্ছে (resolveShopByDomain এর আগে
// বসানো, order.shopId দিয়ে নিজে থেকেই শপ resolve করে — দেখুন
// backend/src/routes/public/index.js)।
async function getInvoiceData(id) {
  const res = await fetch(`${BACKEND_API_URL}/print/invoice/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function PrintInvoicePage({ params }) {
  const { id } = await params;
  const data = await getInvoiceData(id);

  if (!data?.order) {
    // data-ready="true" এখানেও লাগবে — নাহলে Playwright অর্ডার না-পাওয়া
    // অবস্থাতেও ৬০ সেকেন্ড আটকে থেকে টাইমআউট হবে।
    return (
      <div data-ready="true" style={{ padding: 40, fontFamily: "sans-serif" }}>
        Order not found
      </div>
    );
  }

  return (
    <InvoicePrintClient order={data.order} template={data.template} shop={data.shop} />
  );
}
