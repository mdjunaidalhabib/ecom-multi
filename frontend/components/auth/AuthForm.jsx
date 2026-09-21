"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import useShopPath from "../../hooks/useShopPath";
import useRequireFullStorefront from "../../hooks/useRequireFullStorefront";

// redirect param শুধু একই origin-এর path হতে পারবে (open-redirect ঠেকাতে) —
// পুরো URL, "//evil.com" বা "/login"-এ ফিরে আসার লুপ সব fallback-এ যাবে।
function safeRedirect(raw, fallback) {
  const value = raw || "";
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/^\/(shop\/[^/]+\/)?(login|signup)(\/|\?|$)/.test(value)) return fallback;
  return value;
}

const inputClass =
  "mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition " +
  "focus:border-[var(--theme-primary,#db2777)] focus:ring-2 focus:ring-[var(--theme-primary,#db2777)]/20 disabled:opacity-60";

/**
 * ✅ mode: "login" | "signup" — একই ফর্ম, দুই মোড।
 * সফল হলে Google flow-এর (app/auth/callback/page.jsx) মতোই token
 * localStorage-এ রেখে fetchMe() করে, তারপর ?redirect= এ ফেরত যায়।
 */
export default function AuthForm({ mode }) {
  useRequireFullStorefront();

  const isSignup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me, loadingUser, fetchMe } = useUser();
  const { base, shopSlug } = useShopPath();

  const homePath = base || "/";
  const redirect = safeRedirect(searchParams.get("redirect"), homePath);
  const redirectQuery = searchParams.get("redirect")
    ? `?redirect=${encodeURIComponent(redirect)}`
    : "";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // আগে থেকেই লগইন করা থাকলে এই পেজ দেখানোর মানে নেই
  useEffect(() => {
    if (!loadingUser && me) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, me]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleGoogle = () => {
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (isSignup && form.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setSubmitting(true);
    try {
      // path-based শপে /api কলের Referer-sniffing-এর উপর নির্ভর না করে slug explicit পাঠানো
      const extraHeaders = shopSlug ? { "x-shop-slug": shopSlug } : {};

      const res = await fetch(`/api/auth/${isSignup ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...extraHeaders },
        body: JSON.stringify(
          isSignup
            ? { name: form.name, email: form.email, password: form.password }
            : { email: form.email, password: form.password },
        ),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setError(data.error || data.message || "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("token", data.token);
      await fetchMe(data.token, extraHeaders);
      router.replace(redirect);
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isSignup ? "নতুন account খুলুন" : "Login করুন"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isSignup
            ? "অর্ডার ট্র্যাক করতে ও দ্রুত checkout করতে account খুলুন।"
            : "আপনার account-এ ঢুকে অর্ডার দেখুন ও checkout করুন।"}
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
        >
          <FaGoogle className="text-[#db4437]" />
          Google দিয়ে {isSignup ? "Sign up" : "Login"}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-200" />
          অথবা ইমেইল দিয়ে
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
          {isSignup && (
            <div>
              <label htmlFor="auth-name" className="text-xs font-medium text-gray-700">
                আপনার নাম
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                required
                maxLength={80}
                value={form.name}
                onChange={set("name")}
                disabled={submitting}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="text-xs font-medium text-gray-700">
              ইমেইল
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={set("email")}
              disabled={submitting}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="text-xs font-medium text-gray-700">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={isSignup ? 6 : undefined}
                maxLength={72}
                value={form.password}
                onChange={set("password")}
                disabled={submitting}
                className={`${inputClass} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 mt-1 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                {showPassword ? "লুকান" : "দেখুন"}
              </button>
            </div>
            {isSignup && (
              <p className="mt-1 text-xs text-gray-500">কমপক্ষে ৬ অক্ষর।</p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--theme-primary,#db2777)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "অপেক্ষা করুন..." : isSignup ? "Sign up" : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          {isSignup ? "আগেই account আছে?" : "নতুন কাস্টমার?"}{" "}
          <Link
            href={`${base}/${isSignup ? "login" : "signup"}${redirectQuery}`}
            className="font-medium text-[var(--theme-primary,#db2777)] hover:underline"
          >
            {isSignup ? "Login করুন" : "Account খুলুন"}
          </Link>
        </p>
      </div>
    </div>
  );
}
