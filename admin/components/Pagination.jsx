"use client";

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
      <span className="text-[11px] text-gray-500 dark:text-slate-400">
        মোট {total} টি — পেজ {page}/{totalPages}
      </span>

      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 text-[11px] font-bold rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← আগে
        </button>

        {start > 1 && <span className="px-1 text-[11px] text-gray-400 dark:text-slate-500">…</span>}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`px-2 py-1 text-[11px] font-bold rounded-md border ${
              p === page
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && <span className="px-1 text-[11px] text-gray-400 dark:text-slate-500">…</span>}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1 text-[11px] font-bold rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          পরে →
        </button>
      </div>
    </div>
  );
}
