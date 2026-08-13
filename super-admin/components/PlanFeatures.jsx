"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import Toast from "./Toast";

const PLAN_LABELS = { free: "Free", starter: "Starter", pro: "Pro" };
const PLANS = ["free", "starter", "pro"];

const TOGGLE_FEATURES = [
  { key: "customDomain", label: "Custom Domain", description: "শপ নিজের কাস্টম ডোমেইন সেট করতে পারবে" },
  { key: "analytics", label: "Analytics", description: "Admin panel-এ Visitor Analytics ড্যাশবোর্ড দেখা যাবে" },
  { key: "promo", label: "Promo/Coupon", description: "Admin panel-এ Promo code তৈরি/ম্যানেজ করা যাবে" },
];

const LIMIT_FEATURES = [
  { key: "maxProducts", label: "সর্বোচ্চ Products" },
  { key: "maxAdmins", label: "সর্বোচ্চ Admin/Staff" },
];

export default function PlanFeatures() {
  const [planFeatures, setPlanFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch("/api/admin/plan-features")
      .then((res) => res.json())
      .then((data) => setPlanFeatures(data.planFeatures))
      .catch(() => setToast({ message: "Plan features লোড করা যায়নি", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (plan, key) => {
    setPlanFeatures((prev) => ({
      ...prev,
      [plan]: { ...prev[plan], [key]: !prev[plan]?.[key] },
    }));
  };

  const handleNumberChange = (plan, key, value) => {
    setPlanFeatures((prev) => ({
      ...prev,
      [plan]: { ...prev[plan], [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/plan-features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planFeatures }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "save failed");
      setPlanFeatures(data.planFeatures);
      setToast({ message: "Plan features সেভ হয়েছে", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "সেভ করা যায়নি, আবার চেষ্টা করুন", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">লোড হচ্ছে...</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-1">Plan Features</h1>
      <p className="text-sm text-gray-500 mb-6">
        প্রতিটা plan কি কি ফিচার/লিমিট পাবে সেটা এখান থেকে নিয়ন্ত্রণ করুন। এখানে
        বদলালে শুধু নতুন শপ তৈরি হলে ডিফল্ট limits সেটাই বসবে এবং toggle ফিচারগুলো
        (Custom Domain/Analytics/Promo) সব শপে সাথে সাথে effect হবে — আগে থেকে
        থাকা শপের maxProducts/maxAdmins বদলাতে হলে সেই শপের এডিট ফর্মে গিয়ে
        করতে হবে (Shops পেজ)।
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium">Feature</th>
              {PLANS.map((plan) => (
                <th key={plan} className="px-4 py-3 font-medium">
                  {PLAN_LABELS[plan]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TOGGLE_FEATURES.map((feature) => (
              <tr key={feature.key}>
                <td className="px-4 py-3">
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </td>
                {PLANS.map((plan) => (
                  <td key={plan} className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={!!planFeatures?.[plan]?.[feature.key]}
                      onChange={() => handleToggle(plan, feature.key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {LIMIT_FEATURES.map((feature) => (
              <tr key={feature.key}>
                <td className="px-4 py-3 font-medium">{feature.label}</td>
                {PLANS.map((plan) => (
                  <td key={plan} className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      className="w-24 border border-gray-300 rounded-lg px-2 py-1"
                      value={planFeatures?.[plan]?.[feature.key] ?? 0}
                      onChange={(e) => handleNumberChange(plan, feature.key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} isLoading={saving}>
          সেভ করুন
        </Button>
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
