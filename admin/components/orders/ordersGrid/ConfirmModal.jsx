"use client";

export default function ConfirmModal({ title, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 w-[280px] space-y-3 border border-transparent dark:border-slate-700">
        <div className="font-semibold text-center text-gray-900 dark:text-slate-100">{title}</div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded py-2 text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
