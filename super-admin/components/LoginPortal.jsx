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
} from "lucide-react";

axios.defaults.withCredentials = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NOTICE_STORAGE_KEY = "shop_access_notice";

const FEATURES = [
  { icon: ShieldCheck, label: "পুরো প্ল্যাটফর্মের নিরাপদ নিয়ন্ত্রণ" },
  { icon: Store, label: "সব শপ ও অ্যাডমিন এক জায়গায় পরিচালনা" },
  { icon: Sparkles, label: "রিয়েল-টাইম মনিটরিং ও ইনসাইট" },
];

export default function LoginPortal({ title, subtitle, endpoint, successPath }) {
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
    <main className="flex min-h-screen bg-slate-50">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-200 bg-gradient-to-br from-orange-50 via-white to-slate-50 p-12 lg:flex">
        <div className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-[#f75605]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#f75605]/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #f7560522 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f75605] shadow-sm shadow-[#f75605]/30">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-wide text-slate-800">
            Super Admin Portal
          </span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug text-slate-900">
            পুরো প্ল্যাটফর্ম, একই ড্যাশবোর্ডে।
          </h2>
          <p className="mt-3 max-w-sm text-sm text-slate-500">
            সব শপ, অ্যাডমিন ও কার্যক্রম এক জায়গা থেকে সহজে তদারকি ও
            নিয়ন্ত্রণ করুন।
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f75605]/10 text-[#f75605]">
                  <Icon size={16} />
                </span>
                <span className="text-slate-700">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-400">
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
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f75605] text-white shadow-lg lg:hidden"
            >
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
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 outline-none transition focus:border-[#f75605] focus:ring-4 focus:ring-[#f75605]/20"
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
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 pr-11 outline-none transition focus:border-[#f75605] focus:ring-4 focus:ring-[#f75605]/20"
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f75605] py-3 font-semibold text-white shadow-md transition hover:bg-[#df4c02] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
