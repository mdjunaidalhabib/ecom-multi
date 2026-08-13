import { CircleGauge, Store, Trash2, User } from "lucide-react";

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
    icon: <User size={18} />,
    label: "Profile",
    href: "/profile",
  },
];
