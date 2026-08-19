"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../../../context/UserContext";
import { DOMAIN_MODE_MARKER } from "../../../../lib/shopMode";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchMe } = useUser();

  useEffect(() => {
    const token = searchParams.get("token");
    let redirect = searchParams.get("redirect") || "/";

    // ✅ Safety net: redirect যেন কখনো ভিন্ন origin এ না নিয়ে যায় —
    // তাহলে এই page যেই domain এ token সেভ করলো, router.replace সেই একই
    // domain এর মধ্যেই থাকবে, আর localStorage-এর token হারাবে না।
    if (/^https?:\/\//i.test(redirect)) {
      try {
        const parsed = new URL(redirect);
        redirect = parsed.pathname + parsed.search;
      } catch {
        redirect = "/";
      }
    }

    if (token) {
      // ✅ token localStorage এ save করো
      localStorage.setItem("token", token);

      // ✅ এই পেজের নিজের URL-এ /shop/<slug> prefix থাকে না (দেখুন
      // middleware.js), তাই path-based শপে /api/auth/me কল থেকে x-shop-slug
      // হারিয়ে যেত এবং backend ভুল শপ (localhost domain) দিয়ে resolve করতে
      // গিয়ে 404 দিত — token সাথে সাথেই মুছে "logged out" দেখাত। redirect
      // param-টা (যেটা মূল /shop/<slug>/... পেজের path, নিচে দেখুন) থেকেই
      // slug বের করে explicit header হিসেবে পাঠানো হচ্ছে।
      const slugMatch = redirect.match(/^\/shop\/([^/]+)/);
      const extraHeaders =
        slugMatch && slugMatch[1] !== DOMAIN_MODE_MARKER
          ? { "x-shop-slug": slugMatch[1] }
          : {};

      // ✅ fetchMe শেষ হওয়ার পর redirect করো (race condition fix)
      fetchMe(token, extraHeaders).then(() => {
        router.replace(redirect);
      });
    } else {
      router.replace("/");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-center text-gray-600">⏳ Logging in...</p>
    </div>
  );
}
