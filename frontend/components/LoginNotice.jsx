"use client";

import { useEffect, useState } from "react";

// Google-এর consent স্ক্রিনে ইউজার "Cancel" চাপলে (বা OAuth যেকোনো কারণে
// fail করলে) backend তাকে ঠিক যে পেজ থেকে লগইন শুরু হয়েছিল সেখানেই
// ?login=cancelled / ?login=failed সহ ফেরত পাঠায় — দেখুন
// backend/src/routes/public/auth.routes.js এর buildAbortRedirect()।
// আগে ওখানে relative "/login" রিডাইরেক্ট হতো বলে ব্রাউজার ইউজারকে
// backend ডোমেইনে নিয়ে গিয়ে raw JSON error দেখাতো।
//
// এই কম্পোনেন্টের কাজ দুটো: ছোট একটা নোটিশ দেখানো, আর তারপর URL থেকে
// প্যারামটা মুছে ফেলা — যাতে রিফ্রেশ/শেয়ার করলে নোটিশ আবার না আসে।
// নিজের markup ব্যবহার করা হচ্ছে (react-hot-toast নয়), কারণ storefront
// লেআউটে কোনো global <Toaster /> মাউন্ট করা নেই।
const MESSAGES = {
  cancelled: "লগইন বাতিল করা হয়েছে।",
  failed: "লগইন সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।",
};

const AUTO_HIDE_MS = 5000;

export default function LoginNotice() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("login");
    if (!status) return;

    setMessage(MESSAGES[status] || MESSAGES.failed);

    // history entry না বাড়িয়ে শুধু URL পরিষ্কার করা হচ্ছে, যাতে Back
    // চাপলে ইউজার আবার একই নোটিশওয়ালা URL-এ ফিরে না আসে।
    url.searchParams.delete("login");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);

    const timer = setTimeout(() => setMessage(""), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
    >
      <div className="flex items-center gap-3 rounded-full bg-gray-900/95 px-5 py-2.5 text-sm text-white shadow-lg backdrop-blur">
        <span>{message}</span>
        <button
          type="button"
          onClick={() => setMessage("")}
          aria-label="বন্ধ করুন"
          className="-mr-1 rounded-full px-1.5 text-lg leading-none text-white/70 transition hover:text-white"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
