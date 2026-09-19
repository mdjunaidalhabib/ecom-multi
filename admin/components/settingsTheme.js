// ✅ Settings গ্রুপের রঙ। Tailwind v4 dynamic class চেনে না, তাই প্রতিটা ক্লাস
// পুরো স্ট্রিং হিসেবে লেখা। `tone` key আসে menuConfig.jsx এর settingsGroups থেকে।
export const settingsTones = {
  indigo: {
    dot: "bg-indigo-500",
    tile: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    tileActive:
      "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30",
    rowActive: "bg-indigo-50/80 dark:bg-indigo-500/10",
    bar: "bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    cardHover:
      "hover:border-indigo-300 hover:shadow-indigo-500/10 dark:hover:border-indigo-500/40",
    cardTileHover: "group-hover:bg-indigo-600 group-hover:text-white",
  },
  violet: {
    dot: "bg-violet-500",
    tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    tileActive:
      "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/30",
    rowActive: "bg-violet-50/80 dark:bg-violet-500/10",
    bar: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    cardHover:
      "hover:border-violet-300 hover:shadow-violet-500/10 dark:hover:border-violet-500/40",
    cardTileHover: "group-hover:bg-violet-600 group-hover:text-white",
  },
  emerald: {
    dot: "bg-emerald-500",
    tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    tileActive:
      "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
    rowActive: "bg-emerald-50/80 dark:bg-emerald-500/10",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    cardHover:
      "hover:border-emerald-300 hover:shadow-emerald-500/10 dark:hover:border-emerald-500/40",
    cardTileHover: "group-hover:bg-emerald-600 group-hover:text-white",
  },
  amber: {
    dot: "bg-amber-500",
    tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    tileActive:
      "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30",
    rowActive: "bg-amber-50/80 dark:bg-amber-500/10",
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    cardHover:
      "hover:border-amber-300 hover:shadow-amber-500/10 dark:hover:border-amber-500/40",
    cardTileHover: "group-hover:bg-amber-600 group-hover:text-white",
  },
  rose: {
    dot: "bg-rose-500",
    tile: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    tileActive:
      "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30",
    rowActive: "bg-rose-50/80 dark:bg-rose-500/10",
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    cardHover:
      "hover:border-rose-300 hover:shadow-rose-500/10 dark:hover:border-rose-500/40",
    cardTileHover: "group-hover:bg-rose-600 group-hover:text-white",
  },
};
