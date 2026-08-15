"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ✅ items[] কে item.section অনুযায়ী ক্রমানুসারে গ্রুপ করে — একই section
// এর পরপর আইটেমগুলো এক গ্রুপে থাকবে, section না থাকলে (undefined) নিজে
// একটা আলাদা গ্রুপ হবে (গ্রুপ লেবেল ছাড়াই রেন্ডার হয়)।
function groupBySection(items) {
  const groups = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) {
      last.items.push(item);
    } else {
      groups.push({ section: item.section, items: [item] });
    }
  }
  return groups;
}

export default function MenuBar({
  items,
  settingsChildren = [],
  onItemClick,
  vertical = true,
  collapsed = false,
}) {
  const pathname = usePathname();
  const groups = groupBySection(items);

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 pt-1 sidebar-scroll">
        <div
          className={`${
            vertical ? "flex-col space-y-4" : "flex-row space-x-2"
          } flex ${collapsed ? "items-center" : ""}`}
        >
          {groups.map((group, gi) => (
            <div
              key={`${group.section || "ungrouped"}-${gi}`}
              className={vertical ? "space-y-0.5 w-full" : "flex items-center gap-2"}
            >
              {group.section && !collapsed && (
                <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group.section}
                </p>
              )}
              <div className={vertical ? "space-y-0.5" : "flex items-center gap-2"}>
                {group.items.map(({ icon, label, href }) => {
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
                      className={`group relative flex items-center gap-3 py-2 rounded-lg transition-colors ${
                        collapsed ? "justify-center px-2" : "px-3"
                      } ${
                        active
                          ? "bg-indigo-500/15 font-semibold text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-400" />
                      )}
                      <span
                        className={`flex items-center justify-center w-5 h-5 shrink-0 ${
                          active ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-300"
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
          ))}
        </div>
      </div>
    </nav>
  );
}
