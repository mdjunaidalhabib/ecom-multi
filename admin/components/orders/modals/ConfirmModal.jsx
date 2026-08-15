"use client";

import ModalWrapper from "./ModalWrapper";

export default function ConfirmModal({ data, onClose }) {
  if (!data) return null;

  return (
    <ModalWrapper open={!!data}>
      <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-slate-100">{data.title}</h2>

      {data.description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-5">{data.description}</p>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
          Cancel
        </button>

        <button
          onClick={data.onConfirm}
          className={`px-4 py-2 rounded text-white ${
            data.danger ? "bg-red-600" : "bg-blue-600"
          }`}
        >
          {data.confirmText || "Confirm"}
        </button>
      </div>
    </ModalWrapper>
  );
}
