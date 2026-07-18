import {
  CircleGauge,
  Users,
  Package,
  ShoppingCart,
  ChartBarStacked,
  SlidersHorizontal,
  User,
  Eye,
  Settings,
  LayoutDashboard,
  Trash2,
  Wallet,
  Store,
} from "lucide-react";

export const navItems = [
  {
    icon: <CircleGauge size={18} />,
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  { icon: <ShoppingCart size={18} />, label: "Orders", href: "/admin/orders" },
  { icon: <Wallet size={18} />, label: "Payments", href: "/admin/payments" },
  { icon: <Package size={18} />, label: "Products", href: "/admin/products" },
  {
    icon: <ChartBarStacked size={18} />,
    label: "Category",
    href: "/admin/category",
  },
  { icon: <Users size={18} />, label: "Users", href: "/admin/users" },
  {
    icon: <SlidersHorizontal size={18} />, // lucide-react icon
    label: "Sliders",
    href: "/admin/sliders",
  },

  {
    icon: <User size={18} />,
    label: "Profile",
    href: "/admin/profile",
  },

  {
    icon: <Eye size={18} />,
    label: "Visitor",
    href: "/admin/analytics",
  },

  { icon: <Trash2 size={18} />, label: "Trash", href: "/admin/trash" },

  { icon: <Settings size={18} />, label: "Settings", href: "/admin/settings" },
];

// ✅ শুধু superadmin-এর জন্য — Sidebar.jsx রোল চেক করে navItems-এর সাথে
// এটা জুড়ে দেয়
export const superAdminOnlyNavItems = [
  {
    icon: <Store size={18} />,
    label: "Shops",
    href: "/admin/shops",
  },
];

// ✅ Superadmin-এর কাজ শুধু শপ তৈরি/ম্যানেজ করা — কোনো শপের
// Products/Orders/Users/Settings ইত্যাদি shop-scoped ডেটাতে তার এক্সেস
// নেই (backend-এও ব্লক করা আছে, দেখুন tenancy/adminShopContext.js), তাই
// মেনুতেও শুধু প্রাসঙ্গিক আইটেমগুলোই দেখানো হয়
export const superAdminNavItems = [
  {
    icon: <CircleGauge size={18} />,
    label: "Dashboard",
    href: "/super-admin/dashboard",
  },
  {
    icon: <Store size={18} />,
    label: "Shops",
    href: "/super-admin/shops",
  },
  {
    icon: <User size={18} />,
    label: "Profile",
    href: "/super-admin/profile",
  },
];

export const settingsChildren = [
  {
    icon: <LayoutDashboard size={16} />,
    label: "Navbar",
    href: "/admin/navbar",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "Footer",
    href: "/admin/footer",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "About Page",
    href: "/admin/about",
  },
    {
    icon: <LayoutDashboard size={16} />,
    label: "Action Button",
    href: "/admin/floatingActionButton",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "Facebook Group",
    href: "/admin/facebookGroup",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "Delivery Charge",
    href: "/admin/deliveryCharge",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "Home Badges",
    href: "/admin/home-badges",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "Order Mail Send",
    href: "/admin/order-mail-send",
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: "Courier Setup",
    href: "/admin/courier-setup",
  },
];
