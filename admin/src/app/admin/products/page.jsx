"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import ProductForm from "../../../../components/productForm/ProductForm";
import ProductCard from "../../../../components/ProductCard";
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
};

export default function ProductsPage() {
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
    <div className="p-4 sm:p-6">
      {/* ===================== HEADER ===================== */}
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:flex-wrap md:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 shrink-0">
          ✨ Product Manager
        </h1>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-48 md:mx-1 order-1 md:order-none">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            size={14}
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search product..."
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 py-1.5 pl-8 pr-7 text-xs outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="order-2 md:order-none flex flex-wrap items-center gap-1.5 md:ml-auto">
          {/* FILTER BUTTONS */}
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
            onClick={() => changeFilter("all")}
          >
            All
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === "all" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              filter === "active"
                ? "bg-green-600 text-white border-green-600 shadow"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-500/40 hover:text-green-600 dark:hover:text-green-400"
            }`}
            onClick={() => changeFilter("active")}
          >
            Active
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === "active" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"
              }`}
            >
              {counts.active}
            </span>
          </button>

          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              filter === "hidden"
                ? "bg-gray-700 text-white border-gray-700 shadow"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-800 dark:hover:text-slate-200"
            }`}
            onClick={() => changeFilter("hidden")}
          >
            Hidden
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === "hidden" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"
              }`}
            >
              {counts.hidden}
            </span>
          </button>

          {/* BULK BUTTON */}
          {counts.all > 0 && (
            <button
              onClick={toggleAllProducts}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-medium leading-none text-white transition-colors ${
                hasAnyActive
                  ? "bg-gray-700 border-gray-700 hover:bg-gray-800"
                  : "bg-green-600 border-green-600 hover:bg-green-700"
              }`}
            >
              {hasAnyActive ? "Hide All" : "Show All"}
            </button>
          )}

          {/* ✅ ADD PRODUCT */}
          <button
            onClick={() => {
              setEditProduct(null); // ✅ IMPORTANT: must be null for Add mode
              setShowForm(true);
            }}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold leading-none bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-[0.98] transition-colors"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* ===================== NEW: PRODUCTS SUB-MENU ===================== */}
      <div className="flex flex-wrap gap-2 mb-5 border-b dark:border-slate-700 pb-3">
        {[
          { key: "all", label: "🗂️ All Product", color: "indigo" },
          {
            key: "freeDelivery",
            label: `🚚 ${getBadgeName("freeDelivery", "Free Delivery")}`,
            color: "orange",
          },
          {
            key: "bestDiscount",
            label: `🛍️ ${getBadgeName("bestDiscount", "Best Discount")}`,
            color: "blue",
          },
          {
            key: "cartvanBox",
            label: `🎁 ${getBadgeName("cartvanBox", "Gift Box")}`,
            color: "rose",
          },
        ].map((tab) => {
          const active = badgeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeBadgeFilter(tab.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  active ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
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
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">
          No products found.
        </div>
      )}

      {/* ===================== FORM MODAL ===================== */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" />

          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh] relative animate-[zoomIn_.2s_ease-out]">
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
                    message: editProduct?._id
                      ? "✅ Product updated!"
                      : "✅ Product added!",
                    type: "success",
                  });
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ===================== DELETE CONFIRM ===================== */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-sm shadow-xl border dark:border-slate-700 animate-[zoomIn_.2s_ease-out]">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
                ⚠ Delete Product
              </h2>

              <p className="text-gray-700 dark:text-slate-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteModal.name}</span>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded shadow"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
