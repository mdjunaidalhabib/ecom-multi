"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import Toast from "./Toast";

const THEMES = [
  {
    key: "classic",
    name: "Classic",
    description: "বর্তমান ডিজাইন — pink accents, ক্লাসিক layout। Pro প্ল্যানের জন্য default।",
  },
  {
    key: "aurora",
    name: "Aurora",
    description: "পরিষ্কার/মিনিমাল লুক, লেয়ার্ড ব্যানার আর horizontal category rail।",
  },
  {
    key: "terra",
    name: "Terra",
    description: "উষ্ণ/সাধারণ গ্রিড লেআউট, দুই-ভাষা-বান্ধব প্রোডাক্ট কার্ড।",
  },
];

const PLAN_LABELS = { free: "Free", starter: "Starter", pro: "Pro" };

export default function ThemeSettings() {
  const [planThemeMap, setPlanThemeMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch("/api/admin/theme-settings")
      .then((res) => res.json())
      .then((data) => setPlanThemeMap(data.planThemeMap))
      .catch(() => setToast({ message: "Theme settings লোড করা যায়নি", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (plan, theme) => {
    setPlanThemeMap((prev) => ({ ...prev, [plan]: theme }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/theme-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planThemeMap }),
      });
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      setPlanThemeMap(data.planThemeMap);
      setToast({ message: "Theme mapping সেভ হয়েছে", type: "success" });
    } catch {
      setToast({ message: "সেভ করা যায়নি, আবার চেষ্টা করুন", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">লোড হচ্ছে...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">Storefront Themes</h1>
      <p className="text-sm text-gray-500 mb-6">
        প্রতিটা plan-এর জন্য default storefront theme নির্বাচন করুন। কোনো নির্দিষ্ট
        শপের জন্য এটা override করতে চাইলে সেই শপের এডিট ফর্মে গিয়ে করুন (Shops পেজ)।
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {THEMES.map((theme) => (
          <div key={theme.key} className="rounded-xl border border-gray-200 p-4">
            <h2 className="font-medium mb-1">{theme.name}</h2>
            <p className="text-xs text-gray-500">{theme.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        {["free", "starter", "pro"].map((plan) => (
          <div key={plan} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium w-24">{PLAN_LABELS[plan]} প্ল্যান</span>
            <select
              value={planThemeMap?.[plan] || "classic"}
              onChange={(e) => handleChange(plan, e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs"
            >
              {THEMES.map((theme) => (
                <option key={theme.key} value={theme.key}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="pt-2">
          <Button onClick={handleSave} isLoading={saving}>
            সেভ করুন
          </Button>
        </div>
      </div>

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
