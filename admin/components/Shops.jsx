"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Plus,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
  ShieldBan,
  ShieldCheck,
  RefreshCw,
  Package,
  ShoppingCart,
  Users,
  UserPlus,
  X,
  Trash2,
} from "lucide-react";
import Toast from "./Toast";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700 border-green-300",
  trial: "bg-amber-100 text-amber-700 border-amber-300",
  suspended: "bg-red-100 text-red-700 border-red-300",
};

const DOMAIN_STATUS_STYLES = {
  verified: { icon: CheckCircle2, className: "text-green-600" },
  pending_dns: { icon: Clock, className: "text-amber-600" },
  failed: { icon: XCircle, className: "text-red-600" },
};

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null); // null = creating new
  const [form, setForm] = useState({ name: "", domain: "", contactEmail: "", contactPhone: "", plan: "free" });
  const [saving, setSaving] = useState(false);

  const [suspendModal, setSuspendModal] = useState(null); // shop being suspended
  const [suspendReason, setSuspendReason] = useState("");

  const [verifyingId, setVerifyingId] = useState(null);

  // ---- Admins management ----
  const [adminsModal, setAdminsModal] = useState(null); // shop being managed
  const [shopAdmins, setShopAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [invitingAdmin, setInvitingAdmin] = useState(false);

  // ================== LOAD ==================
  const loadShops = async () => {
    try {
      setPageLoading(true);
      const res = await fetch("/api/admin/shops");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setShops(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: "⚠ শপের লিস্ট লোড করতে সমস্যা হয়েছে", type: "error" });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  // ================== MODAL HELPERS ==================
  const openCreateModal = () => {
    setEditingShop(null);
    setForm({ name: "", domain: "", contactEmail: "", contactPhone: "", plan: "free" });
    setShowModal(true);
  };

  const openEditModal = (shop) => {
    setEditingShop(shop);
    setForm({
      name: shop.name || "",
      domain: shop.domain || "",
      contactEmail: shop.contactEmail || "",
      contactPhone: shop.contactPhone || "",
      plan: shop.plan || "free",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingShop(null);
    setSaving(false);
  };

  // ================== CREATE / UPDATE ==================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingShop ? `/api/admin/shops/${editingShop._id}` : "/api/admin/shops";
      const method = editingShop ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ message: data?.message || "❌ সমস্যা হয়েছে", type: "error" });
      } else {
        setToast({
          message: editingShop ? "✅ শপ আপডেট হয়েছে" : "✅ নতুন শপ তৈরি হয়েছে",
          type: "success",
        });
        closeModal();
        loadShops();
      }
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ================== SUSPEND / ACTIVATE ==================
  const confirmSuspend = (shop) => {
    setSuspendModal(shop);
    setSuspendReason("");
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;
    try {
      const res = await fetch(`/api/admin/shops/${suspendModal._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended", suspendedReason: suspendReason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: data?.message || "❌ সমস্যা হয়েছে", type: "error" });
      } else {
        setToast({ message: "🚫 শপ সাসপেন্ড করা হয়েছে", type: "success" });
        setSuspendModal(null);
        loadShops();
      }
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    }
  };

  const handleActivate = async (shop) => {
    try {
      const res = await fetch(`/api/admin/shops/${shop._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: data?.message || "❌ সমস্যা হয়েছে", type: "error" });
      } else {
        setToast({ message: "✅ শপ একটিভ করা হয়েছে", type: "success" });
        loadShops();
      }
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    }
  };

  // ================== VERIFY DOMAIN ==================
  const handleVerifyDomain = async (shop) => {
    setVerifyingId(shop._id);
    try {
      const res = await fetch(`/api/admin/shops/${shop._id}/verify-domain`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      setToast({
        message: data?.message || (res.ok ? "চেক করা হয়েছে" : "❌ সমস্যা হয়েছে"),
        type: data?.verified ? "success" : "error",
      });
      loadShops();
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    } finally {
      setVerifyingId(null);
    }
  };

  // ================== SHOP ADMINS ==================
  const loadShopAdmins = async (shop) => {
    setAdminsLoading(true);
    try {
      const res = await fetch(`/api/admin/shops/${shop._id}/admins`);
      const data = await res.json();
      setShopAdmins(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: "⚠ Admin লিস্ট লোড করতে সমস্যা হয়েছে", type: "error" });
    } finally {
      setAdminsLoading(false);
    }
  };

  const openAdminsModal = (shop) => {
    setAdminsModal(shop);
    setAdminForm({ name: "", email: "", password: "", role: "admin" });
    loadShopAdmins(shop);
  };

  const closeAdminsModal = () => {
    setAdminsModal(null);
    setShopAdmins([]);
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!adminsModal) return;
    setInvitingAdmin(true);

    try {
      const res = await fetch(`/api/admin/shops/${adminsModal._id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ message: data?.message || "❌ সমস্যা হয়েছে", type: "error" });
      } else {
        setToast({ message: data?.message || "✅ Assign করা হয়েছে", type: "success" });
        setAdminForm({ name: "", email: "", password: "", role: "admin" });
        loadShopAdmins(adminsModal);
        loadShops(); // admin count badge আপডেট করার জন্য
      }
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    } finally {
      setInvitingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!adminsModal) return;
    try {
      const res = await fetch(`/api/admin/shops/${adminsModal._id}/admins/${adminId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: data?.message || "❌ সমস্যা হয়েছে", type: "error" });
      } else {
        setToast({ message: "✅ শপ থেকে সরানো হয়েছে", type: "success" });
        loadShopAdmins(adminsModal);
        loadShops();
      }
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store size={24} /> Shops
        </h1>
        <button
          onClick={openCreateModal}
          className="lg:ml-auto flex items-center gap-1.5 bg-indigo-600 text-white shadow font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 active:scale-[0.98]"
        >
          <Plus size={16} /> নতুন শপ তৈরি করুন
        </button>
      </div>

      {/* LIST */}
      {pageLoading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : shops.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          এখনো কোনো শপ তৈরি হয়নি। "নতুন শপ তৈরি করুন" চাপুন।
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => {
            const domainInfo =
              DOMAIN_STATUS_STYLES[shop.domainStatus] || DOMAIN_STATUS_STYLES.pending_dns;
            const DomainIcon = domainInfo.icon;

            return (
              <div
                key={shop._id}
                className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-lg">{shop.name}</h2>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <Globe size={14} />
                      {shop.domain}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${
                      STATUS_STYLES[shop.status] || ""
                    }`}
                  >
                    {shop.status}
                  </span>
                </div>

                <div className={`flex items-center gap-1.5 text-sm ${domainInfo.className}`}>
                  <DomainIcon size={15} />
                  {shop.domainStatus === "verified"
                    ? "ডোমেইন ভেরিফাইড"
                    : shop.domainStatus === "failed"
                      ? "ডোমেইন ভেরিফিকেশন ব্যর্থ"
                      : "DNS ভেরিফিকেশনের অপেক্ষায়"}
                  <button
                    onClick={() => handleVerifyDomain(shop)}
                    disabled={verifyingId === shop._id}
                    title="আবার চেক করুন"
                    className="ml-auto text-gray-400 hover:text-indigo-600"
                  >
                    <RefreshCw
                      size={14}
                      className={verifyingId === shop._id ? "animate-spin" : ""}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 rounded-lg py-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <Package size={14} className="text-gray-500" />
                    <b>{shop.stats?.products ?? 0}</b>
                    <span className="text-gray-500">Products</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <ShoppingCart size={14} className="text-gray-500" />
                    <b>{shop.stats?.orders ?? 0}</b>
                    <span className="text-gray-500">Orders</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Users size={14} className="text-gray-500" />
                    <b>{shop.stats?.admins ?? 0}</b>
                    <span className="text-gray-500">Admins</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => openAdminsModal(shop)}
                    className="flex-1 flex items-center justify-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-sm hover:bg-indigo-200"
                  >
                    <UserPlus size={14} /> Admins
                  </button>
                  <button
                    onClick={() => openEditModal(shop)}
                    className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  {shop.status === "suspended" ? (
                    <button
                      onClick={() => handleActivate(shop)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                    >
                      <ShieldCheck size={14} /> Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => confirmSuspend(shop)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                    >
                      <ShieldBan size={14} /> Suspend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl shadow-xl border w-full max-w-md space-y-4"
            >
              <h2 className="text-xl font-bold">
                {editingShop ? "শপ এডিট করুন" : "নতুন শপ তৈরি করুন"}
              </h2>

              <div>
                <label className="text-sm font-medium">শপের নাম</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Cartvan Fashion"
                />
              </div>

              <div>
                <label className="text-sm font-medium">কাস্টম ডোমেইন</label>
                <input
                  required
                  value={form.domain}
                  onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="shop1.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  https://, www. লাগবে না — শুধু ডোমেইন নেম (যেমন: shop1.com)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg">
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "সেভ হচ্ছে..." : editingShop ? "আপডেট করুন" : "তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* SUSPEND CONFIRM MODAL */}
      {suspendModal && (
        <>
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl border w-full max-w-sm">
              <h2 className="text-xl font-bold text-red-600 mb-3">⚠ শপ সাসপেন্ড করবেন?</h2>
              <p className="mb-3">
                <b>{suspendModal.name}</b> সাসপেন্ড করলে এই শপের কাস্টমার-ফেসিং সাইট বন্ধ হয়ে যাবে।
              </p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="কারণ (ঐচ্ছিক)"
                className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSuspendModal(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  সাসপেন্ড করুন
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADMINS MANAGEMENT MODAL */}
      {adminsModal && (
        <>
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" onClick={closeAdminsModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl border w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus size={18} /> {adminsModal.name} — Admins
                </h2>
                <button onClick={closeAdminsModal} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Existing admins list */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    বর্তমানে assign করা আছে
                  </h3>
                  {adminsLoading ? (
                    <div className="text-sm text-gray-500">লোড হচ্ছে...</div>
                  ) : shopAdmins.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      এই শপে এখনো কোনো admin assign করা হয়নি।
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shopAdmins.map((a) => (
                        <div
                          key={a._id}
                          className="flex items-center justify-between border rounded-lg px-3 py-2"
                        >
                          <div>
                            <div className="font-medium text-sm">{a.name}</div>
                            <div className="text-xs text-gray-500">
                              {a.email} · <span className="capitalize">{a.role}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAdmin(a._id)}
                            title="এই শপ থেকে unassign করুন"
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite / assign form */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    নতুন Admin যোগ করুন
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    আগে থেকে থাকা admin-এর ইমেইল দিলে সেই অ্যাকাউন্টই এই শপে assign হয়ে যাবে —
                    না থাকলে নাম ও পাসওয়ার্ড দিয়ে নতুন অ্যাকাউন্ট তৈরি হবে।
                  </p>
                  <form onSubmit={handleInviteAdmin} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="নাম (নতুন হলে আবশ্যক)"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="পাসওয়ার্ড (নতুন হলে আবশ্যক, কমপক্ষে ৬ ক্যারেক্টার)"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                      value={adminForm.role}
                      onChange={(e) => setAdminForm((f) => ({ ...f, role: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="admin">Admin (ফুল অ্যাক্সেস)</option>
                      <option value="staff">Staff (সীমিত)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={invitingAdmin}
                      className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {invitingAdmin ? "যোগ করা হচ্ছে..." : "Assign করুন"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
