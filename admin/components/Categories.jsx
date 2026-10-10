"use client";

import { useEffect, useState, useMemo } from "react";
import Toast from "../components/Toast";
import CategoriesSkeleton from "../components/Skeleton/CategoriesSkeleton";
import CategoryModal from "./CategoryModal";
import ListToolbar from "./ListToolbar";
import CategoryDeleteBlockedModal from "./CategoryDeleteBlockedModal";


export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [blockedDelete, setBlockedDelete] = useState(null); // { count, products }

  // ================== LOAD ==================
  const loadCategories = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`/api/admin/categories`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      arr.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(arr);
    } catch {
      setToast({ message: "⚠ Failed to load categories", type: "error" });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories =
    filter === "active"
      ? categories.filter((c) => c.isActive)
      : filter === "hidden"
        ? categories.filter((c) => !c.isActive)
        : categories;

  const hasAnyActive = useMemo(
    () => categories.some((c) => c.isActive),
    [categories],
  );

  const counts = useMemo(
    () => ({
      all: categories.length,
      active: categories.filter((c) => c.isActive).length,
      hidden: categories.filter((c) => !c.isActive).length,
    }),
    [categories],
  );

  // ================== CLOSE MODAL ==================
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setName("");
    setFile(null);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    setOrder(1);
    setIsActive(true);
    setLoading(false);
  };

  // ================== SUBMIT ==================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", name);
    data.append("order", order);
    data.append("isActive", isActive);
    if (file) data.append("image", file);

    let url = `/api/admin/categories`;
    let method = "POST";

    if (editId) {
      url += `/${editId}`;
      method = "PUT";
    }

    const res = await fetch(url, { method, body: data });

    if (res.ok) {
      setToast({
        message: editId ? "✅ Category updated!" : "✅ Category added!",
        type: "success",
      });
      closeModal();
      loadCategories();
    } else {
      const errData = await res.json().catch(() => ({}));
      setToast({
        message: errData?.error || "❌ Error saving category",
        type: "error",
      });
    }

    setLoading(false);
  };

  // ================== EDIT ==================
  const handleEdit = (c) => {
    setEditId(c._id);
    setName(c.name);
    setOrder(c.order || 1);
    setIsActive(c.isActive ?? true);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(c.image || "");
    setFile(null);
    setShowModal(true);
  };

  // ================== DELETE ==================
  const confirmDelete = (c) => setDeleteModal(c);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/categories/${deleteModal._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setToast({ message: "🗑 Category deleted!", type: "success" });
        setDeleteModal(null);
        loadCategories();
      } else {
        const errData = await res.json().catch(() => ({}));

        if (errData?.code === "CATEGORY_HAS_PRODUCTS") {
          setDeleteModal(null);
          setBlockedDelete({
            count: errData.count || 0,
            products: Array.isArray(errData.products) ? errData.products : [],
          });
        } else {
          setToast({
            message: errData?.error || "❌ Error deleting category",
            type: "error",
          });
        }
      }
    } catch {
      setToast({ message: "🌐 Network error, please try again", type: "error" });
    }

    setDeleting(false);
  };

  // ================== BULK TOGGLE ==================
  const toggleAllCategories = async () => {
    try {
      setPageLoading(true);
      const newStatus = !hasAnyActive;

      await Promise.all(
        categories.map((c) =>
          fetch(`/api/admin/categories/${c._id}`, {
            method: "PUT",
            body: (() => {
              const d = new FormData();
              d.append("isActive", newStatus);
              d.append("order", c.order);
              return d;
            })(),
          }),
        ),
      );

      setToast({
        message: newStatus
          ? "✅ All categories activated!"
          : "👁 All categories hidden!",
        type: "success",
      });

      loadCategories();
    } catch (err) {
      console.error(err);
      setToast({ message: "❌ Bulk update failed", type: "error" });
      setPageLoading(false);
    }
  };

  return (
    <div className="">
      {/* HEADER */}
      <ListToolbar
        title="Categories"
        subtitle={`${counts.all ?? 0} total · ${counts.active ?? 0} active`}
        addLabel="Add Category"
        onAdd={() => {
          setEditId(null);
          setName("");
          setFile(null);
          if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
          setPreview("");
          setOrder(categories.length + 1);
          setIsActive(true);
          setShowModal(true);
        }}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        showBulk={categories.length > 0}
        hasAnyActive={hasAnyActive}
        onToggleAll={toggleAllCategories}
      />

      {/* GRID */}
      {pageLoading ? (
        <CategoriesSkeleton />
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">
          No categories found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCategories.map((c) => (
            <div
              key={c._id}
              className={`border p-4 rounded-xl flex flex-col items-center shadow-sm ${
                c.isActive
                  ? "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                  : "bg-gray-200 dark:bg-slate-800 border-gray-400 dark:border-slate-600 opacity-80"
              }`}
            >
              {c.image && (
                <img
                  className="h-24 w-24 rounded-full object-cover mb-2"
                  src={c.image}
                  alt={c.name}
                />
              )}
              <h2
                className={`font-semibold ${!c.isActive ? "text-gray-600 dark:text-slate-400" : "text-gray-900 dark:text-slate-100"}`}
              >
                {c.name}
              </h2>
              <div className="text-sm text-gray-700 dark:text-slate-300 mt-1">
                Serial: <b>{c.order}</b>
              </div>
              <div className="text-sm mt-1">
                Status:{" "}
                {c.isActive ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">Active</span>
                ) : (
                  <span className="text-gray-600 dark:text-slate-400 font-semibold">Hidden</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(c)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        show={showModal}
        editId={editId}
        categoriesLength={categories.length}
        name={name}
        setName={setName}
        order={order}
        setOrder={setOrder}
        isActive={isActive}
        setIsActive={setIsActive}
        file={file}
        setFile={setFile}
        preview={preview}
        setPreview={setPreview}
        loading={loading}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onToast={setToast}
      />

      {/* DELETE MODAL */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 w-full max-w-sm">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
                ⚠ Delete Category
              </h2>
              <p className="mb-6 text-gray-700 dark:text-slate-300">
                Delete <b>{deleteModal.name}</b>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CATEGORY DELETE BLOCKED (has products) */}
      <CategoryDeleteBlockedModal
        open={!!blockedDelete}
        count={blockedDelete?.count || 0}
        products={blockedDelete?.products || []}
        onClose={() => setBlockedDelete(null)}
      />

      {/* TOAST */}
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
