"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Megaphone, ImageOff, Plus } from "lucide-react";
import Toast from "../../../../components/Toast";
import ConfirmModal from "../../../../components/ConfirmModal";

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
    green: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ProductPickerModal({ onClose, onCreated, existingProductIds }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(null);
  const [headline, setHeadline] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", 30);
        if (search.trim()) params.set("search", search.trim());
        const res = await fetch(`/api/admin/products?${params.toString()}`);
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (picked) setHeadline((h) => h || picked.name);
  }, [picked]);

  const handleCreate = async () => {
    if (!picked || !headline.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/landing-pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: picked._id, headline: headline.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "তৈরি করা যায়নি");
      onCreated(json.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-lg p-5 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-slate-100">নতুন ল্যান্ডিং পেজ</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <X size={18} />
            </button>
          </div>

          {!picked ? (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={14} />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="প্রোডাক্ট খুঁজুন..."
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20"
                />
              </div>
              <div className="overflow-y-auto flex-1 space-y-1.5 min-h-[200px]">
                {loading ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">লোড হচ্ছে...</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
                ) : (
                  products.map((p) => {
                    const hasPage = existingProductIds.has(p._id);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        disabled={hasPage}
                        onClick={() => setPicked(p)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${
                          hasPage
                            ? "opacity-40 cursor-not-allowed border-transparent"
                            : "border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5"
                        }`}
                      >
                        <span className="relative h-10 w-10 rounded-lg overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                              <ImageOff size={14} />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{p.name}</span>
                          <span className="block text-xs text-gray-400 dark:text-slate-500">৳{p.price}</span>
                        </span>
                        {hasPage && <Badge>আগে থেকেই আছে</Badge>}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                ← অন্য প্রোডাক্ট বাছুন
              </button>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                <span className="relative h-10 w-10 rounded-lg overflow-hidden border dark:border-slate-600 bg-white dark:bg-slate-700 shrink-0">
                  {picked.image ? (
                    <img src={picked.image} alt={picked.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                      <ImageOff size={14} />
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{picked.name}</span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-slate-400">Headline</label>
                <input
                  autoFocus
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full mt-1 border rounded-md p-2.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="যেমন: ঘরে বসেই অর্ডার করুন — মাত্র ৭ দিনে ডেলিভারি"
                />
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={creating || !headline.trim()}
                className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? "তৈরি হচ্ছে..." : "✅ তৈরি করুন ও এডিট করুন"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function LandingPagesListPage() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/landing-pages`);
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: "⚠ ল্যান্ডিং পেজ লোড করা যায়নি", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setToast({ message: "🗑 ল্যান্ডিং পেজ ডিলিট হয়েছে", type: "success" });
      setDeleteTarget(null);
      load();
    } catch {
      setToast({ message: "❌ ডিলিট করা যায়নি", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const existingProductIds = new Set(
    pages.map((p) => (typeof p.productId === "object" ? p.productId?._id : p.productId)),
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="text-indigo-500" size={26} /> Landing Pages
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            একটা প্রোডাক্টের জন্য একটা ফোকাসড অর্ডার পেজ — বিজ্ঞাপনে সরাসরি লিংক দেওয়ার জন্য।
          </p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700"
        >
          <Plus size={16} /> নতুন ল্যান্ডিং পেজ
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-16 border-2 border-dashed dark:border-slate-700 rounded-xl">
          <Megaphone className="mx-auto mb-2 text-gray-300 dark:text-slate-600" size={32} />
          এখনো কোনো ল্যান্ডিং পেজ তৈরি হয়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => {
            const product = typeof page.productId === "object" ? page.productId : null;
            return (
              <button
                key={page._id}
                onClick={() => router.push(`/admin/landing-pages/${page._id}`)}
                className="text-left bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3.5 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="relative h-14 w-14 rounded-lg overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                    {product?.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                        <ImageOff size={16} />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {page.headline}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                      {product?.name || "প্রোডাক্ট নেই"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {page.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="amber">Draft</Badge>}
                  {page.isPrimary && <Badge tone="indigo">Primary</Badge>}
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto">/{page.slug}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(page);
                    }}
                    className="text-[11px] font-semibold text-red-500 dark:text-red-400 hover:underline"
                  >
                    ডিলিট
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showPicker && (
        <ProductPickerModal
          existingProductIds={existingProductIds}
          onClose={() => setShowPicker(false)}
          onCreated={(page) => {
            setShowPicker(false);
            router.push(`/admin/landing-pages/${page._id}`);
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="ল্যান্ডিং পেজ ডিলিট করবেন?"
        message={`"${deleteTarget?.headline || ""}" — এই ল্যান্ডিং পেজ ও এর hero image স্থায়ীভাবে মুছে যাবে।`}
        confirmText={deleting ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
