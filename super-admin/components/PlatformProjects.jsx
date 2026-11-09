"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Toast from "./Toast";

const endpoint = "/api/admin/platform-projects";

export default function PlatformProjects() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);
    (async () => {
      try {
        const res = await fetch(endpoint, { credentials: "include", signal: controller.signal });
        if (!res.ok) throw new Error("লিংক লোড করা যায়নি");
        const data = await res.json();
        if (!controller.signal.aborted) setUrl(data.projectPageUrl || "");
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(true);
          setToast({ message: error.message, type: "error" });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reload]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectPageUrl: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "সেভ করা যায়নি");
      setUrl(data.projectPageUrl);
      setToast({ message: "লিংক সেভ হয়েছে। ১ মিনিটের মধ্যে ল্যান্ডিং পেজে কার্যকর হবে।", type: "success" });
    } catch (error) {
      setToast({ message: error.message || "সেভ করা যায়নি", type: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ECMS Projects</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Hero-র “আমাদের প্রজেক্ট দেখুন” বাটন থেকে Hikmah IT-এর প্রজেক্ট পেজ খুলবে।</p>
      </div>
      {loading ? <p role="status">লোড হচ্ছে...</p> : loadError ? (
        <div role="alert" className="rounded-xl border border-rose-200 p-5">
          <p>লিংক লোড করা যায়নি।</p>
          <button type="button" onClick={() => setReload(value => value + 1)} className="mt-3 font-semibold text-rose-600">আবার চেষ্টা করুন</button>
        </div>
      ) : (
        <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <label htmlFor="project-page-url" className="text-sm font-medium text-gray-700 dark:text-slate-300">প্রজেক্ট পেজের লিংক</label>
          <input id="project-page-url" type="url" value={url} maxLength={2048} disabled={saving} onChange={event => setUrl(event.target.value)} placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
          <p className="mt-2 text-xs text-gray-500">Hikmah IT-এর তৈরি প্রজেক্ট পেজের সম্পূর্ণ http/https লিংক দিন। খালি রাখলে বাটন দেখাবে না।</p>
          <button type="submit" disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"><Save size={17} />{saving ? "সেভ হচ্ছে..." : "সেভ করুন"}</button>
        </form>
      )}
    </div>
  );
}
