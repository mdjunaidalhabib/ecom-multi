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
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  RefreshCw,
  Wallet,
  ShoppingBag,
  Receipt,
  HandCoins,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Undo2,
  Package,
  Globe,
  Store,
  Warehouse,
  Boxes,
  Banknote,
} from "lucide-react";
import { useMyPlanInfo } from "../../../../hooks/useShopFeatures";
import { getShopPublicUrl } from "../../../../lib/shopUrl";
import DashboardSkeleton from "../../../../components/Skeleton/DashboardSkeleton.jsx";
import {
  STATUS_LABEL,
  STATUS_BADGE_COLOR,
} from "../../../../components/orders/shared/constants.js";

// ✅ status অনুযায়ী hex color — donut chart-এ Recharts Cell fill এর জন্য
// (STATUS_BADGE_COLOR এর tailwind ক্লাসের সাথে hue মিলিয়ে বানানো)
const STATUS_HEX = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
  returned: "#f97316",
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

// ====== Number formatting (বাংলাদেশি গ্রুপিং: ১,২৪,৫০০) ======
const fmtNum = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtMoney = (n) =>
  `৳${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

// ====== ছোট trend line (hero card এর ভেতরে) ======
function Sparkline({ data, id }) {
  return (
    <div className="h-8 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke="#ffffff"
            strokeWidth={2}
            fill={`url(#spark-${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ====== সেকশন শিরোনাম ======
function SectionTitle({ title, hint }) {
  return (
    <div className="flex items-end justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-fuchsia-500" />
        <h2 className="text-sm sm:text-base font-bold tracking-tight text-gray-900 dark:text-slate-100">
          {title}
        </h2>
      </div>
      {hint && (
        <p className="text-[11px] text-gray-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
}

// ====== KPI card (উপরের ৪টা) — compact ======
function HeroCard({ c }) {
  const Icon = c.icon;
  const hasGrowth =
    c.growth !== undefined && c.growth !== null && Number.isFinite(c.growth);
  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${c.gradient} px-4 py-3.5 text-white shadow-md ${c.shadow} ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      {/* decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]" />
      <div className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />

      <div className="relative flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
          {c.label}
        </p>
        <span className="h-8 w-8 shrink-0 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center">
          <Icon size={16} />
        </span>
      </div>

      <div className="relative mt-1 flex items-center gap-2">
        <p className="text-2xl font-extrabold leading-tight tabular-nums truncate">
          {c.value}
        </p>
        {hasGrowth && <GrowthBadge value={c.growth} />}
      </div>

      <div className="relative mt-1.5 flex items-end justify-between gap-3">
        <p className="text-[11px] text-white/85 leading-snug">{c.sub}</p>
        {c.spark && (
          <div className="w-20 shrink-0">
            <Sparkline data={c.spark} id={c.key} />
          </div>
        )}
      </div>

      {c.progress !== undefined && (
        <div className="relative mt-2">
          <div className="h-1.5 w-full rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/90"
              style={{ width: `${Math.min(100, Math.max(0, c.progress))}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-white/80">{c.progressLabel}</p>
        </div>
      )}
    </div>
  );
}

// ====== ছোট gradient tile (status / revenue / channel) ======
function MiniTile({ c }) {
  const Icon = c.icon;
  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${c.gradient} p-3.5 text-white shadow-md ${c.shadow} ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]" />
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20 blur-xl" />

      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90 truncate">
          {c.label}
        </p>
        <span className="h-7 w-7 shrink-0 rounded-lg bg-white/20 border border-white/20 flex items-center justify-center">
          <Icon size={14} />
        </span>
      </div>

      <p className="relative mt-2 text-2xl font-extrabold leading-none tabular-nums">
        {c.value}
      </p>

      <p className="relative mt-1.5 text-[11px] text-white/85 truncate">{c.sub}</p>

      {c.pct !== undefined && (
        <div className="relative mt-2.5 h-1.5 w-full rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/90"
            style={{ width: `${Math.min(100, Math.max(0, c.pct))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const API = "/api";

  // ✅ "Visit Shop" বাটনের জন্য শপের পাবলিক URL (custom domain বা /shop/<slug>)
  const planInfo = useMyPlanInfo();
  const shopUrl = getShopPublicUrl(planInfo?.shop);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ FIXED status list (schema enum অনুযায়ী)
  const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProductSales: 0,
    totalDeliveryCharge: 0,
    cancelledAmount: 0,
  });

  // ✅ Online vs Offline vs Wholesale breakdown
  const [channelStats, setChannelStats] = useState({
    online: { orders: 0, sales: 0 },
    offline: { orders: 0, sales: 0 },
    wholesale: { orders: 0, sales: 0 },
  });

  // ✅ status stats — প্রতিটা status এ কতগুলো অর্ডার + মোট টাকার পরিমাণ (সব status থাকবে, না থাকলে 0)
  const emptyStatusStats = () =>
    ORDER_STATUSES.reduce((acc, st) => {
      acc[st] = { count: 0, amount: 0 };
      return acc;
    }, {});

  const [statusStats, setStatusStats] = useState(emptyStatusStats);

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

          // ✅ Sales/Revenue শুধু "delivered" অর্ডার থেকে গণনা হয় — এখনো
          // deliver না হওয়া বা cancel হওয়া অর্ডারের টাকা কখনোই Sales এ যোগ হবে না।
          const deliveredOrders = data.filter((o) => o.status === "delivered");
          const cancelledOrders = data.filter((o) => o.status === "cancelled");

          const totalOrders = data.length;
          const totalSales = deliveredOrders.reduce(
            (sum, o) => sum + (o.total || 0),
            0
          );
          const totalProductSales = deliveredOrders.reduce(
            (sum, o) => sum + ((o.subtotal || 0) - (o.discount || 0)),
            0
          );
          const totalDeliveryCharge = deliveredOrders.reduce(
            (sum, o) => sum + (o.deliveryCharge || 0),
            0
          );
          const cancelledAmount = cancelledOrders.reduce(
            (sum, o) => sum + (o.total || 0),
            0
          );
          setStats({
            totalOrders,
            totalSales,
            totalProductSales,
            totalDeliveryCharge,
            cancelledAmount,
          });

          // ✅ প্রতিটা status এ কতগুলো অর্ডার + সেই status এর অর্ডারগুলোর মোট টাকা (fixed enum list)
          const statusMap = emptyStatusStats();

          data.forEach((order) => {
            const st = order.status || "pending";
            if (statusMap[st]) {
              statusMap[st].count += 1;
              statusMap[st].amount += order.total || 0;
            }
          });

          setStatusStats(statusMap);

          // ✅ Online vs Offline breakdown — order count সব status থেকে,
          // কিন্তু sales শুধু delivered অর্ডার থেকে (professional/accurate)
          const channelMap = {
            online: { orders: 0, sales: 0 },
            offline: { orders: 0, sales: 0 },
            wholesale: { orders: 0, sales: 0 },
          };
          // ⚠️ অজানা/পুরনো channel মান আগের মতোই "online" ধরা হয়
          const channelOf = (order) =>
            order.saleChannel === "offline" || order.saleChannel === "wholesale"
              ? order.saleChannel
              : "online";
          data.forEach((order) => {
            channelMap[channelOf(order)].orders += 1;
          });
          deliveredOrders.forEach((order) => {
            channelMap[channelOf(order)].sales += order.total || 0;
          });
          setChannelStats(channelMap);
        } else {
          setOrders([]);
          setStats({
            totalOrders: 0,
            totalSales: 0,
            totalProductSales: 0,
            totalDeliveryCharge: 0,
            cancelledAmount: 0,
          });
          setStatusStats(emptyStatusStats());
          setChannelStats({
            online: { orders: 0, sales: 0 },
            offline: { orders: 0, sales: 0 },
            wholesale: { orders: 0, sales: 0 },
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

  // ====== Top Products (শুধু delivered অর্ডার থেকে — প্রকৃত বিক্রি) ======
  const topProducts = useMemo(() => {
    const map = {};
    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) => {
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

  // ====== Monthly Sales (শুধু delivered অর্ডার) ======
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
    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) => {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        if (map[key] !== undefined) map[key] += o.total || 0;
      });
    return Object.entries(map).map(([month, sales]) => ({ month, sales }));
  }, [orders]);

  // ====== This Month vs Last Month (growth %, শুধু delivered অর্ডার) ======
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

    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) => {
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
      value: statusStats[st]?.count || 0,
    })).filter((d) => d.value > 0);
  }, [statusStats]);

  // 🏭 Wholesale বাকি (due) হিসাব — cancelled/returned অর্ডার বাদ।
  // due = total - paidAmount (backend ও Orders পেজের একই সূত্র)
  const wholesaleSummary = useMemo(() => {
    const all = orders.filter((o) => o.saleChannel === "wholesale");
    const active = all.filter(
      (o) => o.status !== "cancelled" && o.status !== "returned"
    );

    let paid = 0;
    let due = 0;
    let dueOrders = 0;
    const parties = {};

    active.forEach((o) => {
      const total = Number(o.total || 0);
      const p = Math.min(total, Math.max(0, Number(o.paidAmount || 0)));
      const d = Math.max(0, total - p);
      paid += p;
      due += d;
      if (d > 0) {
        dueOrders += 1;
        const key = o.billing?.phone || o.billing?.name || "unknown";
        if (!parties[key]) {
          parties[key] = {
            key,
            name: o.billing?.name || "—",
            phone: o.billing?.phone || "",
            due: 0,
            orders: 0,
          };
        }
        parties[key].due += d;
        parties[key].orders += 1;
      }
    });

    const topParties = Object.values(parties)
      .sort((a, b) => b.due - a.due)
      .slice(0, 8);

    return { orders: all.length, paid, due, dueOrders, topParties };
  }, [orders]);

  // ✅ Avg Order Value = delivered অর্ডারে কাস্টমার গড়ে প্রকৃত কত পেমেন্ট করেছে (delivery charge সহ)
  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === "delivered"),
    [orders]
  );


  // ✅ Total Quantity Sold = শুধু delivered অর্ডারের আইটেম qty যোগফল (প্রকৃত বিক্রি)
  // (একটা অর্ডারে একাধিক আইটেম, বা একটা আইটেমের একাধিক qty থাকতে পারে — তাই শুধু order count দিয়ে বোঝা যায় না)
  const totalQuantitySold = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => {
      const orderQty = (o.items || []).reduce(
        (s, it) => s + (it.qty || 0),
        0
      );
      return sum + orderQty;
    }, 0);
  }, [deliveredOrders]);

  // ====== শেষ ৬ মাসের trend (sparkline + growth এর জন্য) ======
  const trend = useMemo(() => {
    const keyOf = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(keyOf(new Date(now.getFullYear(), now.getMonth() - i, 1)));
    }
    const m = {};
    months.forEach((k) => (m[k] = { sales: 0, delivered: 0, orders: 0, wsales: 0 }));
    orders.forEach((o) => {
      const k = keyOf(new Date(o.createdAt));
      if (!m[k]) return;
      m[k].orders += 1;
      if (o.status === "delivered") {
        m[k].delivered += 1;
        m[k].sales += o.total || 0;
        if (o.saleChannel === "wholesale") m[k].wsales += o.total || 0;
      }
    });
    const growth = (curr, prev) => {
      if (prev > 0) return ((curr - prev) / prev) * 100;
      return curr > 0 ? 100 : null;
    };
    const cur = m[months[5]];
    const prev = m[months[4]];
    return {
      sales: months.map((k) => ({ v: m[k].sales })),
      orders: months.map((k) => ({ v: m[k].orders })),
      wholesale: months.map((k) => ({ v: m[k].wsales })),
      ordersGrowth: growth(cur.orders, prev.orders),
      wholesaleGrowth: growth(cur.wsales, prev.wsales),
    };
  }, [orders]);

  // ====== উপরের ৪টা বড় KPI card ======
  const heroCards = useMemo(() => {
    const collectedTotal = wholesaleSummary.paid + wholesaleSummary.due;
    const collectedPct = collectedTotal
      ? (wholesaleSummary.paid / collectedTotal) * 100
      : 0;
    return [
      {
        key: "totalSales",
        label: "Total Sales",
        value: fmtMoney(stats.totalSales),
        icon: Wallet,
        gradient: "from-emerald-500 via-emerald-600 to-teal-700",
        shadow: "shadow-emerald-600/30",
        sub: "Delivered orders only",
        growth: monthlyComparison.salesGrowth,
        spark: trend.sales,
      },
      {
        key: "totalOrders",
        label: "Total Orders",
        value: fmtNum(stats.totalOrders),
        icon: ShoppingBag,
        gradient: "from-indigo-500 via-indigo-600 to-blue-700",
        shadow: "shadow-indigo-600/30",
        sub: `${fmtNum(totalQuantitySold)} items sold (delivered)`,
        growth: trend.ordersGrowth,
        spark: trend.orders,
      },
      {
        key: "wholesaleSales",
        label: "Wholesale Sales",
        value: fmtMoney(channelStats.wholesale.sales),
        icon: Warehouse,
        gradient: "from-fuchsia-500 via-purple-600 to-violet-700",
        shadow: "shadow-purple-600/30",
        sub: `${fmtNum(channelStats.wholesale.orders)} orders · ${stats.totalSales ? ((channelStats.wholesale.sales / stats.totalSales) * 100).toFixed(0) : 0}% of sales`,
        growth: trend.wholesaleGrowth,
        spark: trend.wholesale,
      },
      {
        key: "wholesaleDue",
        label: "Wholesale Due",
        value: fmtMoney(wholesaleSummary.due),
        icon: HandCoins,
        gradient: "from-rose-500 via-red-600 to-orange-600",
        shadow: "shadow-rose-600/30",
        sub: `${wholesaleSummary.dueOrders} orders pending`,
        progress: collectedPct,
        progressLabel: `${fmtMoney(wholesaleSummary.paid)} collected (${collectedPct.toFixed(0)}%)`,
      },
    ];
  }, [stats, channelStats, wholesaleSummary, monthlyComparison, trend, totalQuantitySold]);

  // ====== Order Status tiles ======
  const statusCards = useMemo(() => {
    const total = stats.totalOrders || 0;
    const defs = [
      { key: "pending", label: "Pending", icon: Clock, gradient: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/30" },
      { key: "confirmed", label: "Confirmed", icon: CheckCircle2, gradient: "from-sky-500 to-blue-600", shadow: "shadow-sky-500/30" },
      { key: "shipped", label: "Shipped", icon: Truck, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/30" },
      { key: "delivered", label: "Delivered", icon: PackageCheck, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/30" },
      { key: "cancelled", label: "Cancelled", icon: XCircle, gradient: "from-rose-500 to-red-600", shadow: "shadow-rose-500/30" },
      { key: "returned", label: "Returned", icon: Undo2, gradient: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/30" },
    ];
    return defs.map((d) => {
      const count = statusStats[d.key]?.count ?? 0;
      return {
        ...d,
        value: fmtNum(count),
        sub: `${fmtMoney(statusStats[d.key]?.amount ?? 0)} value`,
        pct: total ? (count / total) * 100 : 0,
      };
    });
  }, [stats, statusStats]);

  // ====== Revenue & Volume tiles ======
  const revenueCards = useMemo(
    () => [
      {
        key: "productSales",
        label: "Product Sales",
        value: fmtMoney(stats.totalProductSales),
        icon: Banknote,
        gradient: "from-amber-500 to-orange-600",
        shadow: "shadow-orange-500/30",
        sub: "Excludes delivery charge",
      },
      {
        key: "deliveryCharge",
        label: "Delivery Charge",
        value: fmtMoney(stats.totalDeliveryCharge),
        icon: Truck,
        gradient: "from-cyan-500 to-blue-600",
        shadow: "shadow-cyan-500/30",
        sub: "Delivered orders only",
      },
      {
        key: "quantitySold",
        label: "Quantity Sold",
        value: `${fmtNum(totalQuantitySold)} pcs`,
        icon: Boxes,
        gradient: "from-lime-500 to-emerald-600",
        shadow: "shadow-lime-500/30",
        sub: "Delivered items only",
      },
      {
        key: "cancelledAmount",
        label: "Cancelled Amount",
        value: fmtMoney(stats.cancelledAmount),
        icon: XCircle,
        gradient: "from-rose-500 to-red-600",
        shadow: "shadow-rose-500/30",
        sub: `${statusStats.cancelled?.count ?? 0} orders — not in sales`,
      },
    ],
    [stats, statusStats, totalQuantitySold]
  );

  // ====== Sales Channel tiles ======
  const channelCards = useMemo(() => {
    const total = stats.totalOrders || 0;
    const mk = (key, label, icon, gradient, shadow) => ({
      key,
      label,
      icon,
      gradient,
      shadow,
      value: `${fmtNum(channelStats[key].orders)} orders`,
      sub: `${fmtMoney(channelStats[key].sales)} delivered sales`,
      pct: total ? (channelStats[key].orders / total) * 100 : 0,
    });
    return [
      mk("online", "Online", Globe, "from-blue-500 to-indigo-600", "shadow-blue-500/30"),
      mk("offline", "Offline", Store, "from-purple-500 to-fuchsia-600", "shadow-purple-500/30"),
      mk("wholesale", "Wholesale", Warehouse, "from-teal-500 to-emerald-600", "shadow-teal-500/30"),
    ];
  }, [stats, channelStats]);

  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Overview of orders & sales performance
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          {/* ✅ Visit Shop — Refresh-এর বামে; নতুন ট্যাবে শপের frontend খোলে */}
          {shopUrl ? (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold text-white
                bg-gradient-to-r from-emerald-600 to-teal-500 shadow-sm shadow-emerald-600/25
                hover:from-emerald-500 hover:to-teal-400 hover:shadow-md active:scale-[0.97] transition-all"
            >
              <ExternalLink size={14} />
              Visit Shop
            </a>
          ) : (
            <button
              type="button"
              disabled
              title={planInfo ? "Shop URL পাওয়া যায়নি" : "লোড হচ্ছে..."}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold
                bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500
                border border-gray-200 dark:border-slate-700 cursor-not-allowed"
            >
              <ExternalLink size={14} />
              Visit Shop
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-blue-600 shadow-sm shadow-indigo-600/25
              hover:shadow-md active:scale-[0.97] transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : err ? (
        <div className="bg-white dark:bg-slate-900 shadow rounded-xl p-6 text-red-500 dark:text-red-400">{err}</div>
      ) : (
        <>
          {/* ✅ HERO KPI — সবচেয়ে গুরুত্বপূর্ণ ৪টা */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {heroCards.map((c) => (
              <HeroCard key={c.key} c={c} />
            ))}
          </div>

          {/* 📦 Order Status */}
          <div>
            <SectionTitle title="Order Status" hint="Share of total orders" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {statusCards.map((c) => (
                <MiniTile key={c.key} c={c} />
              ))}
            </div>
          </div>

          {/* 💰 Revenue & Volume */}
          <div>
            <SectionTitle title="Revenue & Volume" hint="Delivered orders" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {revenueCards.map((c) => (
                <MiniTile key={c.key} c={c} />
              ))}
            </div>
          </div>

          {/* 🛒 Sales Channels */}
          <div>
            <SectionTitle title="Sales Channels" hint="Share of total orders" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {channelCards.map((c) => (
                <MiniTile key={c.key} c={c} />
              ))}
            </div>
          </div>

          {/* 🏭 Wholesale — পার্টি অনুযায়ী বাকি (শুধু wholesale অর্ডার থাকলে) */}
          {wholesaleSummary.orders > 0 && (
            <div className="bg-white dark:bg-slate-900 shadow rounded-2xl border border-gray-100 dark:border-slate-700/60 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100">
                    📦 Wholesale — পার্টি অনুযায়ী বাকি
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Cancelled/Returned অর্ডার বাদে • আদায় করতে Orders → Wholesale → 💸 বাকি আছে
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase text-gray-400 dark:text-slate-500">
                    মোট বাকি
                  </div>
                  <div className="text-xl font-black text-red-600 dark:text-red-400">
                    ৳{wholesaleSummary.due}
                  </div>
                </div>
              </div>

              {wholesaleSummary.topParties.length === 0 ? (
                <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ কোনো বাকি নেই — সব পার্টি পরিশোধ করেছে
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase text-gray-500 dark:text-slate-400 border-b dark:border-slate-700">
                        <th className="py-2 pr-3">পার্টি</th>
                        <th className="py-2 pr-3">ফোন</th>
                        <th className="py-2 pr-3 text-right">বাকি অর্ডার</th>
                        <th className="py-2 text-right">বাকি টাকা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wholesaleSummary.topParties.map((p) => (
                        <tr
                          key={p.key}
                          className="border-b last:border-0 dark:border-slate-800 text-gray-900 dark:text-slate-100"
                        >
                          <td className="py-2 pr-3 font-semibold">{p.name}</td>
                          <td className="py-2 pr-3 text-gray-500 dark:text-slate-400">{p.phone || "—"}</td>
                          <td className="py-2 pr-3 text-right">{p.orders}</td>
                          <td className="py-2 text-right font-black text-red-600 dark:text-red-400">৳{p.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

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
