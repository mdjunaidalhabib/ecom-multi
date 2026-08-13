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

export function formatOrderTime(o) {
  const raw = o?.createdAt || o?.orderDate || o?.date;
  return formatDateTime(raw, { year: undefined });
}
