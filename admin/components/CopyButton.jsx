"use client";

import { useState } from "react";

/**
 * ✅ Small 1-click copy-to-clipboard button.
 * Used for TrxID / tracking IDs / anything admin needs to quickly copy.
 */
export default function CopyButton({ value, onCopied, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    if (!value || value === "—") return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // fallback for older/insecure contexts
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      setCopied(true);
      onCopied?.(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      onCopied?.(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value || value === "—"}
      title="Copy"
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border transition shrink-0 ${
        copied
          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20"
          : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
