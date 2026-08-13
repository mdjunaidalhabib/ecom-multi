import { CircleGauge, Store, Trash2, User, Settings, Palette } from "lucide-react";

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
    icon: <Trash2 size={18} />,
    label: "Shop Trash",
    href: "/trash",
  },
  {
    icon: <Settings size={18} />,
    label: "Settings",
    href: "/settings",
  },
  {
    icon: <User size={18} />,
    label: "Profile",
    href: "/profile",
  },
];

// ✅ MenuBar-এর "Settings" collapsible submenu-তে দেখানো হয়
export const superAdminSettingsChildren = [
  {
    icon: <Palette size={16} />,
    label: "Themes",
    href: "/settings/themes",
  },
];
