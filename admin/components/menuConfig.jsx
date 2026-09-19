import {
  CircleGauge,
  Users,
  Package,
  ShoppingCart,
  ChartBarStacked,
  SlidersHorizontal,
  Eye,
  Settings,
  Trash2,
  Wallet,
  BadgePercent,
  CreditCard,
  UserCog,
  Megaphone,
  FileText,
  PanelTop,
  PanelBottom,
  BadgeCheck,
  AppWindow,
  MousePointerClick,
  Facebook,
  Info,
  Crown,
  CircleHelp,
  ShieldCheck,
  Undo2,
  Truck,
  Hash,
  PackageCheck,
  MailPlus,
  MailCheck,
  GraduationCap,
} from "lucide-react";

// ✅ প্রতিটা আইটেমে `section` — Sidebar/mobile drawer এ এই কী অনুযায়ী গ্রুপ
// করে দেখানো হয় (উপরে ছোট uppercase লেবেল সহ), দেখুন MenuBar.jsx।
export const navItems = [
  {
    icon: <CircleGauge size={18} />,
    label: "Dashboard",
    href: "/admin/dashboard",
    section: "Overview",
  },
  {
    icon: <ShoppingCart size={18} />,
    label: "Orders",
    href: "/admin/orders",
    permission: "orders",
    section: "Sales",
  },
  {
    icon: <Wallet size={18} />,
    label: "Payments",
    href: "/admin/payments",
    feature: "payment",
    permission: "payments",
    section: "Sales",
  },
  {
    icon: <BadgePercent size={18} />,
    label: "Promo Codes",
    href: "/admin/promos",
    feature: "promo",
    permission: "promos",
    section: "Sales",
  },
  {
    icon: <Package size={18} />,
    label: "Products",
    href: "/admin/products",
    permission: "products",
    section: "Catalog",
  },
  {
    icon: <ChartBarStacked size={18} />,
    label: "Category",
    href: "/admin/category",
    feature: "fullStorefront",
    permission: "categories",
    section: "Catalog",
  },
  {
    icon: <SlidersHorizontal size={18} />,
    label: "Sliders",
    href: "/admin/sliders",
    feature: "fullStorefront",
    permission: "sliders",
    section: "Catalog",
  },
  {
    icon: <Megaphone size={18} />,
    label: "Landing Pages",
    href: "/admin/landing-pages",
    feature: "landingPages",
    permission: "landingPages",
    section: "Catalog",
  },
  {
    icon: <Users size={18} />,
    label: "Users",
    href: "/admin/users",
    permission: "users",
    section: "Team",
  },
  {
    icon: <UserCog size={18} />,
    label: "Staff",
    href: "/admin/staff",
    roles: ["admin"],
    section: "Team",
  },
  {
    icon: <Eye size={18} />,
    label: "Visitor",
    href: "/admin/analytics",
    feature: "analytics",
    permission: "analytics",
    section: "Insights",
  },
  {
    icon: <Trash2 size={18} />,
    label: "Trash",
    href: "/admin/trash",
    permission: "trash",
    section: "System",
  },
  {
    // ✅ কোনো permission/feature গেট নেই — সব admin/staff দেখতে পারবে
    icon: <GraduationCap size={18} />,
    label: "Tutorials",
    href: "/admin/tutorials",
    section: "System",
  },
  {
    icon: <Settings size={18} />,
    label: "Settings",
    href: "/admin/settings",
    // ✅ Plan / Invoice Design এখন Settings-এর ভেতরে — তাই এই তিনটার যেকোনো
    // একটাতে view পারমিশন থাকলেই Settings মেনু দেখা যাবে।
    permissionAny: ["settings", "plan", "invoiceDesign"],
    section: "System",
  },
];

// ✅ Settings পেজের গ্রুপ — SettingsSideMenu ও /admin/settings হাবে এই ক্রমে
// দেখানো হয়। `tone` এর রঙ settingsTheme.js এ ডিফাইন করা।
export const settingsGroups = [
  {
    key: "storefront",
    label: "Storefront",
    hint: "স্টোরের চেহারা ও হোমপেজ",
    tone: "indigo",
  },
  {
    key: "pages",
    label: "Pages & Policies",
    hint: "কনটেন্ট ও নীতিমালা পেজ",
    tone: "violet",
  },
  {
    key: "orders",
    label: "Orders & Delivery",
    hint: "অর্ডার, ডেলিভারি ও কুরিয়ার",
    tone: "emerald",
  },
  {
    key: "communication",
    label: "Email & Reports",
    hint: "মেইল নোটিফিকেশন ও রিপোর্ট",
    tone: "amber",
  },
  {
    key: "billing",
    label: "Billing & Documents",
    hint: "প্ল্যান ও ইনভয়েস",
    tone: "rose",
  },
];

