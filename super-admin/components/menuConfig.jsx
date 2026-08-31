import { CircleGauge, Store, Trash2, User, Layers, Inbox, FileText, Palette, Globe } from "lucide-react";

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
    icon: <Palette size={18} />,
    label: "Themes",
    href: "/themes",
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
    icon: <Globe size={18} />,
    label: "Browser Title & Favicon",
    href: "/branding",
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

// ✅ বর্তমানে কোনো Settings sub-page নেই — Plan Features /plans পেজে, আর
// Theme প্রিসেট /themes পেজে (দেখুন components/Themes.jsx) আলাদাভাবে আছে।
// Header/MenuBar এখনো এই আর্গুমেন্ট প্রত্যাশা করে, তাই খালি array রাখা হলো।
export const superAdminSettingsChildren = [];
