"use client";

import { useEffect, useState } from "react";
import Toast from "./Toast";
import StaffPermissionMatrix from "./StaffPermissionMatrix";
import { emptyStaffPermissions, countActiveModules } from "../lib/staffPermissions";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState(emptyStaffPermissions());

  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [accessTarget, setAccessTarget] = useState(null);
  const [accessPermissions, setAccessPermissions] = useState(emptyStaffPermissions());
  const [savingAccess, setSavingAccess] = useState(false);

  // ================== LOAD ==================
  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: "⚠ Failed to load staff", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // ================== ADD ==================
  const closeModal = () => {
    setShowModal(false);
    setName("");
    setEmail("");
    setPassword("");
    setPermissions(emptyStaffPermissions());
    setSaving(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, permissions }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setToast({
          message: data.message || "✅ Staff added!",
          type: "success",
        });
        closeModal();
        loadStaff();
      } else {
        setToast({
          message: data?.message || "❌ Error adding staff",
          type: "error",
        });
        setSaving(false);
      }
    } catch {
      setToast({ message: "❌ Error adding staff", type: "error" });
      setSaving(false);
    }
  };

  // ================== STATUS TOGGLE ==================
  const toggleStatus = async (member) => {
    setStatusUpdatingId(member._id);
    const nextStatus = member.status === "active" ? "suspended" : "active";

    try {
      const res = await fetch(`/api/admin/staff/${member._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setToast({
          message:
            nextStatus === "active" ? "✅ Staff activated" : "⛔ Staff suspended",
          type: "success",
        });
        loadStaff();
      } else {
        setToast({
          message: data?.message || "❌ Error updating status",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "❌ Error updating status", type: "error" });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ================== ACCESS / PERMISSIONS ==================
  const openAccessModal = (member) => {
    setAccessTarget(member);
    setAccessPermissions(member.permissions || emptyStaffPermissions());
  };

  const closeAccessModal = () => {
    setAccessTarget(null);
    setAccessPermissions(emptyStaffPermissions());
    setSavingAccess(false);
  };

  const handleSaveAccess = async () => {
    if (!accessTarget) return;
    setSavingAccess(true);

    try {
      const res = await fetch(
        `/api/admin/staff/${accessTarget._id}/permissions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: accessPermissions }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setToast({ message: "✅ অ্যাক্সেস আপডেট হয়েছে", type: "success" });
        closeAccessModal();
        loadStaff();
      } else {
        setToast({
          message: data?.message || "❌ Error updating access",
          type: "error",
        });
        setSavingAccess(false);
      }
    } catch {
      setToast({ message: "❌ Error updating access", type: "error" });
      setSavingAccess(false);
    }
  };

  // ================== REMOVE ==================
  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);

    try {
      const res = await fetch(`/api/admin/staff/${removeTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setToast({ message: "🗑 Staff removed!", type: "success" });
        setRemoveTarget(null);
        loadStaff();
      } else {
        setToast({
          message: data?.message || "❌ Error removing staff",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "❌ Error removing staff", type: "error" });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">🧑‍💼 Staff</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white shadow font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 active:scale-[0.98]"
        >
          + Add Staff
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">Loading...</div>
      ) : staff.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">
          এখনও কোনো স্টাফ যোগ করা হয়নি।
        </div>
      ) : (
        <>
          {/* ✅ Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-slate-800">
                <tr>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">নাম</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">ইমেইল</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">স্ট্যাটাস</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">অ্যাক্সেস</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="p-3 font-medium text-gray-900 dark:text-slate-100">{s.name}</td>
                    <td className="p-3 text-gray-700 dark:text-slate-300">{s.email}</td>
                    <td className="p-3">
                      {s.status === "active" ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {countActiveModules(s.permissions) > 0 ? (
                        `${countActiveModules(s.permissions)} সেকশন`
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">কোনো অ্যাক্সেস নেই</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAccessModal(s)}
                          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                        >
                          Access
                        </button>
                        <button
                          onClick={() => toggleStatus(s)}
                          disabled={statusUpdatingId === s._id}
                          className={`px-3 py-1 rounded text-white text-xs font-semibold disabled:opacity-50 ${
                            s.status === "active"
                              ? "bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {s.status === "active" ? "Suspend" : "Activate"}
                        </button>
                        <button
                          onClick={() => setRemoveTarget(s)}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Card View */}
          <div className="grid gap-3 md:hidden">
            {staff.map((s) => (
              <div
                key={s._id}
                className="border dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 dark:text-slate-200 truncate">
                      {s.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400 break-all">
                      {s.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {countActiveModules(s.permissions) > 0
                        ? `${countActiveModules(s.permissions)} সেকশনে অ্যাক্সেস`
                        : "কোনো অ্যাক্সেস নেই"}
                    </div>
                  </div>
                  {s.status === "active" ? (
                    <span className="text-green-600 dark:text-green-400 text-xs font-semibold shrink-0">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 text-xs font-semibold shrink-0">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openAccessModal(s)}
                    className="flex-1 px-3 py-1.5 rounded bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Access
                  </button>
                  <button
                    onClick={() => toggleStatus(s)}
                    disabled={statusUpdatingId === s._id}
                    className={`flex-1 px-3 py-1.5 rounded text-white text-xs font-semibold disabled:opacity-50 ${
                      s.status === "active" ? "bg-gray-600 dark:bg-slate-600" : "bg-green-600"
                    }`}
                  >
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                  <button
                    onClick={() => setRemoveTarget(s)}
                    className="flex-1 px-3 py-1.5 rounded bg-red-600 text-white text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ADD STAFF MODAL */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl border dark:border-slate-700 w-full max-w-lg space-y-4 my-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">+ নতুন Staff যোগ করুন</h2>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">নাম</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="স্টাফের নাম"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
                  ইমেইল
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="staff@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
                  পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="কমপক্ষে ৬ ক্যারেক্টার"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  ইমেইলটি যদি ইতিমধ্যে কোনো শপে ব্যবহৃত না থাকে, নতুন
                  অ্যাকাউন্ট তৈরি হবে।
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  কোন কোন সেকশনে কী কী করতে পারবে?
                </label>
                <StaffPermissionMatrix
                  value={permissions}
                  onChange={setPermissions}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? "যোগ হচ্ছে..." : "যোগ করুন"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ACCESS / PERMISSIONS MODAL */}
      {accessTarget && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl border dark:border-slate-700 w-full max-w-lg space-y-4 my-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                🔐 {accessTarget.name}-এর অ্যাক্সেস
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                শুধু টিক দেওয়া সেকশন ও কাজগুলো এই staff করতে পারবে।
              </p>

              <StaffPermissionMatrix
                value={accessPermissions}
                onChange={setAccessPermissions}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAccessModal}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSaveAccess}
                  disabled={savingAccess}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  {savingAccess ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* REMOVE CONFIRM MODAL */}
      {removeTarget && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl border dark:border-slate-700 w-full max-w-sm">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
                ⚠ Remove Staff
              </h2>
              <p className="mb-6 text-gray-700 dark:text-slate-300">
                <b>{removeTarget.name}</b> কে এই শপ থেকে সরিয়ে দেবেন?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRemoveTarget(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                >
                  {removing ? "সরানো হচ্ছে..." : "Remove"}
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
    </div>
  );
}
