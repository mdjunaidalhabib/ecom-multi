"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ShieldCheck } from "lucide-react";

import MenuBar from "./MenuBar";
import { superAdminNavItems } from "./menuConfig";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapsed state from previous session
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const asideClass = `hidden md:flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-xl transition-all duration-300 ${
    collapsed ? "w-16 p-3" : "w-64 p-4"
  }`;

  return (
    <aside className={asideClass}>
      {/* ✅ Brand + collapse toggle — সাইডবারের ভেতরেই থাকে, বাইরে বেরোয় না */}
      <div
        className={`flex items-center shrink-0 ${
          collapsed ? "flex-col gap-2 pb-3" : "justify-between gap-2 px-1 pb-4"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/50">
            <ShieldCheck size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight truncate">
                Super Admin Console
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Platform Control
              </p>
            </div>
          )}
        </div>

        <button
          onClick={toggleCollapsed}
          title={collapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 shrink-0"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div className="mx-1 border-b border-white/10" />

      <div className="flex-1 flex flex-col min-h-0">
        <MenuBar items={superAdminNavItems} vertical={true} collapsed={collapsed} />
      </div>
    </aside>
  );
}
