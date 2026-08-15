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

export default function CreateOrderModal({ open, onClose, onCreate, API }) {
  /* ===========================
     ✅ PRODUCTS
  ============================ */
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  /* ===========================
     ✅ DELIVERY CHARGE (DB)
  ============================ */
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(true);

  /* ===========================
     ✅ PRODUCT PICKER POPUP
  ============================ */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(null);
  const [productQuery, setProductQuery] = useState("");
  const [pickerCategoryId, setPickerCategoryId] = useState("");

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
     ✅ LOAD PRODUCTS WHEN OPEN
  ============================ */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setLoadingProducts(true);

    // ✅ Admin endpoint ব্যবহার করা হচ্ছে (public endpoint শুধু active category-এর
    // active প্রোডাক্ট দেখায়, ফলে হিডেন/ইনঅ্যাক্টিভ প্রোডাক্ট পিকারে আসত না) —
    // এখানে বড় limit দিয়ে পুরো ক্যাটালগ একসাথে আনা হচ্ছে
    fetch(`${API}/admin/products?limit=2000`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setProducts(Array.isArray(data?.products) ? data.products : []);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingProducts(false);
      });

    return () => {
      alive = false;
    };
  }, [open, API]);

  /* ===========================
     ✅ LOAD DELIVERY CHARGE FROM DB
  ============================ */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setDeliveryLoading(true);

    fetch(`${API}/deliveryCharge`)
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
    setPickerCategoryId("");

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

  const getProduct = (pid) =>
    products.find((p) => String(p._id) === String(pid));

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
     ✅ CATEGORIES (প্রোডাক্ট লিস্ট থেকেই ইউনিক ক্যাটাগরি বের করা হয়,
     যেহেতু admin/products এন্ডপয়েন্ট categories populate করেই দেয়)
  ============================ */
  const allCategories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      (p.categories || []).forEach((c) => {
        if (c?._id && !map.has(String(c._id))) map.set(String(c._id), c);
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [products]);

  /* ===========================
     ✅ FILTER PRODUCTS (CATEGORY + SEARCH)
  ============================ */
  const filteredProducts = useMemo(() => {
    let list = products;

    if (pickerCategoryId) {
      list = list.filter((p) =>
        (p.categories || []).some(
          (c) => String(c?._id) === String(pickerCategoryId)
        )
      );
    }

    if (productQuery.trim()) {
      const q = productQuery.trim().toLowerCase();
      list = list.filter((p) => {
        const name = String(p?.name || "").toLowerCase();
        const id = String(p?._id || "").toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    return list;
  }, [productQuery, products, pickerCategoryId]);

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
          price: toNumber(p.price, 0),
          stock,
          image,
          colorLabel: variant?.name || it.color || null,
        };
      })
      .filter(Boolean);
  }, [items, products]);

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

  const canSubmit =
    (isOffline || !deliveryLoading) &&
    !errors.name &&
    !errors.phone &&
    !errors.address &&
    items.some((x) => x.productId && toNumber(x.qty, 0) > 0);

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
    setPickerCategoryId("");
  };

  const pickProduct = (prod) => {
    if (pickerIndex === null) return;

    updateItem(pickerIndex, "productId", String(prod._id));
    updateItem(pickerIndex, "color", null);
    updateItem(pickerIndex, "qty", 1);

    setPickerOpen(false);
    setPickerIndex(null);
    setProductQuery("");
    setPickerCategoryId("");
  };

  const changeQty = (idx, delta) => {
    const it = items[idx];
    const p = getProduct(it.productId);
    if (!p) return;

    const variant = findVariant(p, it.color);
    const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);

    const current = toNumber(it.qty, 1);
    let next = current + delta;

    next = Math.max(1, next);
    next = Math.min(stock, next);
    if (next < 1) next = current;

    updateItem(idx, "qty", next);
  };

  /* ===========================
     ✅ SUBMIT
  ============================ */
  const submit = () => {
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
          price: toNumber(p.price, 0),
          qty: Math.max(1, toNumber(it.qty, 1)),
          image,
          color: it.color || null,
          stock: toNumber(variant?.stock ?? p?.stock ?? 0, 0),
        };
      })
      .filter(Boolean);

    if (!cleaned.length) return;

    onCreate({
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
  };

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
              className="relative h-10 w-10 rounded-2xl grid place-items-center bg-white/15 hover:bg-white/25 text-white font-black backdrop-blur transition"
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
                              <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                                {p
                                  ? `৳${toNumber(p.price, 0)} • Stock: ${stock}`
                                  : "Click to choose product"}
                              </div>
                            </div>
                          </button>

                          {/* BOTTOM */}
                          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2">
                            {/* COLOR */}
                            <select
                              className="w-full sm:col-span-7 h-12 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                              value={it.color || ""}
                              onChange={(e) =>
                                updateItem(idx, "color", e.target.value || null)
                              }
                              disabled={!p || !colors.length}
                            >
                              <option value="">
                                {colors.length ? "Select Color" : "No colors"}
                              </option>
                              {colors.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name} (stock: {toNumber(c.stock, 0)})
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
                                disabled={!p || it.qty >= stock}
                                className={`w-9 h-9 rounded-xl font-black flex items-center justify-center transition ${
                                  !p || it.qty >= stock
                                    ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-500 cursor-not-allowed"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                }`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                              {p ? `Stock: ${stock}` : "Pick a product first"}
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

                  {/* DELIVERY LOCKED */}
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
                          Delivery Charge {isOffline ? "" : "(DB)"}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                          {isOffline
                            ? "in-store sale • no delivery"
                            : "locked • not editable"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-black ${
                        isOffline ? "text-purple-700 dark:text-purple-400" : "text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {isOffline
                        ? "৳0"
                        : deliveryLoading
                          ? "..."
                          : `৳${deliveryCharge}`}
                    </div>
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
                canSubmit ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500"
              }`}
            >
              {canSubmit ? "✅ Ready to create" : "Fill required fields..."}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none h-11 px-4 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-black text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={!canSubmit}
                className={`flex-1 sm:flex-none h-11 px-5 rounded-2xl font-black text-white transition ${
                  !canSubmit
                    ? "bg-gray-300 dark:bg-slate-600 cursor-not-allowed"
                    : isOffline
                      ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90"
                }`}
              >
                Create Order
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
          setPickerCategoryId("");
        }}
        query={productQuery}
        setQuery={setProductQuery}
        products={filteredProducts}
        loading={loadingProducts}
        onPick={pickProduct}
        categories={allCategories}
        selectedCategoryId={pickerCategoryId}
        onSelectCategory={setPickerCategoryId}
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
            Showing <b>{products.length}</b> products
            {selectedCategory ? (
              <>
                {" "}
                in <b>{selectedCategory.name}</b>
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
      </div>
    </div>
  );
}
