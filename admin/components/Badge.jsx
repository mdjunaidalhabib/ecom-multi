export default function Badge({ children, type }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 sm:py-0.5 text-[10px] font-bold border whitespace-nowrap w-fit uppercase tracking-tighter";

  const colors = {
    pending: "border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
    ready_to_delivery: "border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
    send_to_courier: "border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
    delivered: "border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10",
    cancelled: "border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
  };

  return (
    <span
      className={`${base} ${
        colors[type] || "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800"
      }`}
    >
      {children}
    </span>
  );
}
