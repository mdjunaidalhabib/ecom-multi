"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingsChildren } from "./menuConfig";
import {
  useShopFeatures,
  filterByFeature,
  filterByPermission,
} from "../hooks/useShopFeatures";
import { useCurrentAdmin } from "../hooks/useCurrentAdmin";

export default function SettingsSideMenu() {
  const pathname = usePathname();
  const features = useShopFeatures();
  const admin = useCurrentAdmin();
  const items = filterByPermission(filterByFeature(settingsChildren, features), admin);

  return (
    <nav className="shrink-0 md:w-56 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-2 md:sticky md:top-4 md:self-start transition-colors">
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible sidebar-scroll">
        {items.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                active
                  ? "bg-rose-50 dark:bg-rose-500/10 font-semibold text-rose-600 dark:text-rose-400"
                  : "text-gray-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
