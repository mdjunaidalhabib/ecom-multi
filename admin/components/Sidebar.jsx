"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import MenuBar from "./MenuBar";
import { navItems, settingsChildren } from "./menuConfig";
import { useShopFeatures, filterByFeature } from "../hooks/useShopFeatures";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const features = useShopFeatures();

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
          items={filterByFeature(navItems, features)}
          settingsChildren={filterByFeature(settingsChildren, features)}
          vertical={true}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
