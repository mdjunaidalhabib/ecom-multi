"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CircleAlert, Eye, EyeOff, ShieldCheck } from "lucide-react";

axios.defaults.withCredentials = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NOTICE_STORAGE_KEY = "shop_access_notice";

export default function LoginPortal({
  title,
  subtitle,
  endpoint,
  successPath,
  accent = "blue",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [suspensionNotice, setSuspensionNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const isViolet = accent === "violet";

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
            "লগইন করা যায়নি। আবার চেষ্টা করুন।",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br ${
        isViolet
          ? "from-slate-950 via-violet-950 to-slate-900"
          : "from-slate-100 via-white to-blue-100"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-7 sm:p-9 shadow-2xl border border-black/5"
      >
        <div className="mb-7 text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
              isViolet ? "bg-violet-600" : "bg-blue-600"
            }`}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {suspensionNotice && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 shrink-0 text-red-600" size={22} />
              <div className="min-w-0">
                <h2 className="font-bold text-red-700">Shop Suspended</h2>
                <p className="mt-1 text-sm font-medium">
                  {suspensionNotice?.suspension?.shopName || "আপনার শপ"} বর্তমানে
                  সাসপেন্ড করা হয়েছে।
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
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`mb-4 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:ring-2 ${
            isViolet ? "focus:ring-violet-400" : "focus:ring-blue-400"
          }`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative mb-5">
          <input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`w-full rounded-lg border border-gray-300 p-3 pr-11 outline-none transition focus:ring-2 ${
              isViolet ? "focus:ring-violet-400" : "focus:ring-blue-400"
            }`}
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
          className={`w-full rounded-lg py-3 font-semibold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-400 ${
            isViolet
              ? "bg-violet-600 hover:bg-violet-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
