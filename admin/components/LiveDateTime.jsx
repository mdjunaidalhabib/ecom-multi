"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function LiveDateTime() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
      <Clock size={14} className="text-indigo-500 dark:text-indigo-400" />
      <span>{dateStr}</span>
      <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
      <span className="tabular-nums text-slate-700 dark:text-slate-300">{timeStr}</span>
    </div>
  );
}
