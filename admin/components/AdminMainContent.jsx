"use client";

import { usePathname } from "next/navigation";
import SettingsSideMenu from "./SettingsSideMenu";
import { navItems, settingsChildren } from "./menuConfig";
import useCurrentAdmin from "../hooks/useCurrentAdmin";
import useShopFeatures from "../hooks/useShopFeatures";

const allNavItems = [...navItems, ...settingsChildren];

// ✅ pathname থেকে menuConfig-এর matching item বের করে (nested/dynamic
// রুট যেমন /admin/landing-pages/[id]-ও ধরার জন্য prefix ম্যাচ ব্যবহার হয়)।
function findMatchingItem(pathname) {
  return allNavItems.find(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`),
  );
}

function AccessDenied({ title, message }) {
  return (
    <div className="max-w-md mx-auto mt-16 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
      <p className="mb-3 text-3xl">🔒</p>
      <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-slate-200">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

// ✅ Settings-এর যেকোনো পেজে থাকলে পাশে সেটিংস মেনু স্থায়ীভাবে দেখায়,
// যাতে এক সেটিংস থেকে আরেক সেটিংসে সহজে যাওয়া যায়।
//
// ✅ এটাই একমাত্র জায়গা যেখানে *সব* admin পেজ প্রতিবার mount হয় (দেখুন
// admin/layout.js) — তাই role/permission/feature গেট এখানে কেন্দ্রীভূত করা
// হয়েছে, যাতে Sidebar-এ আইটেম হাইড থাকলেও staff/role-এর জন্য বন্ধ থাকা
// সেকশনে সরাসরি URL দিয়ে গেলে পেজের আসল কন্টেন্ট flash না করে। admin/
// features প্রতি mount-এ (হার্ড রিফ্রেশ/নতুন ট্যাব) fresh network কল দিয়ে
// আনা হয় (কোনো localStorage cache নেই) — তাই কোনো admin অন্য admin-এর role/
// permission/plan-feature বদলে দিলে, ইউজারের পরের রিফ্রেশেই সেটা প্রতিফলিত
// হয়, লগআউট-লগইন ছাড়াই।
export default function AdminMainContent({ children }) {
  const pathname = usePathname();
  const admin = useCurrentAdmin();
  const features = useShopFeatures();

  const isSettingsArea =
    pathname === "/admin/settings" ||
    settingsChildren.some((item) => item.href === pathname);

  const item = findMatchingItem(pathname);

  // অ্যাক্সেস ডেটা এখনো লোড হয়নি — গেটেড পেজ হলে এক মুহূর্তের জন্যও আসল
  // কন্টেন্ট flash না করার জন্য কিছু রেন্ডার করা হয় না।
  if (item?.roles && admin === null) return null;
  if (item?.permission && admin === null) return null;
  if (item?.feature && features === null) return null;

  if (item?.roles && admin && !item.roles.includes(admin.role)) {
    return (
      <AccessDenied
        title="এই সেকশনে আপনার অ্যাক্সেস নেই"
        message="প্রয়োজনে শপ Admin-এর সাথে যোগাযোগ করুন।"
      />
    );
  }

  if (
    item?.permission &&
    admin?.role === "staff" &&
    !admin.permissions?.[item.permission]?.view
  ) {
    return (
      <AccessDenied
        title="এই সেকশনে আপনার অ্যাক্সেস নেই"
        message="প্রয়োজনে শপ Admin-এর সাথে যোগাযোগ করুন।"
      />
    );
  }

  if (item?.feature && features && !features[item.feature]) {
    return (
      <AccessDenied
        title="এই ফিচারটি আপনার বর্তমান প্ল্যানে নেই"
        message="প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।"
      />
    );
  }

  if (!isSettingsArea) return children;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <SettingsSideMenu />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
