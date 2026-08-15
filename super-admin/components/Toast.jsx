"use client";
import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideUp animate-fadeIn">
      <div
        className={`${color} text-white px-5 py-3 rounded-lg shadow-xl dark:shadow-black/40 text-sm font-medium flex items-center gap-2 ring-1 ring-black/5 dark:ring-white/10`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}
