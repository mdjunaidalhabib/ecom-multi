"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminHeaderCard from "./AdminHeaderCard";

export default function MenuBar({
  items,
  settingsChildren = [],
  onItemClick,
  vertical = true,
  collapsed = false,
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className={collapsed ? "shrink-0 pt-1 pb-2" : "shrink-0 p-2"}>
        <AdminHeaderCard collapsed={collapsed} />
      </div>
      {!collapsed && <div className="mx-2 mb-1 border-b border-gray-100" />}

      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 sidebar-scroll">
        <div
          className={`${
            vertical ? "flex-col space-y-1" : "flex-row space-x-2"
          } flex ${collapsed ? "items-center" : ""}`}
        >
          {items.map(({ icon, label, href }) => {
            const active =
              href === "/admin/settings"
                ? pathname === href ||
                  settingsChildren.some((child) => child.href === pathname)
                : pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onItemClick}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-2 py-2 rounded transition ${
                  collapsed ? "justify-center px-2" : "px-4"
                } ${
                  active
                    ? "bg-rose-50 font-semibold text-rose-600"
                    : "hover:bg-rose-50"
                }`}
              >
                <span className="flex items-center justify-center w-5 h-5 shrink-0">
                  {icon}
                </span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
