"use client";

export default function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -450px 0;
          }
          100% {
            background-position: 450px 0;
          }
        }
        .shimmer {
          background: linear-gradient(
            to right,
            #f0f0f0 8%,
            #ffffff 18%,
            #f0f0f0 33%
          );
          background-size: 800px 104px;
          animation: shimmer 1.3s linear infinite;
        }
        :global(.dark) .shimmer {
          background: linear-gradient(
            to right,
            #1e293b 8%,
            #334155 18%,
            #1e293b 33%
          );
          background-size: 800px 104px;
        }
      `}</style>

      {/* Desktop Skeleton */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              {["User ID", "Name", "Email", "Avatar"].map((h) => (
                <th key={h} className="p-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-t dark:border-slate-700/60">
                {Array.from({ length: 4 }).map((_, j) => (
                  <td key={j} className="p-3">
                    <div className="w-full h-4 shimmer rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 shadow-sm flex items-center gap-3"
          >
            <div className="w-12 h-12 shimmer rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="w-2/3 h-4 shimmer rounded"></div>
              <div className="w-1/2 h-3 shimmer rounded"></div>
              <div className="w-1/3 h-3 shimmer rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
