"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import DashboardSkeleton from "../../../../components/Skeleton/DashboardSkeleton.jsx";
import {
  STATUS_LABEL,
  STATUS_BADGE_COLOR,
} from "../../../../components/orders/shared/constants.js";

// ✅ status অনুযায়ী hex color — donut chart-এ Recharts Cell fill এর জন্য
// (STATUS_BADGE_COLOR এর tailwind ক্লাসের সাথে hue মিলিয়ে বানানো)
const STATUS_HEX = {
  pending: "#f59e0b",
  ready_to_delivery: "#3b82f6",
  send_to_courier: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function GrowthBadge({ value }) {
  if (value === null || !Number.isFinite(value)) return null;
  const isUp = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
        isUp ? "bg-white/25 text-white" : "bg-black/20 text-white"
      }`}
    >
      {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function DashboardPage() {
  const API = "/api";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ FIXED status list (schema enum অনুযায়ী)
  const ORDER_STATUSES = [
    "pending",
    "ready_to_delivery",
    "send_to_courier",
    "delivered",
    "cancelled",
  ];

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
  });

  // ✅ Online vs Offline breakdown
  const [channelStats, setChannelStats] = useState({
    online: { orders: 0, sales: 0 },
    offline: { orders: 0, sales: 0 },
  });

  // ✅ status stats (সব status থাকবে, না থাকলে 0)
  const [statusStats, setStatusStats] = useState(() =>
    ORDER_STATUSES.reduce((acc, st) => {
      acc[st] = 0;
      return acc;
    }, {})
  );

  useEffect(() => {
    async function fetchOrders() {
      try {
        setErr("");
        setLoading(true);

        const res = await fetch(`${API}/admin/orders?limit=5000`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Orders fetch failed");

        const json = await res.json();
        const data = Array.isArray(json?.orders) ? json.orders : [];

        if (data.length) {
          setOrders(data);

          // ✅ Total Orders + Sales
          const totalOrders = data.length;
          const totalSales = data.reduce((sum, o) => sum + (o.total || 0), 0);
          setStats({ totalOrders, totalSales });

          // ✅ status count (fixed enum list)
          const statusMap = ORDER_STATUSES.reduce((acc, st) => {
            acc[st] = 0;
            return acc;
          }, {});

          data.forEach((order) => {
            const st = order.status || "pending";
            if (statusMap[st] !== undefined) statusMap[st] += 1;
          });

          setStatusStats(statusMap);

          // ✅ Online vs Offline breakdown
          const channelMap = {
            online: { orders: 0, sales: 0 },
            offline: { orders: 0, sales: 0 },
          };
          data.forEach((order) => {
            const ch = order.saleChannel === "offline" ? "offline" : "online";
            channelMap[ch].orders += 1;
            channelMap[ch].sales += order.total || 0;
          });
          setChannelStats(channelMap);
        } else {
          setOrders([]);
          setStats({ totalOrders: 0, totalSales: 0 });
          setStatusStats(
            ORDER_STATUSES.reduce((acc, st) => {
              acc[st] = 0;
              return acc;
            }, {})
          );
          setChannelStats({
            online: { orders: 0, sales: 0 },
            offline: { orders: 0, sales: 0 },
          });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setErr("❌ Orders load করা যায়নি");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [API]);

  // ====== Top Products ======
  const topProducts = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      o.items?.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = { name: it.name, qty: 0, revenue: 0 };
        }
        map[it.productId].qty += it.qty;
        map[it.productId].revenue += (it.price || 0) * (it.qty || 0);
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  // ====== Monthly Sales ======
  const monthlySales = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (map[key] !== undefined) map[key] += o.total || 0;
    });
    return Object.entries(map).map(([month, sales]) => ({ month, sales }));
  }, [orders]);

  // ====== This Month vs Last Month (growth %) ======
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const keyOf = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthKey = keyOf(now);
    const lastMonthKey = keyOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    let thisMonthSales = 0;
    let thisMonthOrders = 0;
    let lastMonthSales = 0;
    let lastMonthOrders = 0;

    orders.forEach((o) => {
      const key = keyOf(new Date(o.createdAt));
      if (key === thisMonthKey) {
        thisMonthSales += o.total || 0;
        thisMonthOrders += 1;
      } else if (key === lastMonthKey) {
        lastMonthSales += o.total || 0;
        lastMonthOrders += 1;
      }
    });

    const growth = (curr, prev) => {
      if (prev > 0) return ((curr - prev) / prev) * 100;
      return curr > 0 ? 100 : null;
    };

    return {
      thisMonthSales,
      thisMonthOrders,
      salesGrowth: growth(thisMonthSales, lastMonthSales),
      ordersGrowth: growth(thisMonthOrders, lastMonthOrders),
    };
  }, [orders]);

  // ====== Recent Orders (latest 6) ======
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [orders]);

  // ====== Order Status Distribution (donut) ======
  const statusChartData = useMemo(() => {
    return ORDER_STATUSES.map((st) => ({
      key: st,
      name: STATUS_LABEL[st] || st,
      value: statusStats[st] || 0,
    })).filter((d) => d.value > 0);
  }, [statusStats]);

  const avgOrderValue = stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0;

  // ✅ Professional Gradient Cards Config (premium colors)
const cards = useMemo(() => {
  return [
    {
      key: "totalOrders",
      label: "Total Orders",
      value: stats.totalOrders,
      gradient: "from-indigo-600 via-blue-600 to-cyan-500",
      dot: "bg-white/50",
      sub: "All orders",
      growth: monthlyComparison.ordersGrowth,
    },
    {
      key: "totalSales",
      label: "Total Sales",
      value: `৳${stats.totalSales}`,
      gradient: "from-emerald-600 via-emerald-600 to-emerald-500",
      dot: "bg-white/50",
      sub: "Total revenue",
      growth: monthlyComparison.salesGrowth,
    },
    {
      key: "avgOrderValue",
      label: "Avg Order Value",
      value: `৳${avgOrderValue.toFixed(0)}`,
      gradient: "from-fuchsia-600 via-fuchsia-600 to-pink-500",
      dot: "bg-white/50",
      sub: "Per order average",
    },
    {
      key: "onlineOrders",
      label: "🌐 Online Orders",
      value: channelStats.online.orders,
      gradient: "from-blue-600 via-blue-600 to-cyan-500",
      dot: "bg-white/50",
      sub: `৳${channelStats.online.sales} sales`,
    },
    {
      key: "offlineOrders",
      label: "🏬 Offline Orders",
      value: channelStats.offline.orders,
      gradient: "from-purple-600 via-purple-600 to-fuchsia-500",
      dot: "bg-white/50",
      sub: `৳${channelStats.offline.sales} sales`,
    },
    {
      key: "pending",
      label: "Pending",
      value: statusStats.pending ?? 0,
      gradient: "from-amber-600 via-amber-600 to-amber-500",
      dot: "bg-white/50",
      sub: "Awaiting action",
    },
    {
      key: "ready_to_delivery",
      label: "Ready",
      value: statusStats.ready_to_delivery ?? 0,
      gradient: "from-sky-600 via-sky-600 to-sky-500",
      dot: "bg-white/50",
      sub: "Ready to deliver",
    },
    {
      key: "send_to_courier",
      label: "Courier",
      value: statusStats.send_to_courier ?? 0,
      gradient: "from-violet-600 via-violet-600 to-violet-500",
      dot: "bg-white/50",
      sub: "Handed to courier",
    },
    {
      key: "delivered",
      label: "Delivered",
      value: statusStats.delivered ?? 0,
      gradient: "from-teal-600 via-teal-700 to-teal-600",
      dot: "bg-white/50",
      sub: "Completed",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: statusStats.cancelled ?? 0,
      gradient: "from-rose-500 via-rose-600 to-rose-500",
      dot: "bg-white/50",
      sub: "Stopped orders",
    },
  ];
}, [stats, statusStats, channelStats, monthlyComparison, avgOrderValue]);

  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Overview of orders & sales performance
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium shadow hover:shadow-md hover:scale-[1.02] transition-all"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : err ? (
        <div className="bg-white dark:bg-slate-900 shadow rounded-xl p-6 text-red-500 dark:text-red-400">{err}</div>
      ) : (
        <>
          {/* ✅ PREMIUM PROFESSIONAL COLOR CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((c) => (
              <div
                key={c.key}
                className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${c.gradient}`}
                />

                {/* Soft glass overlay */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Decorative blur blobs */}
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                <div className="relative p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
                        {c.label}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-3xl font-extrabold leading-none drop-shadow-sm">
                          {c.value}
                        </p>
                        <GrowthBadge value={c.growth ?? null} />
                      </div>
                    </div>

                    {/* Minimal icon circle (pro look) */}
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
                      <div className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-white/80">{c.sub}</p>

                  {/* Bottom accent line */}
                  <div className="mt-4 h-[3px] w-10 rounded-full bg-white/70" />
                </div>
              </div>
            ))}
          </div>

          {/* 🧾 Recent Orders + 🍩 Status Distribution */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 shadow rounded-2xl border border-gray-100 dark:border-slate-700/60 p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">
                🧾 Recent Orders
              </h2>

              {recentOrders.length > 0 ? (
                <>
                  {/* Mobile: stacked cards — a 5-column table forces
                      horizontal scroll on phones, so below sm we swap to
                      one card per order instead. */}
                  <div className="sm:hidden space-y-2">
                    {recentOrders.map((o) => (
                      <div
                        key={o._id}
                        className="rounded-xl border border-gray-200 dark:border-slate-700 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-gray-500 dark:text-slate-400">
                            #{o.orderNumber ?? o._id?.slice(-6)}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              STATUS_BADGE_COLOR[o.status] ||
                              "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                            }`}
                          >
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-900 dark:text-slate-200 truncate">
                            {o.billing?.name || "—"}
                          </span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            ৳{o.total}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString()
                            : "-"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        <tr>
                          <th className="p-2 text-left font-semibold">Order</th>
                          <th className="p-2 text-left font-semibold">Customer</th>
                          <th className="p-2 text-left font-semibold">Status</th>
                          <th className="p-2 text-left font-semibold">Amount</th>
                          <th className="p-2 text-left font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((o) => (
                          <tr key={o._id} className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                            <td className="p-2 font-mono text-xs text-gray-600 dark:text-slate-400">
                              #{o.orderNumber ?? o._id?.slice(-6)}
                            </td>
                            <td className="p-2 text-gray-900 dark:text-slate-200">{o.billing?.name || "—"}</td>
                            <td className="p-2">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  STATUS_BADGE_COLOR[o.status] ||
                                  "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                                }`}
                              >
                                {STATUS_LABEL[o.status] || o.status}
                              </span>
                            </td>
                            <td className="p-2 font-semibold text-emerald-600 dark:text-emerald-400">
                              ৳{o.total}
                            </td>
                            <td className="p-2 text-gray-500 dark:text-slate-400 text-xs">
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 dark:text-slate-400 py-10">
                  No recent orders
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 shadow rounded-2xl border border-gray-100 dark:border-slate-700/60 p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">
                🍩 Order Status
              </h2>

              {statusChartData.length > 0 ? (
                <>
                  <div className="w-full h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="60%"
                          outerRadius="90%"
                          paddingAngle={2}
                        >
                          {statusChartData.map((d) => (
                            <Cell key={d.key} fill={STATUS_HEX[d.key] || "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            borderRadius: 8,
                            color: "var(--foreground)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {statusChartData.map((d) => (
                      <div
                        key={d.key}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: STATUS_HEX[d.key] || "#94a3b8" }}
                          />
                          {d.name}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-slate-200">
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 dark:text-slate-400 py-10">No data</div>
              )}
            </div>
          </div>

          {/* 🏆 Top Products */}
          <div className="bg-white dark:bg-slate-900 shadow rounded-2xl border border-gray-100 dark:border-slate-700/60 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">
              🏆 Top Selling Products
            </h2>

            {topProducts.length > 0 ? (
              <>
                {/* Mobile: stacked cards, same reasoning as Recent Orders
                    above — a 3-column table still forces sideways scroll
                    on narrow phones for long product names. */}
                <div className="sm:hidden space-y-2">
                  {topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 dark:border-slate-700 p-3"
                    >
                      <div className="text-sm text-gray-900 dark:text-slate-200">{p.name}</div>
                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-slate-400">Qty: {p.qty}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ৳{p.revenue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      <tr>
                        <th className="p-2 text-left font-semibold">Product</th>
                        <th className="p-2 text-left font-semibold">
                          Quantity
                        </th>
                        <th className="p-2 text-left font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, idx) => (
                        <tr key={idx} className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                          <td className="p-2 text-gray-900 dark:text-slate-200">{p.name}</td>
                          <td className="p-2 text-gray-900 dark:text-slate-200">{p.qty}</td>
                          <td className="p-2 font-semibold text-emerald-600 dark:text-emerald-400">
                            ৳{p.revenue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts}>
                      <XAxis dataKey="name" tick={{ fill: "currentColor" }} className="text-gray-600 dark:text-slate-400" />
                      <YAxis tick={{ fill: "currentColor" }} className="text-gray-600 dark:text-slate-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid rgba(148, 163, 184, 0.3)",
                          borderRadius: 8,
                          color: "var(--foreground)",
                        }}
                      />
                      <Bar dataKey="qty" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-slate-400 py-10">
                No product data
              </div>
            )}
          </div>

          {/* 📈 Monthly Sales */}
          <div className="bg-white dark:bg-slate-900 shadow rounded-2xl border border-gray-100 dark:border-slate-700/60 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">
              📅 Monthly Sales (Last 12 Months)
            </h2>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fill: "currentColor" }} className="text-gray-600 dark:text-slate-400" />
                  <YAxis tick={{ fill: "currentColor" }} className="text-gray-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "currentColor" }} className="text-gray-600 dark:text-slate-400" />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
