"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Globe,
  Store,
  User,
  Package,
  Plus,
  Minus,
  Search,
  Trash2,
  Wallet,
  Truck,
  Receipt,
  ShoppingBag,
  ChevronDown,
  ImageOff,
  LayoutGrid,
} from "lucide-react";

const phoneRegex = /^(01[3-9]\d{8})$/;
const PRODUCTS_PAGE_SIZE = 20;

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
        <Icon size={15} />
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</div>
    </div>
  );
}

export default function CreateOrderModal({ open, onClose, onCreate, submitting = false, API }) {
  /* ===========================
     ✅ PRODUCTS
     পুরো ক্যাটালগ একসাথে লোড না করে, item হিসেবে PICK করা প্রোডাক্টগুলোই
     এখানে id দিয়ে ম্যাপ করে রাখা হয় (getProduct/stock/price দেখানোর জন্য)।
     ব্রাউজ/সার্চ লিস্টের জন্য নিচে আলাদা paginated picker state আছে।
  ============================ */
  const [selectedProducts, setSelectedProducts] = useState({});

  /* ===========================
     ✅ CATEGORIES (picker ফিল্টারের জন্য, একবার লোড হয়)
  ============================ */
  const [categories, setCategories] = useState([]);

  /* ===========================
     ✅ DELIVERY CHARGE (DB)
  ============================ */
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(true);

  /* ===========================
     ✅ PRODUCT PICKER POPUP (server-side pagination + search, একসাথে
     পুরো ক্যাটালগ লোড না করে per-page নির্দিষ্ট সংখ্যক প্রোডাক্ট আনা হয়)
  ============================ */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(null);
  const [productQuery, setProductQuery] = useState("");
  const [productQueryDebounced, setProductQueryDebounced] = useState("");
  const [pickerCategoryId, setPickerCategoryId] = useState("");
  const [pickerProducts, setPickerProducts] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(true);
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerTotalPages, setPickerTotalPages] = useState(1);
  const [pickerTotal, setPickerTotal] = useState(0);

  /* ===========================
     ✅ SALE CHANNEL
  ============================ */
  const [saleChannel, setSaleChannel] = useState("online");
  const isOffline = saleChannel === "offline";

  /* ===========================
     ✅ BILLING
  ============================ */
  const [billing, setBilling] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
  });

  /* ===========================
     ✅ ORDER SETTINGS
  ============================ */
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [status, setStatus] = useState("pending");

  /* ===========================
     ✅ ITEMS
  ============================ */
  const [items, setItems] = useState([{ productId: "", qty: 1, color: null }]);

  /* ===========================
     ✅ LOAD CATEGORIES ONCE WHEN OPEN (picker ফিল্টার ড্রপডাউনের জন্য)
  ============================ */
  useEffect(() => {
    if (!open) return;

    let alive = true;

    fetch(`${API}/admin/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
      });

    return () => {
      alive = false;
    };
  }, [open, API]);

  /* ===========================
     ✅ DEBOUNCE SEARCH INPUT
  ============================ */
  useEffect(() => {
    const t = setTimeout(() => {
      setProductQueryDebounced(productQuery.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [productQuery]);

  // ✅ সার্চ/ক্যাটাগরি বদলালে পেজ ১-এ ফিরে যায়
  useEffect(() => {
    setPickerPage(1);
  }, [productQueryDebounced, pickerCategoryId]);

  /* ===========================
     ✅ LOAD PICKER PRODUCTS (PAGINATED, SEARCH/CATEGORY অনুযায়ী)
     পুরো ক্যাটালগ একসাথে লোড না করে per-page নির্দিষ্ট সংখ্যক প্রোডাক্ট আনা হয়,
     ফলে বড় ক্যাটালগেও পিকার খুলতে/সার্চ করতে দ্রুত লোড হয়।
  ============================ */
  useEffect(() => {
    if (!open || !pickerOpen) return;

    let alive = true;
    setPickerLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(pickerPage));
    params.set("limit", String(PRODUCTS_PAGE_SIZE));
    if (pickerCategoryId) params.set("category", pickerCategoryId);
    if (productQueryDebounced) params.set("search", productQueryDebounced);

    // ✅ Admin endpoint ব্যবহার করা হচ্ছে (public endpoint শুধু active category-এর
    // active প্রোডাক্ট দেখায়, ফলে হিডেন/ইনঅ্যাক্টিভ প্রোডাক্ট পিকারে আসত না)
    fetch(`${API}/admin/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data?.products) ? data.products : [];
        setPickerProducts(list);
        setPickerTotal(Number(data?.total) || 0);
        setPickerTotalPages(Math.max(1, Number(data?.totalPages) || 1));
      })
      .catch(() => {
        if (!alive) return;
        setPickerProducts([]);
        setPickerTotal(0);
        setPickerTotalPages(1);
      })
      .finally(() => {
        if (!alive) return;
        setPickerLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, pickerOpen, pickerPage, pickerCategoryId, productQueryDebounced, API]);

  /* ===========================
     ✅ LOAD DELIVERY CHARGE FROM DB
  ============================ */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setDeliveryLoading(true);

    fetch(`${API}/admin/deliveryCharge`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        const fee = Number(data?.fee);
        setDeliveryCharge(Number.isFinite(fee) ? fee : 0);
      })
      .catch(() => {
        if (!alive) return;
        setDeliveryCharge(0);
      })
      .finally(() => {
        if (!alive) return;
        setDeliveryLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, API]);

  /* ===========================
     ✅ RESET ON OPEN
  ============================ */
  useEffect(() => {
    if (!open) return;

    setPickerOpen(false);
    setPickerIndex(null);
    setProductQuery("");
    setProductQueryDebounced("");
    setPickerCategoryId("");
    setPickerPage(1);
    setSelectedProducts({});

    setSaleChannel("online");
    setTouched({ name: false, phone: false, address: false });
    setBilling({ name: "", phone: "", address: "", note: "" });
    setItems([{ productId: "", qty: 1, color: null }]);

    setDiscount(0);
    setPaymentMethod("cod");
    setPaymentStatus("pending");
    setStatus("pending");
  }, [open]);

  /* ===========================
     ✅ HELPERS
  ============================ */
  const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const getProduct = (pid) => selectedProducts[String(pid)];

  const findVariant = (p, color) => {
    if (!p || !color) return null;
    const target = String(color).trim().toLowerCase();
    const colors = Array.isArray(p.colors) ? p.colors : [];
    return (
      colors.find(
        (c) =>
          String(c?.name || "")
            .trim()
            .toLowerCase() === target
      ) || null
    );
  };

  /* ===========================
     ✅ VIEW ITEMS FOR SUMMARY
  ============================ */
  const viewItems = useMemo(() => {
    return items
      .map((it) => {
        const p = getProduct(it.productId);
        if (!p) return null;

        const variant = findVariant(p, it.color);
        const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);

        const image =
          variant?.images?.[0] ||
          p.image ||
          (Array.isArray(p.images) ? p.images[0] : null) ||
          "/no-image.png";

        return {
          ...it,
          name: p.name || "Product",
          // ✅ ভ্যারিয়েন্ট সিলেক্ট করা থাকলে সেই ভ্যারিয়েন্টের নিজস্ব price
          // ব্যবহার হবে, নাহলে product-এর base price (price mismatch এড়াতে)
          price: toNumber(variant?.price ?? p.price, 0),
          stock,
          image,
          colorLabel: variant?.name || it.color || null,
        };
      })
      .filter(Boolean);
  }, [items, selectedProducts]);

  const subtotal = viewItems.reduce(
    (sum, it) => sum + toNumber(it.price, 0) * toNumber(it.qty, 0),
    0
  );

  // ✅ Offline (in-store) sale-এ ডেলিভারি চার্জ প্রযোজ্য নয়
  const effectiveDeliveryCharge = isOffline ? 0 : toNumber(deliveryCharge, 0);

  const total = Math.max(
    0,
    subtotal + effectiveDeliveryCharge - toNumber(discount, 0)
  );

  /* ===========================
     ✅ VALIDATION
     Offline sale-এ billing info ঐচ্ছিক
  ============================ */
  const errors = {
    name: !isOffline && !billing.name.trim(),
    phone:
      !isOffline &&
      (!billing.phone.trim() || !phoneRegex.test(billing.phone.trim())),
    address: !isOffline && !billing.address.trim(),
  };

  const hasValidItem = items.some(
    (x) => x.productId && toNumber(x.qty, 0) > 0
  );

  // ✅ কোনো আইটেমের প্রোডাক্ট/কালার সিলেক্ট করা থাকলে কিন্তু স্টক না থাকলে
  // (বা qty 0 হলে) Create Order বাটন disable থাকবে
  const hasOutOfStockItem = items.some((x) => {
    if (!x.productId) return false;
    const p = getProduct(x.productId);
    if (!p) return false;
    const variant = findVariant(p, x.color);
    const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);
    return stock <= 0 || toNumber(x.qty, 0) <= 0;
  });

  // ✅ প্রোডাক্টে ভ্যারিয়েন্ট থাকলে (colors.length > 0) সেটা সিলেক্ট না করে
  // সাবমিট করা যাবে না — নাহলে ডিফল্ট (প্রথম ভ্যারিয়েন্টের) দামে ভুল বিক্রি
  // হয়ে যাওয়ার সম্ভাবনা থাকে
  const hasMissingVariant = items.some((x) => {
    if (!x.productId) return false;
    const p = getProduct(x.productId);
    const colors = Array.isArray(p?.colors) ? p.colors : [];
    return colors.length > 0 && !x.color;
  });

  const canSubmit =
    (isOffline || !deliveryLoading) &&
    !errors.name &&
    !errors.phone &&
    !errors.address &&
    hasValidItem &&
    !hasOutOfStockItem &&
    !hasMissingVariant;

  // ✅ ঠিক কী কারণে বাটন disable আছে সেটা admin-কে স্পষ্টভাবে দেখানো হয়,
  // যাতে fill করে submit করেও error না খেয়ে আগে থেকেই বুঝতে পারে
  const missingReason = (() => {
    if (!isOffline && deliveryLoading) return "Delivery charge লোড হচ্ছে...";
    if (!hasValidItem) return "অন্তত ১টি প্রোডাক্ট যোগ করুন";
    if (hasMissingVariant) return "⚠️ ভ্যারিয়েন্ট (Color) সিলেক্ট করুন";
    if (hasOutOfStockItem) return "⚠️ কিছু আইটেমে স্টক নেই";
    if (!isOffline && errors.name) return "Customer Name দিন";
    if (!isOffline && errors.phone) return "সঠিক Phone নম্বর দিন";
    if (!isOffline && errors.address) return "Address দিন";
    return "Fill required fields...";
  })();

  const inputClass = (hasError) =>
    `w-full h-12 rounded-2xl border px-4 text-sm font-semibold outline-none transition text-gray-900 dark:text-slate-100 ${
      hasError
        ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/30"
        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
    }`;

  /* ===========================
     ✅ ITEM HELPERS
  ============================ */
  const addItem = () =>
    setItems((p) => [...p, { productId: "", qty: 1, color: null }]);

  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  const updateItem = (idx, key, value) => {
    setItems((p) => {
      const next = [...p];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const openPicker = (idx) => {
    setPickerIndex(idx);
    setPickerOpen(true);
    setProductQuery("");
    setProductQueryDebounced("");
    setPickerCategoryId("");
    setPickerPage(1);
  };

  const pickProduct = (prod) => {
    if (pickerIndex === null) return;

    // ✅ স্টক না থাকলে qty 0 থেকে শুরু হবে (আর buttons ডিসেবল থাকবে)
    const stock = toNumber(prod?.stock ?? 0, 0);

    setSelectedProducts((prev) => ({ ...prev, [String(prod._id)]: prod }));

    updateItem(pickerIndex, "productId", String(prod._id));
    updateItem(pickerIndex, "color", null);
    updateItem(pickerIndex, "qty", stock > 0 ? 1 : 0);

    setPickerOpen(false);
    setPickerIndex(null);
    setProductQuery("");
    setProductQueryDebounced("");
    setPickerCategoryId("");
    setPickerPage(1);
  };

  // ✅ কালার/ভ্যারিয়েন্ট পরিবর্তন হলে সেই ভ্যারিয়েন্টের স্টক অনুযায়ী qty রিক্যালকুলেট
  const changeColor = (idx, color) => {
    const it = items[idx];
    const p = getProduct(it.productId);
    const variant = findVariant(p, color);
    const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);
    const current = toNumber(it.qty, 1);

    updateItem(idx, "color", color);
    updateItem(idx, "qty", stock <= 0 ? 0 : Math.min(Math.max(current, 1), stock));
  };

  const changeQty = (idx, delta) => {
    const it = items[idx];
    const p = getProduct(it.productId);
    if (!p) return;

    const variant = findVariant(p, it.color);
    const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);

    if (stock <= 0) {
      updateItem(idx, "qty", 0);
      return;
    }

    const current = toNumber(it.qty, 1);
    let next = current + delta;

    next = Math.max(1, next);
    next = Math.min(stock, next);

    updateItem(idx, "qty", next);
  };

  /* ===========================
     ✅ SUBMIT
     `submittingRef` blocks a second click synchronously (before React even
     re-renders with the disabled button), and `localSubmitting` keeps the
     button visually disabled/labelled for the whole request — including
     the one render tick before the parent's own `submitting` prop catches up.
  ============================ */
  const submittingRef = useRef(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const submit = async () => {
    if (submittingRef.current) return;

    setTouched({ name: true, phone: true, address: true });
    if (errors.name || errors.phone || errors.address) return;

    const cleaned = items
      .map((it) => {
        const p = getProduct(it.productId);
        if (!p) return null;

        const variant = findVariant(p, it.color);
        const image =
          variant?.images?.[0] ||
          p.image ||
          (Array.isArray(p.images) ? p.images[0] : null) ||
          "/no-image.png";

        return {
          productId: String(p._id),
          name: p.name || "",
          price: toNumber(variant?.price ?? p.price, 0),
          qty: Math.max(1, toNumber(it.qty, 1)),
          image,
          color: it.color || null,
          stock: toNumber(variant?.stock ?? p?.stock ?? 0, 0),
        };
      })
      .filter(Boolean);

    if (!cleaned.length) return;

    submittingRef.current = true;
    setLocalSubmitting(true);

    try {
      await onCreate({
        items: cleaned,
        billing,
        discount: toNumber(discount, 0),
        deliveryCharge: effectiveDeliveryCharge,
        paymentMethod,
        paymentStatus,
        status,

        createdBy: "admin",
        createdByName: "Admin",

        saleChannel,
      });
    } catch {
      // ❗ error already toasted upstream (useOrders' createOrder) — keep
      // the modal open so the admin can fix input and retry.
    } finally {
      submittingRef.current = false;
      setLocalSubmitting(false);
    }
  };

  const isBusy = submitting || localSubmitting;

  /* ===========================
     ✅ HIDE WHEN CLOSED
  ============================ */
  return (
    <>
      <div
        className={`fixed inset-0 z-50 ${
          open ? "flex" : "hidden"
        } items-end sm:items-center justify-center bg-black/60`}
      >
        {/* ✅ MOBILE FULL SCREEN / DESKTOP CENTER */}
        <div className="w-full sm:max-w-6xl sm:rounded-3xl bg-gray-50 dark:bg-slate-900 h-[92vh] sm:h-[88vh] overflow-hidden shadow-2xl flex flex-col">
          {/* ✅ STICKY HEADER */}
          <div
            className={`shrink-0 overflow-hidden px-4 sm:px-6 py-5 flex items-center justify-between sticky top-0 z-20 transition-colors ${
              isOffline
                ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700"
                : "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600"
            }`}
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-14 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative min-w-0 flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shrink-0">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-semibold text-white truncate">
                  Create New Order
                </div>
                <div className="text-[11px] text-white/80 font-semibold flex items-center gap-1.5">
                  {isOffline ? <Store size={12} /> : <Globe size={12} />}
                  {isOffline ? "Offline in-store sale" : "Online delivery order"}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isBusy}
              className="relative h-10 w-10 rounded-2xl grid place-items-center bg-white/15 hover:bg-white/25 text-white font-black backdrop-blur transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>

          {/* ✅ SCROLL BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* LEFT */}
              <div className="space-y-4">
                {/* SALE CHANNEL CARD */}
                <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                  <SectionHeader icon={ShoppingBag} title="Sale Channel" />
                  <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-gray-100 dark:bg-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setSaleChannel("online");
                        setPaymentStatus("pending");
                        setStatus("pending");
                      }}
                      className={`h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                        !isOffline
                          ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-md"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Globe size={16} /> Online
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSaleChannel("offline");
                        setPaymentStatus("paid");
                        setStatus("delivered");
                      }}
                      className={`h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                        isOffline
                          ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-md"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Store size={16} /> Offline
                    </button>
                  </div>
                  {isOffline && (
                    <div className="flex items-start gap-2 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-3 py-2.5 text-[11px] text-purple-700 dark:text-purple-400 font-semibold">
                      <Store size={14} className="shrink-0 mt-0.5" />
                      In-store sale — কাস্টমার তথ্য ঐচ্ছিক, ডেলিভারি চার্জ ৳০, এবং Payment/Status ডিফল্টভাবে Paid ও Delivered বসানো হয়েছে।
                    </div>
                  )}
                </div>

                {/* CUSTOMER CARD */}
                <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionHeader icon={User} title="Customer Info" />
                    <div
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        isOffline
                          ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isOffline ? "Optional" : "Required"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Name {!isOffline && <span className="text-red-600 dark:text-red-400">*</span>}
                      </div>
                      <input
                        className={inputClass(touched.name && errors.name)}
                        placeholder="Customer name"
                        value={billing.name}
                        onChange={(e) =>
                          setBilling((p) => ({ ...p, name: e.target.value }))
                        }
                        onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      />
                      {touched.name && errors.name && (
                        <div className="text-[11px] text-red-600 dark:text-red-400">
                          Name required
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Phone {!isOffline && <span className="text-red-600 dark:text-red-400">*</span>}
                      </div>
                      <input
                        className={inputClass(touched.phone && errors.phone)}
                        placeholder="01XXXXXXXXX"
                        value={billing.phone}
                        onChange={(e) =>
                          setBilling((p) => ({ ...p, phone: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, phone: true }))
                        }
                      />
                      {touched.phone && errors.phone && (
                        <div className="text-[11px] text-red-600 dark:text-red-400">
                          Valid number required
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Address {!isOffline && <span className="text-red-600 dark:text-red-400">*</span>}
                      </div>
                      <input
                        className={inputClass(
                          touched.address && errors.address
                        )}
                        placeholder="Full address"
                        value={billing.address}
                        onChange={(e) =>
                          setBilling((p) => ({ ...p, address: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, address: true }))
                        }
                      />
                      {touched.address && errors.address && (
                        <div className="text-[11px] text-red-600 dark:text-red-400">
                          Address required
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                      Note (optional)
                    </div>
                    <input
                      className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Note..."
                      value={billing.note}
                      onChange={(e) =>
                        setBilling((p) => ({ ...p, note: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* ITEMS CARD */}
                <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionHeader icon={Package} title="Items" />
                    <button
                      onClick={addItem}
                      className="h-10 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((it, idx) => {
                      const p = getProduct(it.productId);
                      const colors = Array.isArray(p?.colors) ? p.colors : [];
                      const variant = findVariant(p, it.color);
                      const stock = toNumber(
                        variant?.stock ?? p?.stock ?? 0,
                        0
                      );

                      const image =
                        variant?.images?.[0] ||
                        p?.image ||
                        (Array.isArray(p?.images) ? p.images[0] : null) ||
                        "/no-image.png";

                      const outOfStock = !!p && stock <= 0;

                      return (
                        <div
                          key={idx}
                          className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 p-3 space-y-2"
                        >
                          {/* TOP */}
                          <button
                            type="button"
                            onClick={() => openPicker(idx)}
                            className="w-full h-14 rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 flex items-center gap-3 hover:border-blue-200 dark:hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition"
                          >
                            <img
                              src={p ? image : "/no-image.png"}
                              alt=""
                              className="w-11 h-11 rounded-2xl border dark:border-slate-600 object-cover"
                            />
                            <div className="min-w-0 text-left">
                              <div className="text-sm font-black truncate text-gray-900 dark:text-slate-100">
                                {p ? p.name : "Select product"}
                              </div>
                              <div
                                className={`text-[11px] font-semibold ${
                                  outOfStock
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-500 dark:text-slate-400"
                                }`}
                              >
                                {p
                                  ? outOfStock
                                    ? `৳${toNumber(variant?.price ?? p.price, 0)} • Out of stock`
                                    : `৳${toNumber(variant?.price ?? p.price, 0)} • Stock: ${stock}`
                                  : "Click to choose product"}
                              </div>
                            </div>
                          </button>

                          {/* BOTTOM */}
                          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2">
                            {/* VARIANT */}
                            <select
                              className={`w-full sm:col-span-7 h-12 rounded-2xl border px-4 text-sm font-semibold outline-none focus:ring-2 text-gray-900 dark:text-slate-100 ${
                                colors.length > 0 && !it.color
                                  ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-red-200 dark:focus:ring-red-500/30"
                                  : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-blue-200 dark:focus:ring-blue-500/30"
                              }`}
                              value={it.color || ""}
                              onChange={(e) =>
                                changeColor(idx, e.target.value || null)
                              }
                              disabled={!p || !colors.length}
                            >
                              <option value="">
                                {colors.length ? "Select Variant" : "No variants"}
                              </option>
                              {colors.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name} — ৳{toNumber(c.price, 0)} (stock:{" "}
                                  {toNumber(c.stock, 0)})
                                </option>
                              ))}
                            </select>

                            {/* QTY */}
                            <div className="w-full sm:col-span-5 h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => changeQty(idx, -1)}
                                disabled={!p || toNumber(it.qty, 1) <= 1}
                                className={`w-9 h-9 rounded-xl font-black flex items-center justify-center transition ${
                                  !p || toNumber(it.qty, 1) <= 1
                                    ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-500 cursor-not-allowed"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                }`}
                              >
                                <Minus size={14} />
                              </button>

                              <div className="text-base font-black text-gray-900 dark:text-slate-100">
                                {it.qty}
                              </div>

                              <button
                                type="button"
                                onClick={() => changeQty(idx, 1)}
                                disabled={!p || toNumber(it.qty, 0) >= stock}
                                className={`w-9 h-9 rounded-xl font-black flex items-center justify-center transition ${
                                  !p || toNumber(it.qty, 0) >= stock
                                    ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-500 cursor-not-allowed"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                }`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <div
                              className={`text-[11px] font-semibold ${
                                outOfStock
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-500 dark:text-slate-400"
                              }`}
                            >
                              {p
                                ? outOfStock
                                  ? "Out of stock"
                                  : `Stock: ${stock}`
                                : "Pick a product first"}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-xs font-black text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PAYMENT + STATUS */}
                <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                  <SectionHeader icon={Wallet} title="Payment & Status" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Payment Method
                      </div>
                      <select
                        className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cod">
                          {isOffline ? "Cash" : "Cash On Delivery"}
                        </option>
                        <option value="bkash">bKash</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Payment Status
                      </div>
                      <select
                        className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Order Status
                      </div>
                      <select
                        className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="ready_to_delivery">
                          Ready To Delivery
                        </option>
                        <option value="send_to_courier">Send To Courier</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                        Discount
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-black">
                          ৳
                        </span>
                        <input
                          type="number"
                          className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                          value={discount}
                          onChange={(e) =>
                            setDiscount(Number(e.target.value || 0))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY CHARGE */}
                  <div
                    className={`rounded-3xl border p-4 flex items-center justify-between gap-3 ${
                      isOffline
                        ? "border-purple-100 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10"
                        : "border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isOffline
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        <Truck size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 dark:text-slate-100">
                          Delivery Charge {isOffline ? "" : "(DB default)"}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                          {isOffline
                            ? "in-store sale • no delivery"
                            : "auto-filled • editable"}
                        </div>
                      </div>
                    </div>
                    {isOffline ? (
                      <div className="text-lg font-black text-purple-700 dark:text-purple-400">
                        ৳0
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700 dark:text-blue-400 font-black text-sm">
                          ৳
                        </span>
                        <input
                          type="number"
                          min={0}
                          disabled={deliveryLoading}
                          className="w-28 h-10 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 pl-7 pr-3 text-right text-sm font-black outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={deliveryLoading ? "" : deliveryCharge}
                          placeholder={deliveryLoading ? "..." : "0"}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            setDeliveryCharge(toNumber(e.target.value, 0))
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SUMMARY */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3 lg:sticky lg:top-4">
                  <SectionHeader icon={Receipt} title="Order Summary" />

                  {!viewItems.length ? (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      No items added yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {viewItems.map((it, i) => (
                        <div
                          key={i}
                          className="rounded-3xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-3 flex gap-3 items-center"
                        >
                          <img
                            src={it.image}
                            alt=""
                            className="w-14 h-14 rounded-2xl border dark:border-slate-600 object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-black truncate text-gray-900 dark:text-slate-100">
                              {it.name}
                            </div>
                            {it.colorLabel && (
                              <div className="text-[11px] font-black text-pink-600 dark:text-pink-400">
                                Color: {it.colorLabel}
                              </div>
                            )}
                            <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                              ৳{toNumber(it.price, 0)} × {toNumber(it.qty, 0)}
                            </div>
                          </div>
                          <div className="text-sm font-black text-gray-900 dark:text-slate-100">
                            ৳{toNumber(it.price, 0) * toNumber(it.qty, 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t dark:border-slate-700 pt-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400 font-semibold">
                        Subtotal
                      </span>
                      <span className="font-black text-gray-900 dark:text-slate-100">৳{subtotal}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400 font-semibold">
                        Delivery
                      </span>
                      <span className="font-black text-gray-900 dark:text-slate-100">
                        {isOffline
                          ? "৳0"
                          : deliveryLoading
                            ? "..."
                            : `৳${deliveryCharge}`}
                      </span>
                    </div>

                    {!!discount && (
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span className="font-semibold">Discount</span>
                        <span className="font-black">
                          -৳{toNumber(discount, 0)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex justify-between items-center text-lg font-black rounded-2xl px-4 py-3 mt-1 ${
                        isOffline
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                          : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                      }`}
                    >
                      <span>Total</span>
                      <span>৳{total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ STICKY FOOTER (MOBILE + DESKTOP) */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky bottom-0 z-20">
            <div
              className={`text-[11px] font-bold flex items-center gap-1.5 ${
                canSubmit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : hasOutOfStockItem
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-400 dark:text-slate-500"
              }`}
            >
              {canSubmit ? "✅ Ready to create" : missingReason}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isBusy}
                className="flex-1 sm:flex-none h-11 px-4 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-black text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={!canSubmit || isBusy}
                className={`flex-1 sm:flex-none h-11 px-5 rounded-2xl font-black text-white transition ${
                  !canSubmit || isBusy
                    ? "bg-gray-300 dark:bg-slate-600 cursor-not-allowed"
                    : isOffline
                      ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90"
                }`}
              >
                {isBusy ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PRODUCT PICKER POPUP */}
      <ProductPickerModal
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickerIndex(null);
          setProductQuery("");
          setProductQueryDebounced("");
          setPickerCategoryId("");
          setPickerPage(1);
        }}
        query={productQuery}
        setQuery={setProductQuery}
        products={pickerProducts}
        loading={pickerLoading}
        onPick={pickProduct}
        categories={categories}
        selectedCategoryId={pickerCategoryId}
        onSelectCategory={setPickerCategoryId}
        page={pickerPage}
        totalPages={pickerTotalPages}
        total={pickerTotal}
        onPageChange={setPickerPage}
      />
    </>
  );
}

/* ===========================
   ✅ CATEGORY DROPDOWN (single-select) — প্রোডাক্ট ফর্মের ক্যাটাগরি
   ড্রপডাউনের মতোই thumbnail + name সহ লিস্ট
=========================== */
function CategoryDropdown({
  categories,
  selectedCategory,
  selectedCategoryId,
  onSelectCategory,
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const pick = (id) => {
    onSelectCategory(id);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedCategory ? (
            <>
              <span className="relative h-7 w-7 rounded-lg overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                {selectedCategory.image ? (
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                    <ImageOff size={12} />
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                {selectedCategory.name}
              </span>
            </>
          ) : (
            <>
              <LayoutGrid size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                All Categories
              </span>
            </>
          )}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1">
          <button
            type="button"
            onClick={() => pick("")}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
              !selectedCategoryId
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            <LayoutGrid size={16} className="shrink-0" />
            <span>All Categories</span>
          </button>

          {categories.map((c) => {
            const isSelected = String(selectedCategoryId) === String(c._id);
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => pick(c._id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                <span className="relative h-8 w-8 rounded-lg overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                      <ImageOff size={14} />
                    </span>
                  )}
                </span>
                <span className="truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================
   ✅ PRODUCT PICKER POPUP
=========================== */
function ProductPickerModal({
  open,
  onClose,
  query,
  setQuery,
  products,
  loading,
  onPick,
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
}) {
  const selectedCategory = categories.find(
    (c) => String(c._id) === String(selectedCategoryId)
  );

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/70 px-2 ${
        open ? "flex" : "hidden"
      } items-end sm:items-center justify-center`}
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-[88vh] sm:h-[80vh] sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="text-base font-semibold text-white">
            Select Product
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-2xl grid place-items-center bg-white/15 hover:bg-white/25 text-white font-black backdrop-blur"
          >
            <X size={18} />
          </button>
        </div>

        {/* CATEGORY + SEARCH */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shrink-0 space-y-2.5">
          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={onSelectCategory}
          />

          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <input
              className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 pl-11 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search product by name or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
            Showing <b>{products.length}</b> of <b>{total}</b> products
            {selectedCategory ? (
              <>
                {" "}
                in <b>{selectedCategory.name}</b>
              </>
            ) : null}
            {totalPages > 1 ? (
              <>
                {" "}
                • Page <b>{page}</b>/<b>{totalPages}</b>
              </>
            ) : null}
          </div>
        </div>

        {/* LIST */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-slate-400">Loading...</div>
          ) : !products.length ? (
            <div className="p-10 text-center text-gray-500 dark:text-slate-400">
              No products found.
            </div>
          ) : (
            products.map((p) => {
              const img =
                p.image ||
                (Array.isArray(p.images) ? p.images[0] : null) ||
                "/no-image.png";

              const stock = Number.isFinite(Number(p.stock))
                ? Number(p.stock)
                : 0;
              const outOfStock = stock <= 0;

              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => onPick(p)}
                  className="w-full text-left border border-gray-100 dark:border-slate-700 rounded-2xl p-2.5 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition flex items-center gap-3"
                >
                  <span className="relative h-12 w-12 rounded-xl overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                        <ImageOff size={16} />
                      </span>
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold truncate">
                      {(p.categories || []).map((c) => c.name).join(", ")}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                      ৳{Number(p.price || 0)}
                    </div>
                    <div
                      className={`text-[10px] font-bold ${
                        outOfStock ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {outOfStock ? "Out of stock" : `Stock: ${stock}`}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && totalPages > 1 && (
          <div className="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={page <= 1}
              className={`h-9 px-4 rounded-xl text-xs font-black transition ${
                page <= 1
                  ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-500 cursor-not-allowed"
                  : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Prev
            </button>
            <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400">
              Page {page} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={`h-9 px-4 rounded-xl text-xs font-black transition ${
                page >= totalPages
                  ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-500 cursor-not-allowed"
                  : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
