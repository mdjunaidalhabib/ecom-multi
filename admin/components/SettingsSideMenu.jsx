"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingsChildren } from "./menuConfig";
import { useShopFeatures, filterByFeature } from "../hooks/useShopFeatures";

export default function SettingsSideMenu() {
  const pathname = usePathname();
  const features = useShopFeatures();
  const items = filterByFeature(settingsChildren, features);

  return (
    <nav className="shrink-0 md:w-56 bg-white rounded-xl border border-gray-200 p-2 md:sticky md:top-4 md:self-start">
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible sidebar-scroll">
        {items.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                active
                  ? "bg-rose-50 font-semibold text-rose-600"
                  : "text-gray-600 hover:bg-rose-50"
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
