"use client";

import { formatDateTime } from "../lib/utils";

const TYPE_BADGE_STYLE = {
  Shop: "bg-violet-100 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300",
};

const TYPE_ICON = {
  Shop: "🏪",
};

function getImage(it) {
  const d = it?.data || {};
  if (it.collectionName === "Shop") {
    return d.branding?.logo || "";
  }
  return "";
}

function getSubtitle(it) {
  const d = it?.data || {};
  if (it.collectionName === "Shop") {
    return `${d.domain || "No domain"} · ${d.status || "trial"}`;
  }
  return "";
}

function timeLeftLabel(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Deleting soon...";

  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h left`;
  }
  if (hours >= 1) return `${hours}h left`;

  const mins = Math.max(1, Math.floor(ms / (1000 * 60)));
  return `${mins}m left`;
}

export default function TrashCard({ item, busy, onRestore, onDelete }) {
  const image = getImage(item);
  const subtitle = getSubtitle(item);
  const badgeStyle =
    TYPE_BADGE_STYLE[item.collectionName] ||
    "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300";

  return (
    <div className="relative border border-gray-200 dark:border-slate-700 rounded-xl shadow-md dark:shadow-black/30 p-4 flex flex-col bg-white dark:bg-slate-900 hover:shadow-lg transition opacity-90">
      {/* 🖼️ Image */}
      <div className="w-full aspect-square overflow-hidden rounded-lg mb-3 relative bg-gray-50 dark:bg-slate-800">
        {image ? (
          <img
            src={image}
            alt={item.label}
            className="w-full h-full object-cover grayscale-[15%]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-xs">
            No Image
          </div>
        )}

        {/* Deleted overlay */}
        <div className="absolute inset-0 bg-black/10" />

        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle}`}
        >
          {TYPE_ICON[item.collectionName] || "🗑️"} {item.collectionName}
        </span>

        <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white">
          {timeLeftLabel(item.expiresAt)}
        </span>
      </div>

      {/* 📋 Info */}
      <h2 className="font-semibold text-lg truncate text-gray-800 dark:text-slate-100">
        {item.label || "Untitled"}
      </h2>

      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{subtitle}</p>
      )}

      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
        Deleted: {formatDateTime(item.deletedAt)}
      </p>

      {/* 🎯 Buttons */}
      <div className="mt-auto pt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onRestore();
          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          ♻️ Restore
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          🗑 মুছুন
        </button>
      </div>
    </div>
  );
}
