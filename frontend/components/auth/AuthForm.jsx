"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
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

// ⚠️ backend/src/routes/public/auth.routes.js-এর rule-এর সাথে মিল রাখতে হবে
// (backend-ই আসল গেট — এখানে শুধু আগেভাগে ইউজারকে দেখানোর জন্য)।
const PASSWORD_MIN = 8;
const BD_PHONE_RE = /^(?:\+?88)?(01[3-9]\d{8})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// নিচের প্রথম তিনটা বাধ্যতামূলক (backend-ও চেক করে); বাকিগুলো শক্তি বাড়ায়।
function getPasswordRules(pw) {
  return [
    { key: "len", label: `${PASSWORD_MIN}+ অক্ষর`, ok: pw.length >= PASSWORD_MIN, required: true },
    { key: "letter", label: "ইংরেজি অক্ষর", ok: /[A-Za-z]/.test(pw), required: true },
    { key: "digit", label: "সংখ্যা", ok: /\d/.test(pw), required: true },
    { key: "case", label: "বড় ও ছোট হাতের অক্ষর", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw), required: false },
    { key: "symbol", label: "চিহ্ন (@ # $ !)", ok: /[^A-Za-z0-9\s]/.test(pw), required: true },
    { key: "long", label: "১২+ অক্ষর", ok: pw.length >= 12, required: false },
  ];
}

function getPasswordStrength(pw) {
  const rules = getPasswordRules(pw);
  const requiredMet = rules.filter((r) => r.required).every((r) => r.ok);
  const bonus = rules.filter((r) => !r.required && r.ok).length;
  if (!pw || !requiredMet) return { level: 0, label: "দুর্বল", requiredMet, rules };
  if (bonus >= 1) return { level: 2, label: "শক্তিশালী", requiredMet, rules };
  return { level: 1, label: "মাঝারি", requiredMet, rules };
}

const STRENGTH_STYLE = [
  { bar: "bg-red-500", text: "text-red-600" },
  { bar: "bg-amber-500", text: "text-amber-600" },
  { bar: "bg-green-600", text: "text-green-700" },
];

const inputClass =
  "mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition " +
  "focus:border-[var(--theme-primary,#db2777)] focus:ring-2 focus:ring-[var(--theme-primary,#db2777)]/20 disabled:opacity-60";

// বাধ্যতামূলক ফিল্ডের লেবেলে লাল তারা (*)
function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-gray-700">
      {children}
      <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
    </label>
  );
}

function FieldError({ children }) {
  return children ? (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {children}
    </p>
  ) : null;
}

const errBorder = "border-red-500 focus:border-red-500 focus:ring-red-200";

