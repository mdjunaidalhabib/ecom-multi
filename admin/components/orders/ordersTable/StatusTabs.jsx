import {
  STATUS_OPTIONS,
  STATUS_LABEL,
  STATUS_TEXT_COLOR,
} from "../shared/constants";

export default function StatusTabs({ tabStatus, setTabStatus, statusCount = {} }) {
  const allCount = Object.values(statusCount).reduce((a, b) => a + (b || 0), 0);

  return (
    <>
      <button
        onClick={() => setTabStatus("")}
        className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold border dark:border-slate-600 transition ${
          tabStatus === ""
            ? "bg-gray-900 dark:bg-slate-700 text-white"
            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
        }`}
      >
        All ({allCount})
      </button>

      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => setTabStatus(s)}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold border dark:border-slate-600 transition ${
            tabStatus === s
              ? "bg-blue-600 text-white"
              : `bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 ${STATUS_TEXT_COLOR[s]}`
          }`}
        >
          {STATUS_LABEL[s]} ({statusCount[s] || 0})
        </button>
      ))}
    </>
  );
}
