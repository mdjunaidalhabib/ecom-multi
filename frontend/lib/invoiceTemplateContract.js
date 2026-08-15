// ✅ Invoice টেমপ্লেট শেয়ার্ড কন্ট্রাক্ট (admin app কপি)। backend/src/constants/
// invoiceTemplate.js এর সাথে shape সিঙ্কে রাখতে হবে — কোনো shared package
// নেই এই monorepo-তে, তাই frontend/lib ও super-admin/lib এ একই ফাইল আলাদাভাবে
// ডুপ্লিকেট করা আছে।

export const ELEMENT_IDS = [
  "logo",
  "shopInfo",
  "customerInfo",
  "orderInfo",
  "itemsTable",
  "totals",
  "footerText",
];

export const ELEMENT_LABELS = {
  logo: "লোগো",
  shopInfo: "শপ তথ্য",
  customerInfo: "কাস্টমার তথ্য",
  orderInfo: "অর্ডার তথ্য",
  itemsTable: "আইটেম টেবিল",
  totals: "টোটাল/সামারি",
  footerText: "নোট / ফুটার",
};

export const DEFAULT_PAGE_SIZE = { width: 794, height: 1123 };

export const ITEMS_TABLE_COLUMN_KEYS = ["sl", "item", "price", "qty", "total"];

export function buildDefaultItemsTableColumns() {
  return [
    { key: "sl", label: "SL", visible: true, width: 40, order: 0 },
    { key: "item", label: "Item", visible: true, width: 380, order: 1 },
    { key: "price", label: "Price", visible: true, width: 100, order: 2 },
    { key: "qty", label: "Qty", visible: true, width: 87, order: 3 },
    { key: "total", label: "Total", visible: true, width: 87, order: 4 },
  ];
}

export function buildSeedTemplateElements() {
  return [
    { id: "logo", visible: true, x: 60, y: 20, width: 120, height: 70, zIndex: 1, fontSize: 14, color: "#111827", fontWeight: "normal", textAlign: "left", content: "" },
    { id: "shopInfo", visible: true, x: 200, y: 20, width: 340, height: 90, zIndex: 1, fontSize: 14, color: "#111827", fontWeight: "normal", textAlign: "left", content: "" },
    { id: "orderInfo", visible: true, x: 494, y: 150, width: 240, height: 100, zIndex: 1, fontSize: 14, color: "#111827", fontWeight: "normal", textAlign: "left", content: "" },
    { id: "customerInfo", visible: true, x: 60, y: 150, width: 400, height: 150, zIndex: 1, fontSize: 17, color: "#111827", fontWeight: "normal", textAlign: "left", content: "" },
    { id: "itemsTable", visible: true, x: 50, y: 330, width: 694, height: 320, zIndex: 1, fontSize: 13, color: "#111827", fontWeight: "normal", textAlign: "center", content: "", columns: buildDefaultItemsTableColumns() },
    { id: "totals", visible: true, x: 554, y: 670, width: 190, height: 160, zIndex: 1, fontSize: 12, color: "#111827", fontWeight: "normal", textAlign: "left", content: "" },
    { id: "footerText", visible: true, x: 60, y: 860, width: 400, height: 70, zIndex: 1, fontSize: 12, color: "#111827", fontWeight: "normal", textAlign: "left", content: "" },
  ];
}

export function normalizeTemplate(input) {
  const pageSize = { ...DEFAULT_PAGE_SIZE, ...(input?.pageSize || {}) };
  const seed = buildSeedTemplateElements();
  const seedById = Object.fromEntries(seed.map((e) => [e.id, e]));
  const incomingById = Object.fromEntries(
    (Array.isArray(input?.elements) ? input.elements : [])
      .filter((e) => e && ELEMENT_IDS.includes(e.id))
      .map((e) => [e.id, e]),
  );

  const elements = ELEMENT_IDS.map((id) => {
    const fallback = seedById[id];
    const incoming = incomingById[id] || {};
    const element = {
      ...fallback,
      ...incoming,
      id,
      columns: id === "itemsTable" ? normalizeColumns(incoming.columns) : undefined,
    };
    return element;
  });

  return {
    pageSize,
    background: {
      type: input?.background?.type === "image" ? "image" : "color",
      color: input?.background?.color || "#ffffff",
      imageUrl: input?.background?.imageUrl || "",
      imagePublicId: input?.background?.imagePublicId || "",
    },
    elements,
  };
}

