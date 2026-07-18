"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import Toast from "../../../../../components/Toast";
import TrashCard from "../../../../../components/TrashCard";

const TTL_DAYS = 3;

export default function ShopTrashPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [emptying, setEmptying] = useState(false);

  const loadTrash = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/shops/trash", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data?.message || "Shop Trash load করা যায়নি");
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ message: `❌ ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async () => {
    const item = confirmModal?.item;
    if (!item) return;
    setBusyId(item._id);

    try {
      const response = await fetch(
        `/api/admin/shops/trash/${item._id}/restore`,
        { method: "POST" },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Restore failed");
      }

      setToast({ message: data.message || "♻️ Shop restored", type: "success" });
      await loadTrash();
    } catch (err) {
      setToast({ message: `❌ ${err.message}`, type: "error" });
    } finally {
      setBusyId(null);
      setConfirmModal(null);
    }
  };

  const handlePermanentDelete = async () => {
    const item = confirmModal?.item;
    if (!item) return;
    setBusyId(item._id);

    try {
      const response = await fetch(`/api/admin/shops/trash/${item._id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Permanent delete failed");
      }

      setToast({
        message: data.message || "🗑️ Shop permanently deleted",
        type: "success",
      });
      await loadTrash();
    } catch (err) {
      setToast({ message: `❌ ${err.message}`, type: "error" });
    } finally {
      setBusyId(null);
      setConfirmModal(null);
    }
  };

  const handleEmptyTrash = async () => {
    setEmptying(true);

    try {
      const response = await fetch("/api/admin/shops/trash/empty", {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Empty Trash failed");
      }

      setToast({ message: data.message || "🗑️ Shop Trash emptied", type: "success" });
      await loadTrash();
    } catch (err) {
      setToast({ message: `❌ ${err.message}`, type: "error" });
    } finally {
      setEmptying(false);
      setConfirmModal(null);
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Trash2 size={28} /> Shop Trash
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Deleted shops remain here for {TTL_DAYS} days. Restore করলে shop এবং আগের assigned admins ফিরে আসবে। কোনো action না নিলে shop ও তার সব data permanently delete হবে।
          </p>
        </div>

        <div className="flex gap-2 lg:ml-auto">
          <Link
            href="/super-admin/shops"
            className="flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Shops
          </Link>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmModal({ mode: "empty" })}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : items.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <TrashCard
              key={item._id}
              item={item}
              busy={busyId === item._id}
              onRestore={() => setConfirmModal({ mode: "restore", item })}
              onDelete={() => setConfirmModal({ mode: "delete", item })}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-white py-14 text-center text-gray-500">
          Shop Trash is empty.
        </div>
      )}

      {confirmModal && (
        <>
          <div className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl">
              {confirmModal.mode === "restore" && (
                <>
                  <h2 className="mb-3 text-xl font-bold text-green-600">
                    ♻️ Restore Shop
                  </h2>
                  <p className="mb-6 text-gray-700">
                    <b>{confirmModal.item?.data?.name}</b> এবং আগের admin assignments Restore করবেন?
                  </p>
                </>
              )}

              {confirmModal.mode === "delete" && (
                <>
                  <h2 className="mb-3 text-xl font-bold text-red-600">
                    ⚠ Delete Forever
                  </h2>
                  <p className="mb-6 text-gray-700">
                    <b>{confirmModal.item?.data?.name}</b>, products, orders, users, settings এবং related assets permanently delete হবে। এটি undo করা যাবে না।
                  </p>
                </>
              )}

              {confirmModal.mode === "empty" && (
                <>
                  <h2 className="mb-3 text-xl font-bold text-red-600">
                    ⚠ Empty Shop Trash
                  </h2>
                  <p className="mb-6 text-gray-700">
                    Trash-এর সব {items.length}টি shop এবং তাদের সব data permanently delete হবে।
                  </p>
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={Boolean(busyId) || emptying}
                  onClick={() => setConfirmModal(null)}
                  className="rounded-lg border px-4 py-2 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={Boolean(busyId) || emptying}
                  onClick={
                    confirmModal.mode === "restore"
                      ? handleRestore
                      : confirmModal.mode === "delete"
                        ? handlePermanentDelete
                        : handleEmptyTrash
                  }
                  className={`rounded-lg px-4 py-2 text-white disabled:opacity-60 ${
                    confirmModal.mode === "restore"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {confirmModal.mode === "restore"
                    ? busyId
                      ? "Restoring..."
                      : "Restore"
                    : confirmModal.mode === "delete"
                      ? busyId
                        ? "Deleting..."
                        : "Delete Forever"
                      : emptying
                        ? "Emptying..."
                        : "Empty Trash"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
