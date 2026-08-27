"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Plus,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
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
  Eye,
  EyeOff,
} from "lucide-react";
import Toast from "./Toast";

const STATUS_STYLES = {
  active: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30",
  trial: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30",
  suspended: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30",
};

// ✅ ডোমেইন সেটআপের ২টা আলাদা ধাপ থাকে — DNS ঠিক আছে কিনা (domainStatus),
// আর DNS ঠিক থাকলে সাইট আসলে লোড হচ্ছে কিনা (domainLiveStatus, দেখুন
// verifyShopDomain backend controller)। দুটো মিলিয়ে একটাই স্পষ্ট বাংলা
// মেসেজ + আইকন বানানো হয় যাতে card দেখেই বোঝা যায় কতটুকু কাজ বাকি।
function getDomainStatusInfo(shop) {
  if (shop.domainStatus === "failed") {
    return {
      icon: XCircle,
      className: "text-red-600 dark:text-red-400",
      label: "ডোমেইন ভেরিফিকেশন ব্যর্থ — DNS ঠিক করুন",
    };
  }
  if (shop.domainStatus === "verified") {
    if (shop.domainLiveStatus === "live") {
      return {
        icon: CheckCircle2,
        className: "text-green-600 dark:text-green-400",
        label: "সম্পূর্ণ লাইভ — ডোমেইন দিয়ে সাইট চলছে",
      };
    }
    return {
      icon: AlertTriangle,
      className: "text-orange-600 dark:text-orange-400",
      label: "DNS ঠিক আছে, কিন্তু সাইট লোড হচ্ছে না — হোস্টিং প্যানেলে ডোমেইন attach করুন",
    };
  }
  return {
    icon: Clock,
    className: "text-amber-600 dark:text-amber-400",
    label: "DNS ভেরিফিকেশনের অপেক্ষায়",
  };
}

// ✅ কাস্টম ডোমেইন থাকলে সরাসরি সেই ডোমেইনে, নাহলে platform-এর নিজস্ব
// slug-based path (/shop/<slug>) দিয়ে শপটা খোলার লিংক বানায়।
const SHOP_BASE_URL = process.env.NEXT_PUBLIC_SHOP_BASE_URL || "";
function getShopPublicUrl(shop) {
  return shop.domain ? `https://${shop.domain}` : `${SHOP_BASE_URL}/shop/${shop.slug}`;
}

