// ✅ Invoice টেমপ্লেট — shared element-schema contract (server-side)।
// এই একই shape admin/frontend/super-admin অ্যাপেও আলাদাভাবে duplicate করা
// আছে (কোনো shared package নেই এই monorepo-তে), তাই এখানে shape বদলালে
// admin/lib/invoiceTemplateContract.js, frontend/lib/invoiceTemplateContract.js,
// super-admin/lib/invoiceTemplateContract.js — এই তিনটাও ম্যানুয়ালি সিঙ্কে
// রাখতে হবে।

export const ELEMENT_IDS = [
  "logo",
  "shopName",
  "shopPhone",
  "shopEmail",
  "customerInfo",
  "orderInfo",
  "itemsTable",
  "orderNote",
  "totals",
  "footerText",
];

// A4 @ 96dpi — পুরনো invoice.css ও এই px scale-এই লেখা ছিল (210mm ≈ 794px)
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

// পুরনো hardcoded invoice.html/invoice.css লেআউটের সাথে যতটা সম্ভব মিলিয়ে
// বানানো ডিফল্ট পজিশন — শুধু একটা sensible starting point, admin ড্র্যাগ করে
// ইচ্ছামতো বদলাতে পারবে।
export function buildSeedTemplateElements() {
  return [
    {
      id: "logo",
      visible: true,
      x: 60,
      y: 20,
      width: 120,
      height: 70,
      zIndex: 1,
      fontSize: 14,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "shopName",
      visible: true,
      x: 200,
      y: 20,
      width: 340,
      height: 30,
      zIndex: 1,
      fontSize: 17,
      color: "#111827",
      fontWeight: "bold",
      textAlign: "left",
      content: "",
    },
    {
      id: "shopPhone",
      visible: true,
      x: 200,
      y: 54,
      width: 340,
      height: 26,
      zIndex: 1,
      fontSize: 13,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "shopEmail",
      visible: true,
      x: 200,
      y: 82,
      width: 340,
      height: 26,
      zIndex: 1,
      fontSize: 13,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "orderInfo",
      visible: true,
      x: 494,
      y: 150,
      width: 240,
      height: 100,
      zIndex: 1,
      fontSize: 14,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "customerInfo",
      visible: true,
      x: 60,
      y: 150,
      width: 400,
      height: 120,
      zIndex: 1,
      fontSize: 17,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "itemsTable",
      visible: true,
      x: 50,
      y: 330,
      width: 694,
      height: 320,
      zIndex: 1,
      fontSize: 13,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "center",
      content: "",
      columns: buildDefaultItemsTableColumns(),
    },
    {
      id: "orderNote",
      visible: true,
      x: 60,
      y: 670,
      width: 474,
      height: 150,
      zIndex: 1,
      fontSize: 13,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "totals",
      visible: true,
      x: 554,
      y: 670,
      width: 190,
      height: 160,
      zIndex: 1,
      fontSize: 12,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
    {
      id: "footerText",
      visible: true,
      x: 60,
      y: 860,
      width: 400,
      height: 70,
      zIndex: 1,
      fontSize: 12,
      color: "#111827",
      fontWeight: "normal",
      textAlign: "left",
      content: "",
    },
  ];
}

// ক্লায়েন্ট থেকে আসা template body-কে trusted শেপে normalize করে — অচেনা
// element/column বাদ, missing element/column সেফ ডিফল্ট দিয়ে ভরাট, x/y/width/
// height কে pageSize-এর মধ্যে clamp করে। এটাই একমাত্র জায়গা যেখানে save
// করার আগে template-কে বিশ্বাসযোগ্য করা হয় — client-side canvas math কখনো
// সরাসরি বিশ্বাস করা হয় না।
export function normalizeTemplate(input, pageSize = DEFAULT_PAGE_SIZE) {
  const seed = buildSeedTemplateElements();
  const seedByid = Object.fromEntries(seed.map((e) => [e.id, e]));

  const incomingElements = Array.isArray(input?.elements) ? input.elements : [];
  const incomingById = Object.fromEntries(
    incomingElements
      .filter((e) => e && ELEMENT_IDS.includes(e.id))
      .map((e) => [e.id, e]),
  );

  const elements = ELEMENT_IDS.map((id) => {
    const fallback = seedByid[id];
    const incoming = incomingById[id] || {};

    const width = clampNumber(incoming.width, fallback.width, 10, pageSize.width);
    const height = clampNumber(incoming.height, fallback.height, 10, pageSize.height);
    const x = clampNumber(incoming.x, fallback.x, 0, pageSize.width - width);
    const y = clampNumber(incoming.y, fallback.y, 0, pageSize.height - height);

    const element = {
      id,
      visible: typeof incoming.visible === "boolean" ? incoming.visible : fallback.visible,
      x,
      y,
      width,
      height,
      zIndex: clampNumber(incoming.zIndex, fallback.zIndex, 0, 999),
      fontSize: clampNumber(incoming.fontSize, fallback.fontSize, 8, 72),
      color: isHexColor(incoming.color) ? incoming.color : fallback.color,
      fontWeight: incoming.fontWeight === "bold" ? "bold" : "normal",
      textAlign: ["left", "center", "right"].includes(incoming.textAlign)
        ? incoming.textAlign
        : fallback.textAlign,
      content:
        id === "footerText" ? String(incoming.content ?? fallback.content ?? "").slice(0, 500) : "",
    };

    if (id === "itemsTable") {
      element.columns = normalizeColumns(incoming.columns);
    }

    return element;
  });

  return {
    pageSize: { ...DEFAULT_PAGE_SIZE, ...pageSize },
    background: normalizeBackground(input?.background),
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
    .map((fallback) => {
      const incoming = byKey[fallback.key] || {};
      return {
        key: fallback.key,
        label: String(incoming.label ?? fallback.label ?? "").slice(0, 30) || fallback.label,
        visible: typeof incoming.visible === "boolean" ? incoming.visible : fallback.visible,
        width: clampNumber(incoming.width, fallback.width, 20, 600),
        order: clampNumber(incoming.order, fallback.order, 0, 4),
      };
    })
    .sort((a, b) => a.order - b.order);
}

function normalizeBackground(input) {
  const type = input?.type === "image" ? "image" : "color";
  return {
    type,
    color: isHexColor(input?.color) ? input.color : "#ffffff",
    imageUrl: typeof input?.imageUrl === "string" ? input.imageUrl.slice(0, 1000) : "",
    imagePublicId:
      typeof input?.imagePublicId === "string" ? input.imagePublicId.slice(0, 300) : "",
  };
}

// ✅ Invoice ডিজাইনারের প্রিভিউতে দেখানো নমুনা/ডেমো অর্ডার — super-admin
// এডিট করতে পারে (InvoiceTemplateDefault.js এ সেভ হয়), admin এর নিজের
// ডিজাইনার প্রিভিউও এই একই ডেটা ফেচ করে দেখায়। শুধু প্রিভিউয়ের জন্য —
// এটা কোনো real order না।
export function buildDefaultSampleOrder() {
  return {
    saleChannel: "online",
    paymentMethod: "cod",
    paymentStatus: "pending",
    billing: {
      name: "রহিম উদ্দিন",
      phone: "01712345678",
      address: "১২৩ মেইন রোড, ঢাকা",
      note: "দ্রুত পাঠানোর অনুরোধ রইলো",
    },
    items: [
      { name: "নমুনা প্রোডাক্ট ১", price: 350, qty: 2 },
      { name: "নমুনা প্রোডাক্ট ২", price: 500, qty: 1 },
    ],
    deliveryCharge: 120,
    discount: 0,
  };
}

// ✅ Invoice ডিজাইনারের প্রিভিউতে দেখানো নমুনা/ডেমো শপ তথ্য — super-admin
// এডিট করতে পারে। শুধু super-admin-এর নিজের প্রিভিউয়ের জন্য — admin panel
// নিজের ডিজাইনারে সবসময় নিজের real shop-এর নাম/ফোন/ইমেইল দেখায় (দেখুন
// admin/components/invoiceDesigner/InvoiceDesignerPanel.jsx), এটা না।
export function buildDefaultSampleShop() {
  return {
    name: "আপনার শপের নাম",
    contactPhone: "01700000000",
    contactEmail: "shop@example.com",
  };
}

export function normalizeSampleShop(input) {
  const fallback = buildDefaultSampleShop();
  return {
    name: String(input?.name ?? fallback.name).slice(0, 100),
    contactPhone: String(input?.contactPhone ?? fallback.contactPhone).slice(0, 30),
    contactEmail: String(input?.contactEmail ?? fallback.contactEmail).slice(0, 100),
  };
}

export function normalizeSampleOrder(input) {
  const fallback = buildDefaultSampleOrder();
  const items = Array.isArray(input?.items) && input.items.length ? input.items : fallback.items;

  return {
    saleChannel: input?.saleChannel === "offline" ? "offline" : "online",
    paymentMethod:
      String(input?.paymentMethod ?? "").trim().slice(0, 40) || fallback.paymentMethod,
    paymentStatus: ["pending", "paid", "failed"].includes(input?.paymentStatus)
      ? input.paymentStatus
      : fallback.paymentStatus,
    billing: {
      name: String(input?.billing?.name ?? fallback.billing.name).slice(0, 100),
      phone: String(input?.billing?.phone ?? fallback.billing.phone).slice(0, 30),
      address: String(input?.billing?.address ?? fallback.billing.address).slice(0, 300),
      note: String(input?.billing?.note ?? fallback.billing.note).slice(0, 300),
    },
    items: items.slice(0, 10).map((it) => ({
      name: String(it?.name ?? "").slice(0, 100),
      price: clampNumber(it?.price, 0, 0, 10_000_000),
      qty: clampNumber(it?.qty, 1, 1, 1000),
    })),
    deliveryCharge: clampNumber(input?.deliveryCharge, fallback.deliveryCharge, 0, 1_000_000),
    discount: clampNumber(input?.discount, fallback.discount, 0, 1_000_000),
  };
}

function clampNumber(value, fallback, min, max) {
  const n = Number(value);
  const base = Number.isFinite(n) ? n : fallback;
  return Math.min(Math.max(base, min), Math.max(min, max));
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value);
}
