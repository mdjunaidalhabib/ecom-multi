"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdmin } from "../../lib/auth";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    (async () => {
      const admin = await getAdmin();
      if (!active) return;

      if (admin?.role === "superadmin") {
        router.replace("/super-admin/dashboard");
      } else if (admin) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/login");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 font-medium text-gray-600">Loading portal...</p>
      </div>
    </div>
  );
}
