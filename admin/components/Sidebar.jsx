"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import MenuBar from "./MenuBar";
import { navItems, settingsChildren, superAdminNavItems } from "./menuConfig";
import useAdminMe from "../hooks/useAdminMe";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { loading, isSuperAdmin } = useAdminMe();

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

  const asideClass = `hidden md:flex flex-col h-screen bg-white shadow-lg relative transition-all duration-300 ${
    collapsed ? "w-16 p-3" : "w-60 p-4"
  }`;

  // Role is loaded from /admin/me. Until it arrives, render only a skeleton so
  // a super admin never briefly sees the normal admin/shop menu items.
  if (loading) {
    return (
      <aside className={asideClass} aria-busy="true" aria-label="Loading menu">
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
          className="absolute -right-3.5 top-9 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-300 shadow-md text-gray-600 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="flex-1 min-h-0 animate-pulse">
          <div
            className={`mt-2 rounded-xl bg-gray-200 ${
              collapsed ? "h-10 w-10" : "h-20 w-full"
            }`}
          />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`h-9 rounded-lg bg-gray-100 ${
                  collapsed ? "w-10" : "w-full"
                }`}
              />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Superadmin শুধু platform-level Dashboard/Shops/Shop Trash/Profile দেখবে;
  // shop-specific menu নয়।
  const items = isSuperAdmin ? superAdminNavItems : navItems;
  const showSettings = !isSuperAdmin;

  return (
    <aside className={asideClass}>
      <button
        onClick={toggleCollapsed}
        title={collapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
        className="absolute -right-3.5 top-9 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-300 shadow-md text-gray-600 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex-1 flex flex-col min-h-0">
        <MenuBar
          items={items}
          settingsChildren={showSettings ? settingsChildren : []}
          vertical={true}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
