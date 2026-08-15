"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuBar({ items, onItemClick, vertical = true, collapsed = false }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 pt-1 sidebar-scroll">
        <div
          className={`${
            vertical ? "flex-col space-y-0.5" : "flex-row space-x-2"
          } flex ${collapsed ? "items-center" : ""}`}
        >
          {items.map(({ icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onItemClick}
                title={collapsed ? label : undefined}
                className={`group relative flex items-center gap-3 py-2 rounded-lg transition-colors ${
                  collapsed ? "justify-center px-2" : "px-3"
                } ${
                  active
                    ? "bg-rose-500/15 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-rose-400" />
                )}
                <span
                  className={`flex items-center justify-center w-5 h-5 shrink-0 ${
                    active ? "text-rose-400" : "text-slate-400 group-hover:text-rose-300"
                  }`}
                >
                  {icon}
                </span>
                {!collapsed && <span className="text-sm">{label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