// ✅ প্ল্যান এখন super-admin থেকে dynamically যোগ/এডিট/ডিলিট করা যায় (দেখুন
// Plans পেজ), তাই এখানে fixed free/starter/pro constants নেই — badge রঙ
// একটা ছোট rotating palette থেকে index অনুযায়ী বসে
const PLAN_BADGE_PALETTE = [
  "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600",
  "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30",
  "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
  "bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/30",
];
// ✅ সাবস্ক্রিপশন মেয়াদের প্রিসেট — সবগুলোই দিনের এককে (backend-ও দিনে হিসাব
// করে, দেখুন planExpiry.js)। "custom" বাছলে সরাসরি দিনের সংখ্যা input দেখায়,
// যাতে যেকোনো মেয়াদ (৪৫ দিন, ২ বছর = ৭৩০ দিন, ইত্যাদি) নিখুঁতভাবে দেওয়া যায়।
const DURATION_PRESETS = [
  { value: "", label: "মেয়াদ নেই" },
  { value: "30", label: "১ মাস (৩০ দিন)" },
  { value: "90", label: "৩ মাস (৯০ দিন)" },
  { value: "180", label: "৬ মাস (১৮০ দিন)" },
  { value: "365", label: "১ বছর (৩৬৫ দিন)" },
  { value: "custom", label: "কাস্টম (দিন সংখ্যা)" },
];

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [plans, setPlans] = useState([]);
  const [themes, setThemes] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null); // null = creating new
  const [form, setForm] = useState({
    name: "",
    slug: "",
    domain: "",
    contactEmail: "",
    contactPhone: "",
    plan: "free",
    theme: "",
    subscriptionStartDate: "",
    durationPreset: "",
    customDays: "",
  });
  const [slugEdited, setSlugEdited] = useState(false); // ইউজার নিজে হাতে slug বদলেছে কিনা — বদলালে আর নাম থেকে অটো-সাজেস্ট হবে না
  const [saving, setSaving] = useState(false);
  const [shopErrors, setShopErrors] = useState({});

  const [suspendModal, setSuspendModal] = useState(null); // shop being suspended
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendReasonError, setSuspendReasonError] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deletingShop, setDeletingShop] = useState(false);

  const [verifyingId, setVerifyingId] = useState(null);

  // ---- Admins management ----
  const [adminsModal, setAdminsModal] = useState(null); // shop being managed
  const [shopAdmins, setShopAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [invitingAdmin, setInvitingAdmin] = useState(false);
  const [adminErrors, setAdminErrors] = useState({});
  const [showAdminPassword, setShowAdminPassword] = useState(false);

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
    // ✅ প্ল্যান লিস্ট — dropdown, badge label এবং effective theme (branding.theme
    // override না থাকলে) সবকিছুর জন্যই লাগে (দেখুন Plans পেজ)
    fetch("/api/admin/plans")
      .then((res) => res.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => {});
    // ✅ থিম লিস্ট — Theme override dropdown এবং effective theme লেবেলের জন্য
    fetch("/api/admin/themes")
      .then((res) => res.json())
      .then((data) => setThemes(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ✅ শপ কার্ডে মেয়াদ badge দেখানোর জন্য — দিন বাকি থাকলে সংখ্যা, পার হয়ে
  // গেলে "মেয়াদ শেষ" (auto-suspend sweep এখনো status আপডেট না করলেও)
  const getExpiryInfo = (shop) => {
    if (!shop.planExpiresAt) return null;
    const diffMs = new Date(shop.planExpiresAt).getTime() - Date.now();
    const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    if (diffMs <= 0) {
      return { label: "মেয়াদ শেষ", className: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30" };
    }
    if (daysLeft <= 7) {
      return {
        label: `মেয়াদ বাকি ${daysLeft} দিন`,
        className: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
      };
    }
    return {
      label: `মেয়াদ বাকি ${daysLeft} দিন`,
      className: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30",
    };
  };

  const getPlan = (key) => plans.find((p) => p.key === key);
  const getPlanLabel = (key) => getPlan(key)?.name || key;
  const getThemeLabel = (key) => themes.find((t) => t.key === key)?.name || key;
  const getPlanBadgeStyle = (key) => {
    const index = plans.findIndex((p) => p.key === key);
    return PLAN_BADGE_PALETTE[index >= 0 ? index % PLAN_BADGE_PALETTE.length : 0];
  };

  // ================== MODAL HELPERS ==================
  // Backend normalizeSlug()-এর সাথে মিলিয়ে রাখা — শুধু preview-এর জন্য,
  // আসল validation/uniqueness সার্ভারেই হয়
  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");

  // ✅ Date input শুধু "YYYY-MM-DD" নেয় — server-এর ISO string থেকে সেই অংশটুকু কেটে নেওয়া
  const toDateInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  // ✅ subscriptionDays সংখ্যা থেকে durationPreset ফর্ম-স্টেট বের করে —
  // ৩০/৯০/১৮০/৩৬৫ প্রিসেটের বাইরে যেকোনো সংখ্যা হলে "custom" এ পড়ে
  const daysToDurationPreset = (days) => {
    if (!days) return { durationPreset: "", customDays: "" };
    if (["30", "90", "180", "365"].includes(String(days))) {
      return { durationPreset: String(days), customDays: "" };
    }
    return { durationPreset: "custom", customDays: String(days) };
  };

  // ✅ ফর্মে বাছাই করা শুরুর তারিখ + মেয়াদ থেকে "মেয়াদ শেষ হবে" preview —
  // backend-এর computePlanExpiresAt()-এর সাথে সামঞ্জস্যপূর্ণ (দিন-ভিত্তিক)
  const previewExpiryDate = (form) => {
    const days = form.durationPreset === "custom" ? Number(form.customDays) : Number(form.durationPreset || 0);
    if (!days || !form.subscriptionStartDate) return null;
    const d = new Date(form.subscriptionStartDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + days);
    return d;
  };

  const openCreateModal = () => {
    setEditingShop(null);
    setForm({
      name: "",
      slug: "",
      domain: "",
      contactEmail: "",
      contactPhone: "",
      plan: "free",
      theme: "",
      subscriptionStartDate: toDateInputValue(new Date()),
      durationPreset: "",
      customDays: "",
    });
    setSlugEdited(false);
    setShopErrors({});
    setShowModal(true);
  };

  const openEditModal = (shop) => {
    setEditingShop(shop);
    setSlugEdited(true); // এডিটের সময় নাম বদলালেও existing slug অটো বদলাবে না
    setShopErrors({});
    setForm({
      name: shop.name || "",
      slug: shop.slug || "",
      domain: shop.domain || "",
      contactEmail: shop.contactEmail || "",
      contactPhone: shop.contactPhone || "",
      plan: shop.plan || "free",
      theme: shop.branding?.theme || "",
      subscriptionStartDate: toDateInputValue(shop.subscriptionStartDate || shop.createdAt),
      ...daysToDurationPreset(shop.subscriptionDays),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingShop(null);
    setSaving(false);
    setShopErrors({});
  };

  // ================== CREATE / UPDATE ==================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.slug.trim()) errors.slug = true;
    if (
      form.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())
    ) {
      errors.contactEmail = true;
    }
    if (form.durationPreset === "custom" && !(Number(form.customDays) > 0)) {
      errors.customDays = true;
    }
    setShopErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);

    // ✅ durationPreset/customDays শুধু UI-এর সুবিধার জন্য — backend
    // শুধু subscriptionStartDate + subscriptionDays (সংখ্যা) বোঝে
    const subscriptionDays =
      form.durationPreset === "custom"
        ? Number(form.customDays)
        : form.durationPreset
          ? Number(form.durationPreset)
          : null;

    const { durationPreset, customDays, ...rest } = form;
    const payload = { ...rest, subscriptionDays };

    try {
      const url = editingShop ? `/api/admin/shops/${editingShop._id}` : "/api/admin/shops";
      const method = editingShop ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.message || "❌ সমস্যা হয়েছে";
        const nextErrors = {};
        if (message.includes("নাম")) nextErrors.name = true;
        if (message.includes("Slug")) nextErrors.slug = true;
        if (message.includes("ডোমেইন")) nextErrors.domain = true;
        if (message.includes("মেয়াদকাল")) nextErrors.customDays = true;
        setShopErrors(nextErrors);
        setToast({ message, type: "error" });
      } else {
        setShopErrors({});
        setToast(
          data?.overLimitWarning
            ? { message: data.overLimitWarning, type: "warning" }
            : {
                message: editingShop ? "✅ শপ আপডেট হয়েছে" : "✅ নতুন শপ তৈরি হয়েছে",
                type: "success",
              },
        );
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
    setSuspendReasonError(false);
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;

    const normalizedReason = suspendReason.trim();
    if (!normalizedReason) {
      setSuspendReasonError(true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/shops/${suspendModal._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "suspended",
          suspendedReason: normalizedReason,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: data?.message || "❌ সমস্যা হয়েছে", type: "error" });
      } else {
        setToast({ message: "🚫 শপ সাসপেন্ড করা হয়েছে", type: "success" });
        setSuspendModal(null);
        setSuspendReason("");
        setSuspendReasonError(false);
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

  // ================== MOVE SHOP TO TRASH ==================
  const handleDeleteShop = async () => {
    if (!deleteModal) return;
    setDeletingShop(true);

    try {
      const res = await fetch(`/api/admin/shops/${deleteModal._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ message: data?.message || "❌ Shop delete failed", type: "error" });
      } else {
        setToast({
          message: data?.message || "🗑️ Shop Trash-এ পাঠানো হয়েছে",
          type: "success",
        });
        setDeleteModal(null);
        loadShops();
      }
    } catch {
      setToast({ message: "❌ Server error", type: "error" });
    } finally {
      setDeletingShop(false);
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
    setAdminErrors({});
    setShowAdminPassword(false);
    loadShopAdmins(shop);
  };

  const closeAdminsModal = () => {
    setAdminsModal(null);
    setShopAdmins([]);
    setAdminErrors({});
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!adminsModal) return;

    const normalizedEmail = adminForm.email.trim();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!emailIsValid) {
      setAdminErrors({ email: true });
      setToast({ message: "সঠিক ইমেইল দিন", type: "error" });
      return;
    }

    setAdminErrors({});
    setInvitingAdmin(true);

    try {
      const res = await fetch(`/api/admin/shops/${adminsModal._id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.message || "❌ সমস্যা হয়েছে";
        const nextErrors = {};
        if (message.includes("ইমেইল")) nextErrors.email = true;
        if (message.includes("নাম")) nextErrors.name = true;
        if (message.includes("পাসওয়ার্ড")) nextErrors.password = true;
        setAdminErrors(nextErrors);
        setToast({ message, type: "error" });
      } else {
        setAdminErrors({});
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
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
          <Store size={24} /> Shops
        </h1>
        <div className="lg:ml-auto flex flex-wrap gap-2">
          <Link
            href="/trash"
            className="flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98]"
          >
            <Trash2 size={16} /> Shop Trash
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-rose-600 text-white shadow font-semibold px-4 py-2 rounded-lg text-sm hover:bg-rose-700 active:scale-[0.98]"
          >
            <Plus size={16} /> নতুন শপ তৈরি করুন
          </button>
        </div>
      </div>

      {/* LIST */}
      {pageLoading ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">লোড হচ্ছে...</div>
      ) : shops.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">
          এখনো কোনো শপ তৈরি হয়নি। "নতুন শপ তৈরি করুন" চাপুন।
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => {
            const domainInfo = getDomainStatusInfo(shop);
            const DomainIcon = domainInfo.icon;
            const effectiveTheme =
              shop.branding?.theme || getPlan(shop.plan)?.theme || "classic";
            const themeIsOverridden = !!shop.branding?.theme;
            const expiryInfo = getExpiryInfo(shop);

            return (
              <div
                key={shop._id}
                className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm dark:shadow-black/20 bg-white dark:bg-slate-900 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-slate-100">{shop.name}</h2>
                    <a
                      href={getShopPublicUrl(shop)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="নতুন ট্যাবে শপটা খুলুন"
                      className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 mt-0.5 hover:text-rose-600 dark:hover:text-rose-400 hover:underline w-fit"
                    >
                      <Globe size={14} />
                      {shop.domain || `/shop/${shop.slug}`}
                    </a>
                    {shop.storageNumber != null && (
                      <div
                        className="mt-1 inline-flex items-center gap-1 text-xs font-mono text-gray-400 dark:text-slate-500"
                        title="Cloudflare R2-এ এই শপের image storage key (shops/{id}/...)"
                      >
                        R2 ID: #{shop.storageNumber}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${
                      STATUS_STYLES[shop.status] || ""
                    }`}
                  >
                    {shop.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full border ${getPlanBadgeStyle(shop.plan)}`}
                  >
                    {getPlanLabel(shop.plan)} প্ল্যান
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full border bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                    title={themeIsOverridden ? "এই শপে নিজস্ব override করা theme" : "প্ল্যানের default theme"}
                  >
                    {getThemeLabel(effectiveTheme)} থিম
                    {themeIsOverridden ? " (override)" : ""}
                  </span>
                  {expiryInfo && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${expiryInfo.className}`}
                      title={`শুরু: ${shop.subscriptionStartDate ? new Date(shop.subscriptionStartDate).toLocaleDateString("en-GB") : "—"} · মেয়াদকাল: ${shop.subscriptionDays || "—"} দিন · শেষ: ${new Date(shop.planExpiresAt).toLocaleDateString("en-GB")}`}
                    >
                      {expiryInfo.label}
                    </span>
                  )}
                </div>

                {shop.domain ? (
                  <div className={`flex items-start gap-1.5 text-sm ${domainInfo.className}`}>
                    <DomainIcon size={15} className="shrink-0 mt-0.5" />
                    <span className="flex-1">{domainInfo.label}</span>
                    <button
                      onClick={() => handleVerifyDomain(shop)}
                      disabled={verifyingId === shop._id}
                      title="আবার চেক করুন"
                      className="shrink-0 mt-0.5 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <RefreshCw
                        size={14}
                        className={verifyingId === shop._id ? "animate-spin" : ""}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
                    <Globe size={15} />
                    কাস্টম ডোমেইন নেই — শপের নিজস্ব লিংক দিয়ে চলছে
                  </div>
                )}

                {shop.status === "suspended" && (
                  <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-300">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
                      Suspension reason
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words font-medium">
                      {shop.suspendedReason || "কারণ উল্লেখ করা হয়নি।"}
                    </p>
                  </div>
                )}

                {(() => {
                  const productCount = shop.stats?.products ?? 0;
                  const maxProducts = shop.limits?.maxProducts;
                  const isOverLimit = maxProducts != null && productCount > maxProducts;
                  return isOverLimit ? (
                    <div
                      className="flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400"
                      title="ডাউনগ্রেডের ফলে পুরনো প্রোডাক্ট অক্ষত আছে, কিন্তু নতুন প্রোডাক্ট যোগ করা যাবে না যতক্ষণ না লিমিটের নিচে আনা হয়"
                    >
                      <AlertTriangle size={13} className="shrink-0" />
                      Product limit ছাড়িয়ে গেছে ({productCount}/{maxProducts})
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 dark:bg-slate-800 rounded-lg py-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <Package size={14} className="text-gray-500 dark:text-slate-400" />
                    <b
                      className={
                        shop.limits?.maxProducts != null &&
                        (shop.stats?.products ?? 0) > shop.limits.maxProducts
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-900 dark:text-slate-100"
                      }
                    >
                      {shop.stats?.products ?? 0}
                      {shop.limits?.maxProducts != null && (
                        <span className="font-normal text-gray-400 dark:text-slate-500">
                          /{shop.limits.maxProducts}
                        </span>
                      )}
                    </b>
                    <span className="text-gray-500 dark:text-slate-400">Products</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <ShoppingCart size={14} className="text-gray-500 dark:text-slate-400" />
                    <b className="text-gray-900 dark:text-slate-100">{shop.stats?.orders ?? 0}</b>
                    <span className="text-gray-500 dark:text-slate-400">Orders</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Users size={14} className="text-gray-500 dark:text-slate-400" />
                    <b className="text-gray-900 dark:text-slate-100">{shop.stats?.admins ?? 0}</b>
                    <span className="text-gray-500 dark:text-slate-400">Admins</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => openAdminsModal(shop)}
                    className="flex-1 flex items-center justify-center gap-1 bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded text-sm hover:bg-rose-200 dark:hover:bg-rose-500/25"
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
                  ) : shop.status === "trial" ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => confirmSuspend(shop)}
                        title="Suspend"
                        className="flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1.5 rounded text-sm hover:bg-red-700"
                      >
                        <ShieldBan size={14} />
                      </button>
                      <button
                        onClick={() => handleActivate(shop)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1.5 rounded text-sm hover:bg-green-700"
                      >
                        <ShieldCheck size={14} /> Active করুন
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmSuspend(shop)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                    >
                      <ShieldBan size={14} /> Suspend
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal(shop)}
                    className="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded text-sm hover:bg-red-100 dark:hover:bg-red-500/20"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl dark:shadow-black/40 border border-gray-200 dark:border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {editingShop ? "শপ এডিট করুন" : "নতুন শপ তৈরি করুন"}
              </h2>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">শপের নাম <span className="text-red-600">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      // যতক্ষণ ইউজার নিজে slug হাতে না বদলাচ্ছে, ততক্ষণ নাম থেকে অটো-সাজেস্ট হবে
                      slug: slugEdited ? f.slug : slugify(name),
                    }));
                    if (name.trim()) setShopErrors((prev) => ({ ...prev, name: false }));
                    if (!slugEdited && slugify(name)) {
                      setShopErrors((prev) => ({ ...prev, slug: false }));
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${shopErrors.name ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                  placeholder="Cartvan Fashion"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Slug <span className="text-red-600">*</span></label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    const slug = slugify(e.target.value);
                    setForm((f) => ({ ...f, slug }));
                    if (slug) setShopErrors((prev) => ({ ...prev, slug: false }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none font-mono text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${shopErrors.slug ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                  placeholder="cartvan-fashion"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  শপের নিজস্ব লিংকে ব্যবহার হবে: /shop/{form.slug || "..."} — শুধু ছোট হাতের অক্ষর, সংখ্যা, হাইফেন
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">কাস্টম ডোমেইন <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span></label>
                <input
                  value={form.domain}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, domain: e.target.value }));
                    if (e.target.value.trim()) setShopErrors((prev) => ({ ...prev, domain: false }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${shopErrors.domain ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                  placeholder="shop1.com"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  https://, www. লাগবে না — শুধু ডোমেইন নেম (যেমন: shop1.com)। খালি রাখলে শপ platform-এর নিজস্ব লিংক (/shop/slug) দিয়ে চলবে, পরে যেকোনো সময় কাস্টম ডোমেইন যোগ করা যাবে।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Contact Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, contactEmail: e.target.value }));
                      if (!e.target.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                        setShopErrors((prev) => ({ ...prev, contactEmail: false }));
                      }
                    }}
                    className={`w-full border rounded-lg px-3 py-2 mt-1 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${shopErrors.contactEmail ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Contact Phone</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 mt-1"
                >
                  {plans.map((plan) => (
                    <option key={plan.key} value={plan.key}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">সাবস্ক্রিপশন শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={form.subscriptionStartDate}
                    onChange={(e) => setForm((f) => ({ ...f, subscriptionStartDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 mt-1"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    নতুন শপে আজকের তারিখ অটো বসে। যেসব শপের সাবস্ক্রিপশন আগে থেকেই চলছিল, তাদের আসল শুরুর তারিখ এখানে বসান।
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">মেয়াদকাল</label>
                  <select
                    value={form.durationPreset}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, durationPreset: e.target.value }));
                      setShopErrors((prev) => ({ ...prev, customDays: false }));
                    }}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 mt-1"
                  >
                    {DURATION_PRESETS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {form.durationPreset === "custom" && (
                    <input
                      type="number"
                      min="1"
                      value={form.customDays}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, customDays: e.target.value }));
                        if (Number(e.target.value) > 0) setShopErrors((prev) => ({ ...prev, customDays: false }));
                      }}
                      placeholder="দিনের সংখ্যা লিখুন, যেমন: 45"
                      className={`w-full border rounded-lg px-3 py-2 mt-2 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${shopErrors.customDays ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                    />
                  )}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    মেয়াদ শেষ হলে শপ স্বয়ংক্রিয়ভাবে সাসপেন্ড হয়ে যাবে। "মেয়াদ নেই" রাখলে কখনো auto-suspend হবে না।
                  </p>
                </div>

                {(() => {
                  const preview = previewExpiryDate(form);
                  return preview ? (
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      মেয়াদ শেষ হবে: {preview.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Theme override</label>
                <select
                  value={form.theme}
                  onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 mt-1"
                >
                  <option value="">Plan অনুযায়ী default</option>
                  {themes.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  খালি রাখলে Themes পেজে ঠিক করা plan-এর default theme ব্যবহার হবে।
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-60"
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
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl dark:shadow-black/40 border border-gray-200 dark:border-slate-700 w-full max-w-sm">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">⚠ শপ সাসপেন্ড করবেন?</h2>
              <p className="mb-3 text-gray-700 dark:text-slate-300">
                <b>{suspendModal.name}</b> সাসপেন্ড করলে এই শপের কাস্টমার-ফেসিং সাইট বন্ধ হয়ে যাবে।
              </p>
              <textarea
                value={suspendReason}
                onChange={(e) => {
                  setSuspendReason(e.target.value);
                  if (e.target.value.trim()) setSuspendReasonError(false);
                }}
                placeholder="কেন শপটি সাসপেন্ড করা হচ্ছে লিখুন"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                  suspendReasonError
                    ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20"
                    : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/20"
                }`}
                rows={3}
              />
              {suspendReasonError && (
                <p className="mb-4 mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  সাসপেন্ড করার কারণ লিখতে হবে।
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSuspendModal(null);
                    setSuspendReason("");
                    setSuspendReasonError(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  সাসপেন্ড করুন
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE SHOP CONFIRM MODAL */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl dark:shadow-black/40 border border-gray-200 dark:border-slate-700 w-full max-w-sm">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
                🗑️ Shop Trash-এ পাঠাবেন?
              </h2>
              <p className="text-gray-700 dark:text-slate-300 mb-3">
                <b>{deleteModal.name}</b> এখনই active shop list থেকে সরানো হবে।
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                ৩ দিনের মধ্যে Shop Trash থেকে Restore করা যাবে। কোনো action না নিলে Shop এবং এর সব data permanently delete হবে।
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={deletingShop}
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg disabled:opacity-60"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={deletingShop}
                  onClick={handleDeleteShop}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingShop ? "Trash-এ পাঠানো হচ্ছে..." : "Trash-এ পাঠান"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADMINS MANAGEMENT MODAL */}
      {adminsModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" onClick={closeAdminsModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl dark:shadow-black/40 border border-gray-200 dark:border-slate-700 w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <UserPlus size={18} /> {adminsModal.name} — Admins
                </h2>
                <button onClick={closeAdminsModal} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Existing admins list */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">
                    বর্তমানে assign করা আছে
                  </h3>
                  {adminsLoading ? (
                    <div className="text-sm text-gray-500 dark:text-slate-400">লোড হচ্ছে...</div>
                  ) : shopAdmins.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      এই শপে এখনো কোনো admin assign করা হয়নি।
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shopAdmins.map((a) => (
                        <div
                          key={a._id}
                          className="flex items-center justify-between border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2"
                        >
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-slate-100">{a.name}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {a.email} · <span className="capitalize">{a.role}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAdmin(a._id)}
                            title="এই শপ থেকে unassign করুন"
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite / assign form */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">
                    নতুন Admin যোগ করুন
                  </h3>
                  <form onSubmit={handleInviteAdmin} className="space-y-3" noValidate>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">ইমেইল <span className="text-red-600">*</span></label>
                      <input
                        type="email"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        value={adminForm.email}
                        onChange={(e) => {
                          setAdminForm((f) => ({ ...f, email: e.target.value }));
                          if (e.target.value.trim()) setAdminErrors((prev) => ({ ...prev, email: false }));
                        }}
                        className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${adminErrors.email ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">নাম <span className="text-red-600">*</span></label>
                      <input
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        value={adminForm.name}
                        onChange={(e) => {
                          setAdminForm((f) => ({ ...f, name: e.target.value }));
                          if (e.target.value.trim()) setAdminErrors((prev) => ({ ...prev, name: false }));
                        }}
                        className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${adminErrors.name ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">পাসওয়ার্ড <span className="text-red-600">*</span></label>
                      <div className="relative mt-1">
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={adminForm.password}
                          onChange={(e) => {
                            setAdminForm((f) => ({ ...f, password: e.target.value }));
                            if (e.target.value.length >= 6) setAdminErrors((prev) => ({ ...prev, password: false }));
                          }}
                          className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${adminErrors.password ? "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" : "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword((v) => !v)}
                          title={showAdminPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
                        >
                          {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">ভূমিকা <span className="text-red-600">*</span></label>
                      <select
                        value={adminForm.role}
                        onChange={(e) => setAdminForm((f) => ({ ...f, role: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                      >
                      <option value="admin">Admin (ফুল অ্যাক্সেস)</option>
                      <option value="staff">Staff (সীমিত)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={invitingAdmin}
                      className="w-full bg-rose-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
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
