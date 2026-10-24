"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Megaphone,
  Save,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import Toast from "../../../../components/Toast";
import RequireFeature from "../../../../components/RequireFeature";

// ✅ GTM container ID ফরম্যাট — backend (controllers/shop/tracking.admin.controller.js)
// এর সাথে একই নিয়ম। ইউজার পুরো GTM snippet পেস্ট করলেও ভেতর থেকে ID বের করে নেয়।
const GTM_ID_REGEX = /^GTM-[A-Z0-9]{4,12}$/;

function extractGtmId(raw) {
  const input = String(raw || "").trim().toUpperCase();
  if (!input) return "";
  const match = input.match(/GTM-[A-Z0-9]{4,12}/);
  return match ? match[0] : null;
}

const STEPS = [
  {
    title: "Google Tag Manager খুলুন",
    body: "tagmanager.google.com এ লগইন করে আপনার Container সিলেক্ট করুন (না থাকলে নতুন Web container বানান)।",
  },
  {
    title: "Container ID কপি করুন",
    body: "ড্যাশবোর্ডের উপরে ডানদিকে GTM-XXXXXXX ফরম্যাটের ID দেখা যায় — সেটা কপি করুন।",
  },
  {
    title: "এখানে পেস্ট করে Save দিন",
    body: "শুধু ID দিলেই হবে। চাইলে পুরো GTM কোড পেস্ট করতে পারেন, সিস্টেম নিজেই ID বের করে নেবে।",
  },
  {
    title: "GTM এ Publish করুন",
    body: "Tag (যেমন Facebook Pixel, GA4) যোগ করে GTM এ Submit → Publish দিন। এরপর ল্যান্ডিং পেজে ট্র্যাকিং শুরু হবে।",
  },
];

function StatusPill({ connected }) {
  return connected ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
      <span className="h-2 w-2 rounded-full bg-gray-400" />
      Not connected
    </span>
  );
}

function TrackingContent() {
  const [savedId, setSavedId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/tracking", { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!alive) return;
        setSavedId(data.gtmId || "");
        setInput(data.gtmId || "");
      } catch {
        if (alive) setToast({ message: "সেটিংস লোড করা যায়নি", type: "error" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const parsed = useMemo(() => extractGtmId(input), [input]);
  const isEmpty = input.trim() === "";
  const isValid = parsed !== null && parsed !== "" && GTM_ID_REGEX.test(parsed);
  const isInvalid = !isEmpty && !isValid;
  const dirty = (parsed ?? "") !== savedId;
  const canSave = !saving && !loading && dirty && (isValid || isEmpty);

  const save = async (value) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tracking", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gtmId: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Save failed");
      setSavedId(data.gtmId || "");
      setInput(data.gtmId || "");
      setToast({
        message: data.gtmId ? "GTM সফলভাবে যুক্ত হয়েছে ✅" : "GTM সরিয়ে ফেলা হয়েছে",
        type: "success",
      });
    } catch (err) {
      setToast({ message: err.message || "সেভ করা যায়নি", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    save(isEmpty ? "" : parsed);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/50 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-500/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
              <Activity size={20} />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
                Tracking · Google Tag Manager
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                আপনার ল্যান্ডিং পেজে Facebook Pixel, GA4 ও অন্যান্য ট্যাগ চালান
              </p>
            </div>
          </div>
          {!loading && <StatusPill connected={!!savedId} />}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3"
        >
          <div>
            <label
              htmlFor="gtm-id"
              className="text-sm font-semibold text-gray-900 dark:text-slate-100"
            >
              GTM Container ID
            </label>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              ফরম্যাট: <span className="font-mono">GTM-XXXXXXX</span>
            </p>

            <div className="relative mt-3">
              <input
                id="gtm-id"
                type="text"
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                placeholder="GTM-ABC1234"
                autoComplete="off"
                spellCheck={false}
                className={`w-full rounded-xl border bg-white py-3 pl-4 pr-11 font-mono text-sm tracking-wide text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${
                  isInvalid
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200 dark:border-red-500/50 dark:focus:ring-red-500/20"
                    : isValid
                      ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-200 dark:border-emerald-500/40 dark:focus:ring-emerald-500/20"
                      : "border-gray-300 focus:border-sky-400 focus:ring-sky-200 dark:border-slate-600 dark:focus:ring-sky-500/20"
                }`}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                {isValid && <CheckCircle2 size={18} className="text-emerald-500" />}
                {isInvalid && <AlertCircle size={18} className="text-red-500" />}
              </span>
            </div>

            {isInvalid && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                সঠিক ID দিন — যেমন GTM-ABC1234 (অক্ষর ও সংখ্যা, মোট ৪–১২টি)।
              </p>
            )}
            {isValid && parsed !== input.trim().toUpperCase() && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                পেস্ট করা কোড থেকে ID পাওয়া গেছে:{" "}
                <span className="font-mono font-semibold">{parsed}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            {savedId ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => save("")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 size={15} />
                GTM সরিয়ে ফেলুন
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
          </div>
        </form>

        {/* Side info */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <Megaphone size={15} className="text-sky-500" />
              কোথায় কাজ করবে
            </h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-slate-400">
              <li className="flex gap-2">
                <BadgeCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                আপনার শপের সব Landing Page এ (<span className="font-mono">/lp/...</span>)
              </li>
              <li className="flex gap-2">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                শুধু আপনার শপে — অন্য কোনো শপের সাথে মিশবে না
              </li>
              <li className="flex gap-2">
                <Zap size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                পেজ লোড ধীর করে না (অ্যাসিঙ্ক্রোনাসলি লোড হয়)
              </li>
            </ul>
            <Link
              href="/admin/landing-pages"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              Landing Pages দেখুন <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          কীভাবে সেটআপ করবেন
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-sky-600 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:ring-sky-500/30">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-2 rounded-xl bg-sky-50/70 p-3.5 text-xs text-sky-900 ring-1 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/20 sm:flex-row sm:items-center sm:justify-between">
          <span>
            ঠিকমতো কাজ করছে কিনা যাচাই করতে GTM এর <b>Preview</b> মোডে আপনার
            Landing Page এর লিংক দিন।
          </span>
          <a
            href="https://tagassistant.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-sky-700 hover:underline dark:text-sky-300"
          >
            Tag Assistant <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <RequireFeature feature="landingPages">
      <TrackingContent />
    </RequireFeature>
  );
}
