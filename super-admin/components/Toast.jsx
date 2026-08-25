"use client";
import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  // ✅ warning টোস্ট সাধারণত লম্বা বার্তা বহন করে (যেমন over-limit সতর্কতা) —
  // পড়ার জন্য বেশি সময় দরকার, তাই বাকিগুলোর চেয়ে দীর্ঘ সময় ধরে দেখানো হয়
  useEffect(() => {
    const timer = setTimeout(onClose, type === "warning" ? 6000 : 2500);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  const color =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-amber-500"
      : "bg-blue-500";

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideUp animate-fadeIn max-w-md">
      <div
        className={`${color} text-white px-5 py-3 rounded-lg shadow-xl dark:shadow-black/40 text-sm font-medium flex items-center gap-2 ring-1 ring-black/5 dark:ring-white/10`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}
