"use client";

import { usePathname } from "next/navigation";
import SettingsSideMenu from "./SettingsSideMenu";
import { settingsChildren } from "./menuConfig";

// ✅ Settings-এর যেকোনো পেজে থাকলে পাশে সেটিংস মেনু স্থায়ীভাবে দেখায়,
// যাতে এক সেটিংস থেকে আরেক সেটিংসে সহজে যাওয়া যায়
export default function AdminMainContent({ children }) {
  const pathname = usePathname();
  const isSettingsArea =
    pathname === "/admin/settings" ||
    settingsChildren.some((item) => item.href === pathname);

  if (!isSettingsArea) return children;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <SettingsSideMenu />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