// ✅ প্রতিটা আইটেমে: `icon` (16px, হেডারের জন্য), `Icon` (হাব কার্ডে বড় সাইজে
// রেন্ডারের জন্য), `group` (উপরের settingsGroups এর key) ও `desc`।
// `permission` না দিলে ডিফল্ট "settings"; Plan/Invoice Design নিজস্ব পারমিশন
// ও ফিচার গেট রাখে।
const settingsItem = (Icon, item) => ({
  permission: "settings",
  ...item,
  Icon,
  icon: <Icon size={16} />,
});

export const settingsChildren = [
  settingsItem(PanelTop, {
    label: "Navbar",
    href: "/admin/navbar",
    feature: "fullStorefront",
    group: "storefront",
    desc: "লোগো, মেনু ও উপরের বার",
  }),
  settingsItem(PanelBottom, {
    label: "Footer",
    href: "/admin/footer",
    feature: "fullStorefront",
    group: "storefront",
    desc: "ফুটার লিংক ও যোগাযোগের তথ্য",
  }),
  settingsItem(BadgeCheck, {
    label: "Home Badges",
    href: "/admin/home-badges",
    feature: "fullStorefront",
    group: "storefront",
    desc: "হোমপেজের ট্রাস্ট ব্যাজ",
  }),
  settingsItem(AppWindow, {
    label: "Homepage Popup",
    href: "/admin/homepagePopup",
    feature: "fullStorefront",
    group: "storefront",
    desc: "ভিজিটরদের জন্য পপআপ অফার",
  }),
  settingsItem(MousePointerClick, {
    label: "Action Button",
    href: "/admin/floatingActionButton",
    feature: "fullStorefront",
    group: "storefront",
    desc: "ফ্লোটিং কল/চ্যাট বাটন",
  }),
  settingsItem(Facebook, {
    label: "Facebook Group",
    href: "/admin/facebookGroup",
    feature: "fullStorefront",
    group: "storefront",
    desc: "কমিউনিটি গ্রুপ লিংক",
  }),

  settingsItem(Info, {
    label: "About Page",
    href: "/admin/about",
    group: "pages",
    desc: "আপনার ব্র্যান্ডের পরিচিতি",
  }),
  settingsItem(Crown, {
    label: "Founder & CEO",
    href: "/admin/founder-ceo",
    group: "pages",
    desc: "প্রতিষ্ঠাতার বার্তা ও ছবি",
  }),
  settingsItem(CircleHelp, {
    label: "FAQ",
    href: "/admin/faq",
    group: "pages",
    desc: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
  }),
  settingsItem(ShieldCheck, {
    label: "Privacy Policy",
    href: "/admin/privacy-policy",
    group: "pages",
    desc: "গোপনীয়তা নীতিমালা",
  }),
  settingsItem(Undo2, {
    label: "Refund Policy",
    href: "/admin/refund-policy",
    group: "pages",
    desc: "রিফান্ড ও রিটার্ন নীতি",
  }),

  settingsItem(Truck, {
    label: "Delivery Charge",
    href: "/admin/deliveryCharge",
    group: "orders",
    desc: "এলাকা অনুযায়ী ডেলিভারি চার্জ",
  }),
  settingsItem(Hash, {
    label: "Order Number",
    href: "/admin/orderCounter",
    group: "orders",
    desc: "অর্ডার নম্বরের ফরম্যাট ও কাউন্টার",
  }),
  settingsItem(PackageCheck, {
    label: "Courier Setup",
    href: "/admin/courier-setup",
    group: "orders",
    desc: "কুরিয়ার সার্ভিস কানেকশন",
  }),

  settingsItem(MailPlus, {
    label: "Order Mail Send",
    href: "/admin/order-mail-send",
    group: "communication",
    desc: "নতুন অর্ডারে ইমেইল নোটিফিকেশন",
  }),
  settingsItem(MailCheck, {
    label: "Mail Report",
    href: "/admin/mail-report",
    group: "communication",
    desc: "পাঠানো মেইলের রিপোর্ট",
  }),

  settingsItem(CreditCard, {
    label: "Plan",
    href: "/admin/plan",
    permission: "plan",
    group: "billing",
    desc: "বর্তমান প্ল্যান, ফিচার ও মেয়াদ",
  }),
  settingsItem(FileText, {
    label: "Invoice Design",
    href: "/admin/invoice-design",
    feature: "invoiceCustomization",
    permission: "invoiceDesign",
    group: "billing",
    desc: "ইনভয়েসের লেআউট ও ডিজাইন",
  }),
];
