import { CircleGauge, Store, Trash2, User, Layers, Inbox, FileText } from "lucide-react";

// ✅ Superadmin-এর কাজ শুধু শপ তৈরি/ম্যানেজ করা — কোনো শপের
// Products/Orders/Users/Settings ইত্যাদি shop-scoped ডেটাতে তার এক্সেস
// নেই (backend-এও ব্লক করা আছে, দেখুন backend/src/tenancy/adminShopContext.js),
// তাই মেনুতেও শুধু প্রাসঙ্গিক platform-level আইটেমগুলোই দেখানো হয়
export const superAdminNavItems = [
  {
    icon: <CircleGauge size={18} />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Store size={18} />,
    label: "Shops",
    href: "/shops",
  },
  {
    icon: <Layers size={18} />,
    label: "Plans",
    href: "/plans",
  },
  {
    icon: <Inbox size={18} />,
    label: "Plan Requests",
    href: "/plan-requests",
  },
  {
    icon: <FileText size={18} />,
    label: "Invoice Template",
    href: "/invoice-template",
  },
  {
    icon: <Trash2 size={18} />,
    label: "Shop Trash",
    href: "/trash",
  },
  {
    icon: <User size={18} />,
    label: "Profile",
    href: "/profile",
  },
];

// ✅ বর্তমানে কোনো Settings sub-page নেই (Plan Features/Themes সেটিংস এখন
// /plans পেজেই মার্জ করা) — ভবিষ্যতে দরকার হলে এখানে আবার যোগ করা যাবে।
// Header/MenuBar এখনো এই আর্গুমেন্ট প্রত্যাশা করে, তাই খালি array রাখা হলো।
export const superAdminSettingsChildren = [];
