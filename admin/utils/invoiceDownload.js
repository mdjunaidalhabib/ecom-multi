import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import InvoiceRenderer from "../components/invoiceDesigner/InvoiceRenderer";

// ✅ কন্টেইনারের ভেতরের সব <img> (লোগো ইত্যাদি) সত্যিকারের লোড হওয়া পর্যন্ত
// অপেক্ষা করে — শুধু ২টা animation frame অপেক্ষা করলে cross-origin (R2)
// ইমেজের নেটওয়ার্ক ফেচ শেষ হওয়ার আগেই html2canvas ক্যাপচার করে ফেলত,
// ফলে প্রিভিউতে ঠিক দেখালেও ডাউনলোড করা PDF-এ লোগো মিসিং থাকত।
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

// ✅ browser-এই PDF তৈরি করে ও ডাউনলোড করে দেয় — সার্ভার শুধু order+template
// JSON দেয়, কোনো PDF জেনারেট/সেভ করে না। editor-এ যে InvoiceRenderer
// দেখা যায় ঠিক সেটাই এখানে অফ-স্ক্রিনে রেন্ডার করে html2canvas দিয়ে
// স্ন্যাপশট নেওয়া হয় — তাই প্রিভিউ আর ডাউনলোড করা PDF সবসময় মেলে।
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
      requestAnimationFrame(resolve); // DOM মাউন্ট হওয়া পর্যন্ত এক ফ্রেম অপেক্ষা
    });
    await waitForImages(container);

    const pageNode = container.querySelector("[data-invoice-page]");
    const canvas = await html2canvas(pageNode, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

    const pdf = new jsPDF({ unit: "px", format: [pageSize.width, pageSize.height] });
    const pageHeightPx = pageSize.height;
    const totalCanvasHeightPx = canvas.height / 2; // scale:2 ছিল

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
