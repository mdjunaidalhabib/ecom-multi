"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Package, ShoppingCart, ShieldCheck, Users } from "lucide-react";

export default function SuperAdminDashboardPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/admin/shops", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Shop data load করা যায়নি");
        }

        const data = await response.json();
        if (active) setShops(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Shop data load করা যায়নি");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(
    () =>
      shops.reduce(
        (totals, shop) => {
          totals.products += Number(shop.stats?.products || 0);
          totals.orders += Number(shop.stats?.orders || 0);
          totals.admins += Number(shop.stats?.admins || 0);
          if (shop.status === "suspended") totals.suspended += 1;
          return totals;
        },
        { products: 0, orders: 0, admins: 0, suspended: 0 },
      ),
    [shops],
  );

  const cards = [
    { label: "Total Shops", value: shops.length, icon: Building2 },
    { label: "Shop Admins", value: summary.admins, icon: Users },
    { label: "Total Products", value: summary.products, icon: Package },
    { label: "Total Orders", value: summary.orders, icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldCheck size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Super Admin Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            সব shop, assigned admin এবং platform activity-এর সংক্ষিপ্ত চিত্র।
          </p>
        </div>

        <Link
          href="/shops"
          className="rounded-lg bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-rose-700"
        >
          Manage Shops
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-white dark:bg-slate-900 shadow" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-gray-100 dark:ring-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3 text-rose-700 dark:text-rose-400">
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-gray-100 dark:ring-slate-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Shop Status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Status label="Active / Trial" value={shops.length - summary.suspended} />
              <Status label="Suspended" value={summary.suspended} />
              <Status
                label="Verified Domains"
                value={shops.filter((shop) => shop.domainStatus === "verified").length}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Status({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4">
      <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
