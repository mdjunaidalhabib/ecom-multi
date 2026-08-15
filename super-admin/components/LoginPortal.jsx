"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

axios.defaults.withCredentials = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NOTICE_STORAGE_KEY = "shop_access_notice";

const ACCENT_RGB = "225,29,72"; // rose-600

const softPanel = () =>
  `radial-gradient(circle at 15% 10%, rgba(${ACCENT_RGB},0.14), transparent 45%), ` +
  `radial-gradient(circle at 90% 85%, rgba(${ACCENT_RGB},0.12), transparent 45%), ` +
  `linear-gradient(160deg, #ffffff 0%, #fff5f6 45%, rgba(${ACCENT_RGB},0.08) 100%)`;

const FEATURES = [
  { icon: ShieldCheck, label: "পুরো প্ল্যাটফর্মের নিরাপদ নিয়ন্ত্রণ" },
  { icon: Store, label: "সব শপ ও অ্যাডমিন এক জায়গায় পরিচালনা" },
  { icon: Sparkles, label: "রিয়েল-টাইম মনিটরিং ও ইনসাইট" },
];

const ORBIT_ICONS = [
  { icon: Store, className: "left-0 top-2" },
  { icon: Users, className: "right-0 top-8" },
  { icon: Sparkles, className: "bottom-6 left-6" },
  { icon: ShieldCheck, className: "bottom-0 right-8" },
];

export default function LoginPortal({ title, subtitle, endpoint, successPath }) {
  const panelBg = softPanel();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [suspensionNotice, setSuspensionNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedNotice = sessionStorage.getItem(NOTICE_STORAGE_KEY);
      if (!storedNotice) return;

      const parsedNotice = JSON.parse(storedNotice);
      if (parsedNotice?.errorType === "SHOP_SUSPENDED") {
        setSuspensionNotice(parsedNotice);
      }

      sessionStorage.removeItem(NOTICE_STORAGE_KEY);
    } catch {
      try {
        sessionStorage.removeItem(NOTICE_STORAGE_KEY);
      } catch {
        // Ignore unavailable browser storage.
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(
        endpoint,
        { email, password },
        { withCredentials: true },
      );

      // নতুন httpOnly cookie-সহ fresh request নিশ্চিত করা।
      await sleep(150);
      window.location.replace(successPath);
    } catch (err) {
      const responseData = err?.response?.data;

      if (responseData?.errorType === "SHOP_SUSPENDED") {
        setError("");
        setSuspensionNotice(responseData);
      } else {
        setSuspensionNotice(null);
        setError(
          responseData?.message ||
            err?.message ||
            "লগইন করা যায়নি। আবার চেষ্টা করুন।",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen bg-slate-50">
      {/* Left brand panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-slate-900 lg:flex"
        style={{ background: panelBg }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(15,23,42,0.05) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md shadow-slate-900/5">
            <ShieldCheck size={22} className="text-rose-600" />
          </div>
          <span className="text-lg font-semibold tracking-wide text-slate-800">
            Super Admin Portal
          </span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug text-slate-900">
            পুরো প্ল্যাটফর্ম, একই ড্যাশবোর্ডে।
          </h2>
          <p className="mt-3 max-w-sm text-sm text-slate-600">
            সব শপ, অ্যাডমিন ও কার্যক্রম এক জায়গা থেকে সহজে তদারকি ও
            নিয়ন্ত্রণ করুন।
          </p>

          {/* Decorative orbit illustration — brand mark, not real data */}
          <div className="relative mx-auto mt-10 h-56 w-56">
            <div
              className="absolute inset-0 rounded-full border border-dashed"
              style={{ borderColor: `rgba(${ACCENT_RGB},0.35)` }}
            />
            <div
              className="absolute -inset-8 rounded-full border border-dashed"
              style={{ borderColor: `rgba(${ACCENT_RGB},0.18)` }}
            />

            <div
              className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl"
              style={{ boxShadow: `0 20px 45px -15px rgba(${ACCENT_RGB},0.45)` }}
            >
              <ShieldCheck size={34} className="text-rose-600" />
            </div>

            {ORBIT_ICONS.map(({ icon: Icon, className }, index) => (
              <div
                key={index}
                className={`absolute flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg ${className}`}
              >
                <Icon size={18} className="text-rose-600" />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-700 shadow-sm backdrop-blur-sm"
              >
                <Icon size={13} className="text-rose-600" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Super Admin Portal. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg lg:hidden">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <CircleAlert className="mt-0.5 shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {suspensionNotice && (
            <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm">
              <div className="flex items-start gap-3">
                <CircleAlert
                  className="mt-0.5 shrink-0 text-red-600"
                  size={22}
                />
                <div className="min-w-0">
                  <h2 className="font-bold text-red-700">Shop Suspended</h2>
                  <p className="mt-1 text-sm font-medium">
                    {suspensionNotice?.suspension?.shopName || "আপনার শপ"}{" "}
                    বর্তমানে সাসপেন্ড করা হয়েছে।
                  </p>

                  <p className="mt-3 text-sm font-semibold text-red-700">
                    {suspensionNotice?.contactMessage ||
                      "অনুগ্রহ করে অতি দ্রুত Developer-এর সাথে যোগাযোগ করুন।"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative mb-4">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-3 pl-10 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mb-5">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-3 pl-10 pr-11 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 py-3 font-semibold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
