"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Eye, EyeOff, Package, Trash2 } from "lucide-react";
import AddButton from "../../../../components/AddButton";
import ModalShell from "../../../../components/ModalShell";
import ProductForm from "../../../../components/productForm/ProductForm";
import ProductCard from "../../../../components/ProductCard";
import ProductStockHistoryModal from "../../../../components/ProductStockHistoryModal";
import Toast from "../../../../components/Toast";
import ProductsSkeleton from "../../../../components/Skeleton/ProductsSkeleton";
import Pagination from "../../../../components/Pagination";

const emptyCounts = {
  all: 0,
  active: 0,
  hidden: 0,
  freeDelivery: 0,
  bestDiscount: 0,
  cartvanBox: 0,
  hasVariant: 0,
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState(emptyCounts);

  const [filter, setFilter] = useState("all"); // all / active / hidden

  // ✅ Product নাম দিয়ে দ্রুত সার্চ (debounced)
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ✅ Products সাব-মেনু — All Product / Free Delivery / Best Discount / Gift Box
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [homeBadges, setHomeBadges] = useState([]);

  const [showForm, setShowForm] = useState(false);

  // ✅ Stock History (ledger) মডাল
  const [stockHistoryProduct, setStockHistoryProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ================== LOAD PRODUCTS ==================
  const loadProducts = async (targetPage = page) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", targetPage);
      params.set("limit", 50);
      if (filter !== "all") params.set("status", filter);
      if (badgeFilter !== "all") params.set("badge", badgeFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      setProducts(Array.isArray(data.products) ? data.products : []);
      setCounts(data.counts || emptyCounts);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || targetPage);
    } catch (error) {
      console.error(error);
      setToast({ message: "⚠ Failed to load products", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, badgeFilter, search, page]);

  // ✅ টাইপ করা থামলে ৩০০ms পর সার্চ চালু হয় (প্রতি কী-স্ট্রোকে API কল হবে না)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ✅ filter/badgeFilter বদলালে page 1 এ ফিরিয়ে আনা হয়
  const changeFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  const changeBadgeFilter = (b) => {
    setBadgeFilter(b);
    setPage(1);
  };

  useEffect(() => {
    // ✅ Admin থেকে দেওয়া Offer Badge নাম লোড করা (dynamic tab label)
    fetch(`/api/admin/homeBadges`)
      .then((res) => res.json())
      .then((data) =>
        setHomeBadges(Array.isArray(data?.badges) ? data.badges : []),
      )
      .catch(() => setHomeBadges([]));
  }, []);

  // ✅ Deep-link: /admin/products?edit=<id> — যেমন Category delete blocked
  // modal থেকে "Edit" বাটনে ক্লিক করলে সরাসরি সেই প্রোডাক্টের edit ফর্ম খুলে যায়
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;

    let cancelled = false;

    fetch(`/api/admin/products/${editId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((product) => {
        if (cancelled) return;
        setEditProduct(product);
        setShowForm(true);
      })
      .catch(() => {
        if (cancelled) return;
        setToast({ message: "❌ Product not found", type: "error" });
      })
      .finally(() => {
        if (!cancelled) router.replace("/admin/products");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBadgeName = (field, fallback) => {
    const b = homeBadges.find((x) => x.field === field);
    return b?.name || fallback;
  };

  // ✅ "Hide All/Show All" বাটন — পুরো ক্যাটালগের active/hidden অবস্থা
  // অনুযায়ী (শুধু বর্তমান পেজের ৫০টা না)
  const hasAnyActive = counts.active > 0;

  // ================== DELETE PRODUCT ==================
  const confirmDelete = (product) => setDeleteModal(product);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/products/${deleteModal._id}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        setToast({ message: "🗑 Product deleted!", type: "success" });
        loadProducts();
      } else {
        setToast({ message: "❌ Error deleting product", type: "error" });
      }

      setDeleteModal(null);
    } catch {
      setToast({ message: "🌐 Network error", type: "error" });
    }

    setDeleting(false);
  };

  // ================== BULK HIDE / SHOW (server-side, whole catalog) ==================
  const toggleAllProducts = async () => {
    try {
      setLoading(true);
      const newStatus = !hasAnyActive;

      const res = await fetch(`/api/admin/products/bulk-visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error();

      setToast({
        message: newStatus
          ? "✅ All products activated!"
          : "👁 All products hidden!",
        type: "success",
      });

      loadProducts();
    } catch (err) {
      console.error(err);
      setToast({ message: "❌ Bulk update failed", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4">
      {/* ===================== HEADER (slim) ===================== */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 truncate">
              Products
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {counts.all} total · {counts.active} active
            </p>
          </div>

          <AddButton
            label="Add Product"
            onClick={() => {
              setEditProduct(null); // ✅ IMPORTANT: must be null for Add mode
              setShowForm(true);
            }}
          />
        </div>

        {/* SEARCH + BULK */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              size={14}
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search product..."
              className="w-full h-9 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 pl-9 pr-8 text-base sm:text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded-full text-gray-400 hover:bg-gray-100 dark:text-slate-500 dark:hover:bg-slate-700"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {counts.all > 0 && (
            <button
              onClick={toggleAllProducts}
              className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all active:scale-[0.97] ${
                hasAnyActive
                  ? "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:border-gray-400"
                  : "bg-green-600 text-white border-green-600 hover:bg-green-700"
              }`}
            >
              {hasAnyActive ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="hidden min-[400px]:inline">{hasAnyActive ? "Hide All" : "Show All"}</span>
            </button>
          )}
        </div>

        {/* STATUS — segmented control */}
        <div className="grid grid-cols-3 sm:inline-flex p-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200/70 dark:border-slate-700">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "hidden", label: "Hidden" },
          ].map((t) => {
            const active = filter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => changeFilter(t.key)}
                className={`min-w-0 inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  active
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                }`}
              >
                {t.label}
                <span
                  className={`px-1.5 rounded-full text-[10px] leading-4 ${
                    active ? "bg-indigo-50 dark:bg-indigo-500/15" : "bg-gray-200/70 dark:bg-slate-700"
                  }`}
                >
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* BADGE FILTERS — mobile-এ swipe, desktop-এ wrap */}
        <div className="-mx-2 px-2 sm:mx-0 sm:px-0 flex gap-1.5 overflow-x-auto sm:overflow-visible sm:flex-wrap no-scrollbar">
          {[
            { key: "all", label: "🗂️ All Product" },
            { key: "freeDelivery", label: `🚚 ${getBadgeName("freeDelivery", "Free Delivery")}` },
            { key: "bestDiscount", label: `🛍️ ${getBadgeName("bestDiscount", "Best Discount")}` },
            { key: "cartvanBox", label: `🎁 ${getBadgeName("cartvanBox", "Gift Box")}` },
            { key: "hasVariant", label: "🎨 Variant Product" },
          ].map((tab) => {
            const active = badgeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeBadgeFilter(tab.key)}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-all ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 rounded-full text-[10px] leading-4 ${
                    active ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"
                  }`}
                >
                  {counts[tab.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== PRODUCT GRID ===================== */}
      {loading ? (
        <ProductsSkeleton />
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6  gap-4">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onEdit={() => {
                  setEditProduct(p);
                  setShowForm(true);
                }}
                onDelete={() => confirmDelete(p)}
                onStockHistory={() => setStockHistoryProduct(p)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center text-center py-16 text-gray-500 dark:text-slate-400">
          <span className="grid place-items-center h-16 w-16 rounded-2xl bg-gray-100 dark:bg-slate-800 mb-3">
            <Package size={28} />
          </span>
          <p className="font-semibold text-gray-700 dark:text-slate-300">No products found</p>
          <p className="text-sm mt-1">Try a different filter, or add a new product.</p>
        </div>
      )}

      {/* ===================== FORM MODAL (ProductForm nijei mobile bottom-sheet) ===================== */}
      {showForm && (
        <ProductForm
          product={editProduct}
          productsLength={counts.all}
          onClose={() => {
            setShowForm(false);
            setEditProduct(null); // ✅ reset
          }}
          onSaved={() => {
            setShowForm(false);
            setEditProduct(null); // ✅ reset
            loadProducts();
            setToast({
              message: editProduct?._id ? "✅ Product updated!" : "✅ Product added!",
              type: "success",
            });
          }}
        />
      )}

      {/* ===================== DELETE CONFIRM ===================== */}
      {deleteModal && (
        <ModalShell
          title="Delete Product"
          subtitle="This action can't be undone"
          icon={<Trash2 size={20} className="text-red-600" />}
          onClose={() => !deleting && setDeleteModal(null)}
          maxWidth="sm:max-w-sm"
          footer={
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="h-11 sm:h-10 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-11 sm:h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm active:scale-[0.98] transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          }
        >
          <p className="text-sm text-gray-700 dark:text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteModal.name}</span>?
          </p>
        </ModalShell>
      )}

      {/* STOCK HISTORY (ledger) */}
      <ProductStockHistoryModal
        product={stockHistoryProduct}
        onClose={() => setStockHistoryProduct(null)}
      />

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx global>{`
        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
