"use client";

import { useEffect, useState } from "react";

/**
 * ✅ useAdminMe
 * `admin_token` cookie httpOnly (client-side জাভাস্ক্রিপ্ট থেকে পড়া যায় না),
 * তাই role/shops জানার জন্য সার্ভার থেকে সত্যিকারের /admin/me কল করা হয়
 * (cookie নিজে থেকেই fetch-এর সাথে যায়, credentials: same-origin দরকার নেই
 * কারণ এটা একই origin-এর /api/... proxy)
 */
export default function useAdminMe() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) throw new Error("not ok");
        const data = await res.json();
        if (active) setAdmin(data);
      } catch {
        if (active) setAdmin(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { admin, loading, isSuperAdmin: admin?.role === "superadmin" };
}
