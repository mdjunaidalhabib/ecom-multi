"use client";

import { useEffect, useRef, useState } from "react";
import InvoiceRenderer from "./InvoiceRenderer";
import { normalizeTemplate } from "../../lib/invoiceTemplateContract";

// ✅ কন্টেইনারের ভেতরের সব <img> (লোগো ইত্যাদি) সত্যিকারের লোড হওয়া পর্যন্ত
// অপেক্ষা করে — নাহলে headless Chromium ইমেজের নেটওয়ার্ক ফেচ শেষ হওয়ার আগেই
// PDF ক্যাপচার করে ফেলতে পারে (আগে html2canvas ফ্লোতেও একই কারণে ছিল, দেখুন
// utils/invoiceDownload.js এর পুরনো waitForImages)।
function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true }); // ভাঙা ইমেজে চিরকাল আটকে না থাকার জন্য
          }),
    ),
  );
}

/**
 * ✅ headless Chromium (backend/src/services/invoiceExportService.js)
 * `[data-ready="true"]` সেট হওয়া পর্যন্ত অপেক্ষা করে তারপর PDF ক্যাপচার করে —
 * ইমেজ + "Hind Siliguri" ওয়েব ফন্ট আসলেই লোড/ব্যবহারযোগ্য হওয়ার আগে সেট
 * করলে PDF-এ লোগো মিসিং বা ভুল ফন্ট মেট্রিক্স দিয়ে টেক্সট আঁকা হতে পারত।
 */
export default function InvoicePrintClient({ order, template, shop }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const normalized = normalizeTemplate(template);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (containerRef.current) await waitForImages(containerRef.current);
      if (document.fonts?.ready) await document.fonts.ready;
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={containerRef} data-ready={ready ? "true" : undefined}>
      <InvoiceRenderer template={normalized} order={order} shop={shop} />
    </div>
  );
}
