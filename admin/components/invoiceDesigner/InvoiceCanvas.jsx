"use client";

import InvoiceRenderer from "./InvoiceRenderer";
import useDragResize from "./useDragResize";
import { ELEMENT_LABELS } from "../../lib/invoiceTemplateContract";

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const HANDLE_CURSOR = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  e: "ew-resize",
  se: "nwse-resize",
  s: "ns-resize",
  sw: "nesw-resize",
  w: "ew-resize",
};

// ✅ InvoiceRenderer কে editable মোডে wrap করে — ড্র্যাগ/রিসাইজ/সিলেকশন
// chrome যোগ করে। শুধু chrome-টাই আলাদা, ভেতরের element rendering পুরোপুরি
// InvoiceRenderer থেকে আসে — তাই এডিটর প্রিভিউ আর PDF আউটপুট সবসময় মেলে।
export default function InvoiceCanvas({
  template,
  order,
  shop,
  scale = 1,
  selectedId,
  onSelect,
  onChangeElement,
}) {
  const pageSize = template?.pageSize || { width: 794, height: 1123 };
  const { startDrag, startResize } = useDragResize({
    scale,
    pageSize,
    onChange: onChangeElement,
  });

  // ✅ পুরো ক্যানভাস CSS transform: scale() দিয়ে ছোট করা হয় (মোবাইলে scale
  // অনেক কম হতে পারে) — তাই selection border/label/resize-handle এর নিজস্ব
  // সাইজ 1/scale দিয়ে গুণ করা হচ্ছে, ফলে parent scale যা-ই হোক না কেন,
  // এগুলো স্ক্রিনে সবসময় একই (touch-friendly) সাইজে দেখাবে।
  const inv = 1 / scale;
  const borderWidth = 2 * inv;
  const handleBox = 20 * inv;
  const handleOffset = -handleBox / 2;

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
      <InvoiceRenderer template={template} order={order} shop={shop} editable>
        {(el) => {
          const isSelected = el.id === selectedId;
          return (
            <div
              onPointerDown={(e) => {
                onSelect(el.id);
                startDrag(e, el.id, el);
              }}
              style={{
                position: "absolute",
                inset: 0,
                cursor: "move",
                touchAction: "none",
                border: isSelected
                  ? `${borderWidth}px solid #4f46e5`
                  : `${inv}px dashed transparent`,
              }}
              title={ELEMENT_LABELS[el.id]}
            >
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: -18 * inv,
                    left: 0,
                    fontSize: 11 * inv,
                    background: "#4f46e5",
                    color: "#fff",
                    padding: `${1 * inv}px ${6 * inv}px`,
                    borderRadius: 4 * inv,
                    whiteSpace: "nowrap",
                  }}
                >
                  {ELEMENT_LABELS[el.id]}
                </span>
              )}
              {isSelected &&
                HANDLES.map((h) => (
                  <span
                    key={h}
                    onPointerDown={(e) => startResize(e, el.id, el, h)}
                    style={{
                      position: "absolute",
                      width: handleBox,
                      height: handleBox,
                      background: "#4f46e5",
                      borderRadius: 3 * inv,
                      touchAction: "none",
                      cursor: HANDLE_CURSOR[h],
                      top: h.includes("n") ? handleOffset : h.includes("s") ? "auto" : "50%",
                      bottom: h.includes("s") ? handleOffset : "auto",
                      left: h.includes("w") ? handleOffset : h.includes("e") ? "auto" : "50%",
                      right: h.includes("e") ? handleOffset : "auto",
                      transform: `translate(${h === "n" || h === "s" ? "-50%" : "0"}, ${h === "e" || h === "w" ? "-50%" : "0"})`,
                    }}
                  />
                ))}
            </div>
          );
        }}
      </InvoiceRenderer>
    </div>
  );
}
