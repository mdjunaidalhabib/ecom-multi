"use client";

import { useEffect, useState } from "react";
import { RotateCcw, X, Loader2 } from "lucide-react";

// ✅ Final status (Cancelled/Delivered) দেওয়ার পর কয়েক সেকেন্ড "Undo" অপশন —
// ভুল ক্লিক সাথে সাথে ঠিক করার জন্য (backend-এ এটা PATCH /revert)
const VISIBLE_MS = 15000;

export default function UndoSnackbar({ data, onUndo, onClose }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setBusy(false);
    const t = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(t);
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-[55] flex justify-center sm:justify-end">
      <div className="flex items-center gap-3 rounded-xl bg-gray-900 dark:bg-slate-700 text-white shadow-2xl px-4 py-3 text-sm max-w-full">
        <span className="truncate">{data.message}</span>
        <button
          onClick={async () => {
            setBusy(true);
            try {
              await onUndo(data);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="shrink-0 inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Undo
        </button>
        <button
          onClick={onClose}
          className="shrink-0 text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
