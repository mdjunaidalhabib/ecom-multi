import { createElement } from "react";
import toast from "react-hot-toast";

// ✅ সার্ভার-সাইড PDF এক্সপোর্ট (headless Chromium — backend/src/services/
// invoiceExportService.js) — আগে এখানে html2canvas+jsPDF দিয়ে ব্রাউজারেই
// রাস্টারাইজ করা হতো, কিন্তু জটিল টেক্সট/বাংলা ফন্ট রেন্ডারে সেটা কম
// নির্ভরযোগ্য। এখন সার্ভার একটা রিয়েল Chromium দিয়ে PDF জেনারেট করে।
// admin/utils/invoiceDownload.js এর ডুপ্লিকেট — কোনো শেয়ার্ড প্যাকেজ নেই এই
// monorepo-তে।
//
// ⚠️ blob: URL + <a download> দিয়ে ডাউনলোড ট্রিগার করা হয় না — Internet
// Download Manager-এর মতো ব্রাউজার-ইন্টিগ্রেটেড ডাউনলোড ম্যানেজার প্রতিটা
// ডাউনলোড ক্লিক ইন্টারসেপ্ট করে ফেলে কিন্তু blob: URL নেটওয়ার্কে রিফেচ করতে
// পারে না — ফলে ডাউনলোড সাইলেন্টলি ফেইল করে, কোনো error দেখাও যায় না। তাই
// এখানে দুই ধাপে করা হয়: POST দিয়ে PDF জেনারেট করে একটা downloadId নেওয়া,
// তারপর সেই downloadId দিয়ে একটা রিয়েল GET URL-এ ব্রাউজারকে নেভিগেট করানো।

// ✅ toast.custom() react-hot-toast এর ডিফল্ট toast স্টাইল দেয় না — যা দেওয়া
// হয় হুবহু সেটাই রেন্ডার করে, তাই নিজস্ব background/padding/shadow দিতে হয়।
// সাদা background পেজের সাথে মিশে/flat লাগছিল, তারপর dark slate ট্রাই করেও
// পছন্দ হয়নি — শেষে সবুজ কার্ড ব্যবহার করা হলো।
function renderProgressToast(onCancel) {
  return createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#15803d",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        fontSize: 14,
      },
    },
    createElement("span", null, "🧾 ইনভয়েস PDF তৈরি হচ্ছে..."),
    createElement(
      "button",
      {
        onClick: onCancel,
        style: {
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        },
      },
      "বাতিল",
    ),
  );
}

// ✅ একটা লোডিং toast (ক্যানসেল বাটনসহ) দিয়ে শুরু হয় — বড়/ধীর কানেকশনে PDF
// তৈরি হতে কয়েক সেকেন্ড লাগতে পারে, ইউজার চাইলে মাঝপথে বাতিল করতে পারবে
// (fetch abort করলেই সার্ভারও চলমান Chromium ট্যাব বন্ধ করে দেয়, দেখুন
// backend/src/routes/public/invoiceExport.routes.js)।
export async function downloadInvoicePdf(order) {
  const orderId = order?._id;
  if (!orderId) throw new Error("Order id missing");

  const controller = new AbortController();
  const toastId = toast.custom(renderProgressToast(() => {
    controller.abort();
    toast.dismiss(toastId);
  }), { duration: Infinity });

  try {
    const res = await fetch(`/api/invoices/${orderId}/export-pdf`, {
      method: "POST",
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || "ইনভয়েস PDF তৈরি করতে সমস্যা হয়েছে");
    }

    const { downloadId } = await res.json();
    const orderRef = order?.orderNumber ?? String(orderId).slice(-6).toUpperCase();

    toast.dismiss(toastId);
    toast.success("ইনভয়েস ডাউনলোড শুরু হয়েছে", { duration: 2500 });

    const link = document.createElement("a");
    link.href = `/api/invoices/export-pdf/${downloadId}`;
    link.download = `invoice-${orderRef}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    toast.dismiss(toastId);
    if (err.name === "AbortError") {
      toast("ডাউনলোড বাতিল করা হয়েছে", { icon: "🚫", duration: 2000 });
      return;
    }
    toast.error(err.message || "ইনভয়েস PDF তৈরি করতে সমস্যা হয়েছে");
    throw err;
  }
}

export default downloadInvoicePdf;
