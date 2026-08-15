import {
  STATUS_OPTIONS,
  STATUS_LABEL,
  STATUS_TEXT_COLOR,
} from "../shared/constants";

export default function StatusTabs({ tabStatus, setTabStatus }) {
  return (
    <>
      <button
        onClick={() => setTabStatus("")}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold border dark:border-slate-600 transition ${
          tabStatus === ""
            ? "bg-gray-900 dark:bg-slate-700 text-white"
            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
        }`}
      >
        All
      </button>

      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => setTabStatus(s)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border dark:border-slate-600 transition ${
            tabStatus === s
              ? "bg-blue-600 text-white"
              : `bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 ${STATUS_TEXT_COLOR[s]}`
          }`}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </>
  );
}
