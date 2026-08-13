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
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
      <span className="text-xs text-gray-500">
        মোট {total} টি — পেজ {page}/{totalPages}
      </span>

      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← আগে
        </button>

        {start > 1 && <span className="px-1 text-xs text-gray-400">…</span>}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md border ${
              p === page
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && <span className="px-1 text-xs text-gray-400">…</span>}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          পরে →
        </button>
      </div>
    </div>
  );
}
