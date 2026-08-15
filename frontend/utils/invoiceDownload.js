import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import InvoiceRenderer from "../components/invoiceDesigner/InvoiceRenderer";

// ✅ browser-এই PDF তৈরি করে ও ডাউনলোড করে দেয় (admin/utils/invoiceDownload.js
// এর ডুপ্লিকেট — কোনো শেয়ার্ড প্যাকেজ নেই এই monorepo-তে)।
export async function downloadInvoicePdf(order, shop, template) {
  const pageSize = template?.pageSize || { width: 794, height: 1123 };

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    await new Promise((resolve) => {
      root.render(createElement(InvoiceRenderer, { template, order, shop }));
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    const pageNode = container.querySelector("[data-invoice-page]");
    const canvas = await html2canvas(pageNode, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

    const pdf = new jsPDF({ unit: "px", format: [pageSize.width, pageSize.height] });
    const pageHeightPx = pageSize.height;
    const totalCanvasHeightPx = canvas.height / 2;

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < totalCanvasHeightPx) {
      const sliceHeightPx = Math.min(pageHeightPx, totalCanvasHeightPx - renderedHeight);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx * 2;
      const ctx = sliceCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        renderedHeight * 2,
        canvas.width,
        sliceHeightPx * 2,
        0,
        0,
        canvas.width,
        sliceHeightPx * 2,
      );

      const imgData = sliceCanvas.toDataURL("image/png");
      if (pageIndex > 0) pdf.addPage([pageSize.width, pageSize.height]);
      pdf.addImage(imgData, "PNG", 0, 0, pageSize.width, sliceHeightPx);

      renderedHeight += sliceHeightPx;
      pageIndex += 1;
    }

    const orderRef = order?.orderNumber ?? String(order?._id || "").slice(-6).toUpperCase();
    pdf.save(`invoice-${orderRef}.pdf`);
  } finally {
    root.unmount();
    container.remove();
  }
}

export default downloadInvoicePdf;
