"use client";

import { useRef, useCallback } from "react";

// ✅ ফ্রি-ড্র্যাগ ক্যানভাসের জন্য plain pointer-event based drag+resize hook।
// @dnd-kit (এই রেপোতে আগে থেকেই আছে) মূলত sortable list-এর জন্য — এখানে
// দরকার arbitrary x/y placement + 8-handle resize, তাই ছোট কাস্টম hook-ই
// সহজ ও কোনো নতুন dependency ছাড়াই যথেষ্ট।
//
// `scale` = ক্যানভাস অন-স্ক্রিন কতটা ছোট করে দেখানো হচ্ছে (CSS transform:
// scale()) — পয়েন্টার মুভমেন্টের px কে আসল টেমপ্লেট coordinate-এ বদলাতে লাগে।
export function useDragResize({ scale = 1, pageSize, onChange }) {
  const dragState = useRef(null);

  const clamp = useCallback(
    (x, y, width, height) => {
      const cx = Math.min(Math.max(x, 0), Math.max(0, pageSize.width - width));
      const cy = Math.min(Math.max(y, 0), Math.max(0, pageSize.height - height));
      return { x: cx, y: cy };
    },
    [pageSize],
  );

  const handlePointerMove = useCallback(
    (e) => {
      const state = dragState.current;
      if (!state) return;

      const dx = (e.clientX - state.startClientX) / scale;
      const dy = (e.clientY - state.startClientY) / scale;

      if (state.mode === "move") {
        const { x, y } = clamp(state.startX + dx, state.startY + dy, state.startWidth, state.startHeight);
        onChange(state.id, { x, y });
      } else {
        let { x, y, width, height } = state;
        width = state.startWidth;
        height = state.startHeight;
        x = state.startX;
        y = state.startY;

        const minSize = 20;
        if (state.handle.includes("e")) width = Math.max(minSize, state.startWidth + dx);
        if (state.handle.includes("s")) height = Math.max(minSize, state.startHeight + dy);
        if (state.handle.includes("w")) {
          width = Math.max(minSize, state.startWidth - dx);
          x = state.startX + (state.startWidth - width);
        }
        if (state.handle.includes("n")) {
          height = Math.max(minSize, state.startHeight - dy);
          y = state.startY + (state.startHeight - height);
        }

        width = Math.min(width, pageSize.width - x);
        height = Math.min(height, pageSize.height - y);
        const clamped = clamp(x, y, width, height);

        onChange(state.id, { x: clamped.x, y: clamped.y, width, height });
      }
    },
    [scale, clamp, onChange, pageSize],
  );

  const stopDrag = useCallback(() => {
    dragState.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDrag);
  }, [handlePointerMove]);

  const startDrag = useCallback(
    (e, id, current) => {
      e.preventDefault();
      e.stopPropagation();
      dragState.current = {
        mode: "move",
        id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: current.x,
        startY: current.y,
        startWidth: current.width,
        startHeight: current.height,
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDrag);
    },
    [handlePointerMove, stopDrag],
  );

  const startResize = useCallback(
    (e, id, current, handle) => {
      e.preventDefault();
      e.stopPropagation();
      dragState.current = {
        mode: "resize",
        id,
        handle,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: current.x,
        startY: current.y,
        startWidth: current.width,
        startHeight: current.height,
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDrag);
    },
    [handlePointerMove, stopDrag],
  );

  return { startDrag, startResize };
}

export default useDragResize;
