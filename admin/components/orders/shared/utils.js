import { formatDateTime } from "../../../lib/utils.js";

/**
 * ✅ Manual/mobile-banking payments (bKash/Nagad/etc.) must be verified
 * (accepted/rejected) by admin from Payments > Pending Verification
 * before the order can move forward in the status flow.
 * COD orders are exempt (cash is collected on delivery).
 */
export function needsPaymentVerification(o) {
  return (
    !!o?.paymentMethod &&
    o.paymentMethod !== "cod" &&
    o.paymentStatus === "pending"
  );
}

/**
 * ✅ Offline (in-store) sale-এ "cod" ভ্যালুটাই থাকে (backend/flow অপরিবর্তিত
 * রাখতে), কিন্তু UI-তে সেটাকে ডেলিভারির "COD" না বলে "CASH" দেখানো হয় —
 * CreateOrderModal-এর Payment Method ফিল্ডে যেভাবে দেখানো হয় সেভাবেই।
 */
export function paymentMethodLabel(o) {
  if (o?.saleChannel === "offline" && o?.paymentMethod === "cod") {
    return "CASH";
  }
  return o?.paymentMethod?.toUpperCase() || "";
}

/* ===========================
   🏭 WHOLESALE (পাইকারি) হিসাব
   - বাকি (due) আলাদা সংরক্ষণ হয় না, সবসময় হিসাব হয়: total - paidAmount
   - backend (order.admin.routes.js) এর একই সূত্র
=========================== */
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const isWholesale = (o) => o?.saleChannel === "wholesale";

// cancelled/returned অর্ডারের বাকি আর গণনায় ধরা হয় না
export const isDueActive = (o) =>
  isWholesale(o) && o.status !== "cancelled" && o.status !== "returned";

export function wholesalePaid(o) {
  const total = Number(o?.total || 0);
  return Math.min(total, Math.max(0, round2(o?.paidAmount)));
}

export function wholesaleDue(o) {
  return Math.max(0, round2(Number(o?.total || 0) - Number(o?.paidAmount || 0)));
}

export function formatOrderTime(o) {
  const raw = o?.createdAt || o?.orderDate || o?.date;
  return formatDateTime(raw, { year: undefined });
}