function normalizeColumns(input) {
  const defaults = buildDefaultItemsTableColumns();
  const byKey = Object.fromEntries(
    (Array.isArray(input) ? input : [])
      .filter((c) => c && ITEMS_TABLE_COLUMN_KEYS.includes(c.key))
      .map((c) => [c.key, c]),
  );
  return defaults
    .map((fallback) => ({ ...fallback, ...(byKey[fallback.key] || {}), key: fallback.key }))
    .sort((a, b) => a.order - b.order);
}

/* ================= ORDER DISPLAY HELPERS (invoiceService.js থেকে পোর্ট করা) ================= */

export function formatCurrency(num) {
  return Number(num || 0).toLocaleString("en-BD");
}

export function shortOrderId(order) {
  if (order?.orderNumber != null) return `#${order.orderNumber}`;
  const id = order?._id ?? order;
  return `#${String(id).slice(-6).toUpperCase()}`;
}

export function formatOrderDateTime(date) {
  const d = new Date(date);
  return {
    datePart: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }),
    timePart: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    }),
  };
}

export function getInvoicePromoAmounts(order) {
  const legacyDiscount = Math.max(0, Number(order?.discount || 0));
  const snapshotDiscount = Math.max(0, Number(order?.promo?.discountAmount || 0));
  const itemDiscount = Math.max(legacyDiscount, snapshotDiscount);
  const shippingDiscount = Math.max(0, Number(order?.promo?.shippingDiscount || 0));

  return {
    itemDiscount,
    shippingDiscount,
    displayedDelivery: Math.max(0, Number(order?.deliveryCharge || 0)) + shippingDiscount,
    displayedDiscount: itemDiscount + shippingDiscount,
  };
}

export function buildPaymentStatusText(order) {
  const isManualPayment = (order?.paymentMethod || "cod") !== "cod";
  if (!isManualPayment) return null;

  if (order.paymentStatus === "paid") return { text: "Verified ✅", color: "#059669" };
  if (order.paymentStatus === "failed") return { text: "Rejected ❌", color: "#dc2626" };
  return { text: "Pending Verification ⚠️", color: "#b45309" };
}

/* ================= DESIGNER PREVIEW SAMPLE DATA ================= */

export function buildSampleOrder() {
  return {
    orderNumber: 1024,
    createdAt: new Date().toISOString(),
    paymentMethod: "cod",
    paymentStatus: "pending",
    billing: { name: "রহিম উদ্দিন", phone: "01712345678", address: "১২৩ মেইন রোড, ঢাকা", note: "দ্রুত পাঠানোর অনুরোধ রইলো" },
    items: [
      { productId: "1", name: "নমুনা প্রোডাক্ট ১", price: 350, qty: 2 },
      { productId: "2", name: "নমুনা প্রোডাক্ট ২", price: 500, qty: 1 },
    ],
    subtotal: 1200,
    deliveryCharge: 120,
    discount: 0,
    total: 1320,
  };
}

export function buildSampleShop() {
  return { name: "আপনার শপের নাম", logo: "", contactPhone: "01700000000", contactEmail: "shop@example.com" };
}

export function buildExtraSummaryRows(order) {
  const isManualPayment = (order?.paymentMethod || "cod") !== "cod";
  const isAdvancePaid = isManualPayment && order?.paymentStatus === "paid";
  if (!isAdvancePaid) return [];

  const deliveryCharge = Number(order.deliveryCharge || 0);
  const total = Number(order.total || 0);
  const codAmount = Math.max(0, total - deliveryCharge);

  return [
    { label: "Advance Payment", value: `${formatCurrency(deliveryCharge)} tk`, variant: "advance" },
    { label: "COD", value: `${formatCurrency(codAmount)} tk`, variant: "cod" },
  ];
}
