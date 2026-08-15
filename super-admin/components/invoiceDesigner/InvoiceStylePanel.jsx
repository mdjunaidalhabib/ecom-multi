"use client";

import ImageUploader from "../ImageUploader";
import { ELEMENT_LABELS } from "../../lib/invoiceTemplateContract";

export const INVOICE_BG_IMAGE_RULE = {
  type: "image/webp",
  width: 1240,
  height: 1754,
  maxBytes: 300 * 1024,
  minQuality: 0.5,
  qualityStep: 0.05,
  strictLimit: false,
};

export default function InvoiceStylePanel({
  template,
  selectedId,
  onChangeElement,
  onChangeBackground,
  onUploadBackgroundFile,
  bgUploading,
}) {
  const element = template?.elements?.find((e) => e.id === selectedId);
  const background = template?.background || { type: "color", color: "#ffffff" };

  return (
    <div className="flex flex-col gap-5 text-sm">
      {/* ✅ Canvas / background controls */}
      <div className="border rounded-lg p-3 dark:border-slate-700">
        <h3 className="font-semibold mb-2">ব্যাকগ্রাউন্ড</h3>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => onChangeBackground({ type: "color" })}
            className={`px-2 py-1 rounded text-xs ${background.type === "color" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-slate-700"}`}
          >
            রং
          </button>
          <button
            type="button"
            onClick={() => onChangeBackground({ type: "image" })}
            className={`px-2 py-1 rounded text-xs ${background.type === "image" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-slate-700"}`}
          >
            ছবি
          </button>
        </div>

        {background.type === "color" ? (
          <input
            type="color"
            value={background.color || "#ffffff"}
            onChange={(e) => onChangeBackground({ color: e.target.value })}
            className="w-full h-8"
          />
        ) : (
          <ImageUploader
            preview={background.imageUrl}
            rule={INVOICE_BG_IMAGE_RULE}
            shape="square"
            label="ব্যাকগ্রাউন্ড ইমেজ"
            hint={bgUploading ? "⏳ আপলোড হচ্ছে..." : ""}
            onFileReady={(file) => file && onUploadBackgroundFile?.(file)}
          />
        )}
      </div>

      {/* ✅ Selected element controls */}
      {!element ? (
        <p className="text-gray-400 text-xs">একটা এলিমেন্ট সিলেক্ট করো এডিট করার জন্য</p>
      ) : (
        <div className="border rounded-lg p-3 dark:border-slate-700 flex flex-col gap-3">
          <h3 className="font-semibold">{ELEMENT_LABELS[element.id]}</h3>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={element.visible}
              onChange={(e) => onChangeElement(element.id, { visible: e.target.checked })}
            />
            দৃশ্যমান
          </label>

          {element.id !== "logo" && (
            <>
              <div>
                <label className="block text-xs mb-1">Font size ({element.fontSize}px)</label>
                <input
                  type="range"
                  min={8}
                  max={40}
                  value={element.fontSize}
                  onChange={(e) => onChangeElement(element.id, { fontSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">টেক্সট কালার</label>
                <input
                  type="color"
                  value={element.color}
                  onChange={(e) => onChangeElement(element.id, { color: e.target.value })}
                  className="w-full h-8"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChangeElement(element.id, { fontWeight: element.fontWeight === "bold" ? "normal" : "bold" })
                  }
                  className={`px-2 py-1 rounded text-xs font-bold ${element.fontWeight === "bold" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-slate-700"}`}
                >
                  B
                </button>
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onChangeElement(element.id, { textAlign: align })}
                    className={`px-2 py-1 rounded text-xs ${element.textAlign === align ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-slate-700"}`}
                  >
                    {align === "left" ? "⇤" : align === "center" ? "⇔" : "⇥"}
                  </button>
                ))}
              </div>
            </>
          )}

          {element.id === "footerText" && (
            <div>
              <label className="block text-xs mb-1">ফুটার টেক্সট</label>
              <textarea
                value={element.content}
                onChange={(e) => onChangeElement(element.id, { content: e.target.value })}
                rows={3}
                className="w-full border rounded p-2 text-xs dark:bg-slate-800 dark:border-slate-600"
                placeholder="যেমন: ধন্যবাদ আমাদের সাথে কেনাকাটার জন্য!"
              />
            </div>
          )}

          {element.id === "itemsTable" && (
            <ItemsTableColumnsEditor
              columns={element.columns || []}
              onChange={(columns) => onChangeElement(element.id, { columns })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ItemsTableColumnsEditor({ columns, onChange }) {
  const sorted = [...columns].sort((a, b) => a.order - b.order);

  const updateColumn = (key, patch) => {
    onChange(columns.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  const move = (key, dir) => {
    const idx = sorted.findIndex((c) => c.key === key);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[idx].order, reordered[swapWith].order] = [reordered[swapWith].order, reordered[idx].order];
    onChange(reordered);
  };

  return (
    <div>
      <label className="block text-xs mb-1 font-semibold">কলাম</label>
      <div className="flex flex-col gap-2">
        {sorted.map((col, i) => (
          <div key={col.key} className="flex items-center gap-1 text-xs border-b pb-1 dark:border-slate-700">
            <input
              type="checkbox"
              checked={col.visible}
              onChange={(e) => updateColumn(col.key, { visible: e.target.checked })}
            />
            <input
              type="text"
              value={col.label}
              onChange={(e) => updateColumn(col.key, { label: e.target.value })}
              className="w-16 border rounded px-1 py-0.5 dark:bg-slate-800 dark:border-slate-600"
            />
            <input
              type="number"
              value={col.width}
              min={20}
              onChange={(e) => updateColumn(col.key, { width: Number(e.target.value) })}
              className="w-14 border rounded px-1 py-0.5 dark:bg-slate-800 dark:border-slate-600"
              title="width (px)"
            />
            <button type="button" onClick={() => move(col.key, -1)} disabled={i === 0} className="px-1 disabled:opacity-30">
              ↑
            </button>
            <button type="button" onClick={() => move(col.key, 1)} disabled={i === sorted.length - 1} className="px-1 disabled:opacity-30">
              ↓
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