function PasswordField({ id, label, value, onChange, onBlur, disabled, autoComplete, invalid, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-required="true"
          maxLength={72}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={`${inputClass} pr-11 ${invalid ? errBorder : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 mt-1 flex w-11 items-center justify-center text-gray-500 transition hover:text-gray-800"
        >
          {visible ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
        </button>
      </div>
      {children}
    </div>
  );
}

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

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const phoneValid = BD_PHONE_RE.test(form.phone.replace(/[\s-]/g, ""));
  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  // ✅ ফিল্ড খালি/ভুল হলে error তৈরি হয়; ইউজার ঠিকমতো লিখলেই এটা আপনাআপনি ফাঁকা
  // হয়ে যায় (লাল বর্ডার/মেসেজ মুছে যায়)। দেখানো হয় শুধু ফিল্ড ছুঁয়ে বের হলে
  // (blur) বা Submit চাপার পর — টাইপ শুরুর আগেই লাল হয়ে যায় না।
  const errors = {
    name: !form.name.trim() ? "আপনার নাম দিন" : "",
    email: !form.email.trim()
      ? "ইমেইল দিন"
      : !EMAIL_RE.test(form.email.trim())
        ? "সঠিক ইমেইল দিন"
        : "",
    phone: !form.phone.trim()
      ? "মোবাইল নম্বর দিন"
      : !phoneValid
        ? "সঠিক নম্বর দিন, যেমন 016********"
        : "",
    password: !form.password
      ? "পাসওয়ার্ড দিন"
      : isSignup && !strength.requiredMet
        ? "নিচের শর্তগুলো মিলিয়ে নিন"
        : "",
    confirmPassword: !form.confirmPassword
      ? "পাসওয়ার্ড আবার দিন"
      : mismatch
        ? "পাসওয়ার্ড মিলছে না"
        : "",
  };
  const activeFields = isSignup
    ? ["name", "email", "phone", "password", "confirmPassword"]
    : ["email", "password"];
  const shown = (k) =>
    touched[k] || submitted || (k === "confirmPassword" && mismatch) ? errors[k] : "";
  const touch = (k) => () => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

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
    setSubmitted(true);

    const firstInvalid = activeFields.find((k) => errors[k]);
    if (firstInvalid) {
      const ids = {
        name: "auth-name",
        email: "auth-email",
        phone: "auth-phone",
        password: "auth-password",
        confirmPassword: "auth-confirm-password",
      };
      document.getElementById(ids[firstInvalid])?.focus();
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
            ? {
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
              }
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

  const style = STRENGTH_STYLE[strength.level];

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

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {isSignup && (
            <div>
              <Label htmlFor="auth-name">আপনার নাম</Label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                aria-required="true"
                maxLength={80}
                value={form.name}
                onChange={set("name")}
                onBlur={touch("name")}
                disabled={submitting}
                aria-invalid={shown("name") ? true : undefined}
                className={`${inputClass} ${shown("name") ? errBorder : ""}`}
              />
              <FieldError>{shown("name")}</FieldError>
            </div>
          )}

          <div>
            <Label htmlFor="auth-email">ইমেইল</Label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              value={form.email}
              onChange={set("email")}
              onBlur={touch("email")}
              disabled={submitting}
              aria-invalid={shown("email") ? true : undefined}
              className={`${inputClass} ${shown("email") ? errBorder : ""}`}
            />
            <FieldError>{shown("email")}</FieldError>
          </div>

          {isSignup && (
            <div>
              <Label htmlFor="auth-phone">মোবাইল নম্বর</Label>
              <input
                id="auth-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="016********"
                aria-required="true"
                maxLength={16}
                value={form.phone}
                onChange={set("phone")}
                onBlur={touch("phone")}
                disabled={submitting}
                aria-invalid={shown("phone") ? true : undefined}
                className={`${inputClass} ${shown("phone") ? errBorder : ""}`}
              />
              <FieldError>{shown("phone")}</FieldError>
            </div>
          )}

          <PasswordField
            id="auth-password"
            label="পাসওয়ার্ড"
            value={form.password}
            onChange={set("password")}
            onBlur={touch("password")}
            disabled={submitting}
            autoComplete={isSignup ? "new-password" : "current-password"}
            invalid={!!shown("password")}
          >
            {/* সাইন-আপে লিখতে শুরু করলে নিচের ছোট শর্ত-লাইনই বলে দেয় কী বাকি — আলাদা error লাগে না */}
            {(!isSignup || !form.password) && <FieldError>{shown("password")}</FieldError>}
            {isSignup && form.password.length > 0 && (
              <div className="mt-2" aria-live="polite">
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= strength.level ? style.bar : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${style.text}`}>{strength.label}</span>
                </div>
                <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs">
                  {strength.rules
                    .filter((r) => r.required)
                    .map((r) => (
                      <span
                        key={r.key}
                        className={
                          r.ok
                            ? "text-green-700"
                            : touched.password || submitted
                              ? "text-red-600"
                              : "text-gray-500"
                        }
                      >
                        {r.ok ? "✓" : "•"} {r.label}
                      </span>
                    ))}
                </p>
              </div>
            )}
          </PasswordField>

          {isSignup && (
            <PasswordField
              id="auth-confirm-password"
              label="পাসওয়ার্ড আবার দিন"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              onBlur={touch("confirmPassword")}
              disabled={submitting}
              autoComplete="new-password"
              invalid={!!shown("confirmPassword")}
            >
              <FieldError>{shown("confirmPassword")}</FieldError>
              {form.confirmPassword.length > 0 && !mismatch && (
                <p className="mt-1 text-xs text-green-700" aria-live="polite">
                  ✓ পাসওয়ার্ড মিলেছে
                </p>
              )}
            </PasswordField>
          )}

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

        <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-200" />
          অথবা
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
        >
          <FaGoogle className="text-[#db4437]" />
          Google দিয়ে {isSignup ? "Sign up" : "Login"}
        </button>

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
