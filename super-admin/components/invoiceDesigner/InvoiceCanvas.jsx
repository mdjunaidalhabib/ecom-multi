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
                border: isSelected ? "2px solid #4f46e5" : "1px dashed transparent",
              }}
              title={ELEMENT_LABELS[el.id]}
            >
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: -18,
                    left: 0,
                    fontSize: 11,
                    background: "#4f46e5",
                    color: "#fff",
                    padding: "1px 6px",
                    borderRadius: 4,
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
                      width: 10,
                      height: 10,
                      background: "#4f46e5",
                      borderRadius: 2,
                      cursor: HANDLE_CURSOR[h],
                      top: h.includes("n") ? -5 : h.includes("s") ? "auto" : "50%",
                      bottom: h.includes("s") ? -5 : "auto",
                      left: h.includes("w") ? -5 : h.includes("e") ? "auto" : "50%",
                      right: h.includes("e") ? -5 : "auto",
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
