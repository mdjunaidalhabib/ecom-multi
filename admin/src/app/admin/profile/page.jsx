"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import EditProfileForm from "./EditProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import AdminProfileSkeleton from "../../../../components/Skeleton/AdminProfileSkeleton";
import { formatDateTime } from "../../../../lib/utils";

export default function AdminProfilePage() {
  const API_BASE = "/api";

  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState("view"); // view | edit | password
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdmin = async () => {
    try {
      setError("");
      setLoading(true);

      // ✅ existing flow: verify endpoint
      const res = await axios.get(`${API_BASE}/admin/verify`, {
        withCredentials: true,
      });

      setAdmin(res.data.admin);
    } catch (err) {
      console.error("❌ Profile load error:", err);
      setError("Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  // ✅ Skeleton while loading
  if (loading) return <AdminProfileSkeleton />;

  if (error) return <div className="p-6 text-red-500 dark:text-red-400">{error}</div>;
  if (!admin) return <div className="p-6 text-gray-900 dark:text-slate-100">No admin found</div>;

  const locationText = admin.lastLoginLocation
    ? [
        admin.lastLoginLocation.city,
        admin.lastLoginLocation.region,
        admin.lastLoginLocation.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "—";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ✅ Header (Desktop same, Mobile compact like sidebar + name/email centered) */}
      <div className="bg-white dark:bg-slate-900 shadow rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 sm:items-center sm:justify-start sm:gap-4">
          {/* Avatar */}
          <img
            src={admin.avatar || "/default-avatar.svg"}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-slate-700 shrink-0"
          />

          {/* ✅ Desktop text block (name/email centered) */}
          <div className="hidden sm:block flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{admin.name}</h1>
            <p className="text-gray-600 dark:text-slate-400">{admin.email}</p>

            <div className="mt-1 flex gap-2 text-sm justify-center">
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                Role: Super Admin
              </span>

              <span
                className={`px-2 py-0.5 rounded ${
                  admin.status === "suspended"
                    ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                    : "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                }`}
              >
                {admin.status || "active"}
              </span>
            </div>
          </div>

          {/* ✅ Mobile right-side badges */}
          <div className="flex flex-col items-end gap-1 sm:hidden">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
              Role: Super Admin
            </span>

            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                admin.status === "suspended"
                  ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                  : "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
              }`}
            >
              {admin.status || "active"}
            </span>
          </div>
        </div>

        {/* ✅ Mobile full width name/email center */}
        <div className="mt-3 sm:hidden text-center">
          <h1 className="text-xl font-bold truncate text-gray-900 dark:text-slate-100">{admin.name}</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 truncate">{admin.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <TabButton active={tab === "view"} onClick={() => setTab("view")}>
          Profile
        </TabButton>
        <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
          Edit Profile
        </TabButton>
        <TabButton
          active={tab === "password"}
          onClick={() => setTab("password")}
        >
          Change Password
        </TabButton>
      </div>

      {/* Body */}
      <div className="mt-4 bg-white dark:bg-slate-900 shadow rounded-2xl p-6">
        {tab === "view" && (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Info label="Name" value={admin.name} />
            <Info label="Username" value={admin.username || "—"} />
            <Info label="Email" value={admin.email} />
            <Info label="Phone" value={admin.phone || "—"} />
            <Info label="Address" value={admin.address || "—"} />

            <Info
              label="Last Login"
              value={
                admin.lastLoginAt
                  ? formatDateTime(admin.lastLoginAt)
                  : "—"
              }
            />
            <Info label="Last IP" value={admin.lastLoginIp || "—"} />

            {/* ✅ NEW DETAILS */}
            <Info label="Device" value={admin.lastLoginDevice || "—"} />
            <Info label="OS" value={admin.lastLoginOS || "—"} />
            <Info label="Browser" value={admin.lastLoginBrowser || "—"} />
            <Info label="Location" value={locationText} />

            <Info
              label="Created At"
              value={
                admin.createdAt
                  ? formatDateTime(admin.createdAt)
                  : "—"
              }
            />
          </div>
        )}

        {tab === "edit" && (
          <EditProfileForm admin={admin} onSuccess={loadAdmin} />
        )}

        {tab === "password" && (
          <ChangePasswordForm onSuccess={() => setTab("view")} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${
        active
          ? "bg-black dark:bg-slate-700 text-white"
          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
      <p className="text-gray-500 dark:text-slate-400">{label}</p>
      <p className="font-medium break-words text-gray-900 dark:text-slate-200">{value}</p>
    </div>
  );
}
