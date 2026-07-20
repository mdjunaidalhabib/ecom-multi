import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Order from "../../models/Order.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= PATHS ================= */

// backend/src/utils/invoice -> backend
const BACKEND_ROOT = path.join(__dirname, "../../../");
const PUBLIC_DIR = path.join(BACKEND_ROOT, "public");
const BG_IMAGE_PATH = path.join(PUBLIC_DIR, "invoice-template.png");
const FONT_PATH = path.join(BACKEND_ROOT, "src/fonts/NotoSansBengali-Regular.ttf");

// where generated PDFs are cached on disk
export const INVOICE_CACHE_DIR = path.join(BACKEND_ROOT, "uploads", "invoices");

function ensureCacheDir() {
  if (!fs.existsSync(INVOICE_CACHE_DIR)) {
    fs.mkdirSync(INVOICE_CACHE_DIR, { recursive: true });
  }
}

function getInvoiceFilePath(orderId) {
  return path.join(INVOICE_CACHE_DIR, `${orderId}.pdf`);
}

/* ================= LAYOUT CONSTANTS =================
   🔥 আগে puppeteer দিয়ে invoice.html + invoice.css থেকে PDF রেন্ডার হতো।
   এখন pdfkit দিয়ে সরাসরি PDF আঁকা হচ্ছে (headless Chrome লাগবে না — অনেক
   কম memory/CPU লাগে, একসাথে অনেক invoice জেনারেট হলেও সার্ভার crash করবে
   না)। পুরনো invoice.css এর px value গুলো pt-তে কনভার্ট করে (1px = 0.75pt)
   হুবহু একই লেআউট রাখা হয়েছে, যাতে ইনভয়েসের ডিজাইন আগের মতোই দেখায়। */

const PX = (v) => v * 0.75; // css px -> pdf pt

const PAGE_SIZE = "A4";
const PAGE_W = 595.28;
const PAGE_H = 841.89;

const HEADER_H = PX(330);
const ORDER_INFO_TOP = PX(230);
const ORDER_INFO_RIGHT_MARGIN = PX(60);
const ORDER_INFO_WIDTH = PX(260);

const BILLING_TOP = PX(180);
const BILLING_LEFT = PX(60);
const BILLING_WIDTH = PX(400);

const ITEMS_PADDING_X = PX(50);
const ITEMS_TOP_FIRST_PAGE = HEADER_H + PX(30);
const ITEMS_TOP_NEXT_PAGE = PX(60);
const ROW_H = PX(26);
const COL_SN = PX(40);

const SUMMARY_WIDTH = PX(190);
const SUMMARY_MARGIN_RIGHT = PX(50);
const SUMMARY_ROW_H = PX(18);

const NOTE_LEFT = PX(60);
const NOTE_WIDTH = PX(400);

const FOOTER_BOTTOM = PX(40);

const CONTENT_BOTTOM_LIMIT = PAGE_H - PX(90); // leave room for footer

const COLOR = {
  pink: "#ff36ac",
  rowAlt: "#ffe6f5",
  rowBorder: "#ffc7f3",
  dark: "#111827",
  gray: "#6b7280",
  noteBg: "#fff6cf",
  green: "#059669",
  amber: "#b45309",
  red: "#dc2626",
  white: "#ffffff",
};

const MIN_ITEM_ROWS = 8;

/* ================= HELPERS ================= */

function formatDateTime(date) {
  const d = new Date(date);
  return {
    datePart: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }),
    timePart: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    }),
  };
}

function shortOrderId(order) {
  if (order?.orderNumber != null) return `#${order.orderNumber}`;
  const id = order?._id ?? order;
  return `#${id.toString().slice(-6).toUpperCase()}`;
}

function truncate(text = "", max = 35) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function formatCurrency(num) {
  return Number(num || 0).toLocaleString("en-BD");
}

/* ================= DRAW HELPERS ================= */

function hasFont() {
  return fs.existsSync(FONT_PATH);
}

function setupDoc() {
  const doc = new PDFDocument({
    size: PAGE_SIZE,
    margin: 0,
    bufferPages: true, // needed so we can go back and stamp "Page X of Y" after all pages are drawn
  });

  if (hasFont()) {
    doc.registerFont("Body", FONT_PATH);
    doc.registerFont("Body-Bold", FONT_PATH); // font file has no separate bold weight; reuse regular
  }
  doc.font(hasFont() ? "Body" : "Helvetica");

  return doc;
}

function drawBackground(doc) {
  if (fs.existsSync(BG_IMAGE_PATH)) {
    doc.image(BG_IMAGE_PATH, 0, 0, { width: PAGE_W, height: PAGE_H });
  }
}

function addPage(doc) {
  doc.addPage({ size: PAGE_SIZE, margin: 0 });
  drawBackground(doc);
}

function drawOrderInfo(doc, order) {
  const { datePart, timePart } = formatDateTime(order.createdAt);
  const x = PAGE_W - ORDER_INFO_RIGHT_MARGIN - ORDER_INFO_WIDTH;
  let y = ORDER_INFO_TOP;

  doc.fillColor(COLOR.dark).fontSize(10.5);

  doc.text(`Order NO: ${shortOrderId(order)}`, x, y, { width: ORDER_INFO_WIDTH });
  y += 15;
  doc.text(`Date: ${datePart} ; ${timePart}`, x, y, { width: ORDER_INFO_WIDTH });
  y += 15;
  doc.text(`Payment: ${(order.paymentMethod || "cod").toUpperCase()}`, x, y, {
    width: ORDER_INFO_WIDTH,
  });
  y += 15;

  const isManualPayment = (order.paymentMethod || "cod") !== "cod";
  if (isManualPayment) {
    let label = "Pending Verification";
    let color = COLOR.amber;
    if (order.paymentStatus === "paid") {
      label = "Verified";
      color = COLOR.green;
    } else if (order.paymentStatus === "failed") {
      label = "Rejected";
      color = COLOR.red;
    }
    doc.fillColor(color).fontSize(9.5).text(`Payment Status: ${label}`, x, y, {
      width: ORDER_INFO_WIDTH,
    });
    doc.fillColor(COLOR.dark);
  }
}

function drawBillingCard(doc, order) {
  const billing = order.billing || {};
  let y = BILLING_TOP;

  doc.fillColor(COLOR.dark).fontSize(15).text("Customer Details", BILLING_LEFT, y, {
    width: BILLING_WIDTH,
  });
  y += 20;

  const rows = [
    ["Name", billing.name || ""],
    ["Phone", billing.phone || ""],
    ["Address", billing.address || ""],
  ];

  doc.fontSize(12);
  rows.forEach(([label, value]) => {
    const labelWidth = 70;
    doc.font(hasFont() ? "Body-Bold" : "Helvetica-Bold").text(`${label}:`, BILLING_LEFT, y, {
      width: labelWidth,
      continued: false,
    });
    const valueHeight = doc
      .font(hasFont() ? "Body" : "Helvetica")
      .heightOfString(value, { width: BILLING_WIDTH - labelWidth });
    doc.text(value, BILLING_LEFT + labelWidth, y, {
      width: BILLING_WIDTH - labelWidth,
    });
    y += Math.max(17, valueHeight + 3);
  });

  doc.font(hasFont() ? "Body" : "Helvetica");
}

// Returns the y position of the table header row's top on the given page.
function drawTableHeader(doc, y) {
  const left = ITEMS_PADDING_X;
  const right = PAGE_W - ITEMS_PADDING_X;
  const width = right - left;
  const itemW = (width - COL_SN) * (6 / 9.5);
  const priceW = (width - COL_SN) * (1.5 / 9.5);
  const qtyW = (width - COL_SN) * (1 / 9.5);
  const totalW = (width - COL_SN) * (1 / 9.5);

  doc.save();
  doc.rect(left, y, width, ROW_H).fill(COLOR.pink);
  doc.restore();

  doc.fillColor(COLOR.white).fontSize(10).font(hasFont() ? "Body-Bold" : "Helvetica-Bold");
  let x = left;
  const cy = y + ROW_H / 2 - 5;
  doc.text("SL", x, cy, { width: COL_SN, align: "center" });
  x += COL_SN;
  doc.text("Item", x, cy, { width: itemW, align: "center" });
  x += itemW;
  doc.text("Price", x, cy, { width: priceW, align: "center" });
  x += priceW;
  doc.text("Qty", x, cy, { width: qtyW, align: "center" });
  x += qtyW;
  doc.text("Total", x, cy, { width: totalW, align: "center" });

  doc.font(hasFont() ? "Body" : "Helvetica");

  return { left, itemW, priceW, qtyW, totalW, colTotalWidth: width };
}

function drawTableRow(doc, y, cols, row, index) {
  const width = cols.colTotalWidth;
  const bg = row.empty ? COLOR.white : index % 2 === 0 ? COLOR.rowAlt : COLOR.white;

  doc.save();
  doc.rect(cols.left, y, width, ROW_H).fill(bg);
  doc.restore();

  doc
    .moveTo(cols.left, y + ROW_H)
    .lineTo(cols.left + width, y + ROW_H)
    .strokeColor(COLOR.rowBorder)
    .lineWidth(0.5)
    .stroke();

  if (row.empty) return;

  doc.fillColor(COLOR.dark).fontSize(9.5);
  let x = cols.left;
  const cy = y + ROW_H / 2 - 5;
  doc.text(String(row.sl), x, cy, { width: COL_SN, align: "center" });
  x += COL_SN;
  doc.text(truncate(row.name), x, cy, { width: cols.itemW - 6, align: "center" });
  x += cols.itemW;
  doc.text(row.price, x, cy, { width: cols.priceW, align: "center" });
  x += cols.priceW;
  doc.text(String(row.qty), x, cy, { width: cols.qtyW, align: "center" });
  x += cols.qtyW;
  doc.text(row.total, x, cy, { width: cols.totalW, align: "center" });
}

function buildSummaryRows(order) {
  const rows = [
    ["Subtotal", `${formatCurrency(order.subtotal)} tk`, false],
    ["Delivery", `${formatCurrency(order.deliveryCharge)} tk`, false],
    ["Discount", `${formatCurrency(order.discount || 0)} tk`, false],
    ["Total", `${formatCurrency(order.total)} tk`, true],
  ];

  const isManualPayment = (order.paymentMethod || "cod") !== "cod";
  const isAdvancePaid = isManualPayment && order.paymentStatus === "paid";
  if (isAdvancePaid) {
    const deliveryCharge = Number(order.deliveryCharge || 0);
    const total = Number(order.total || 0);
    const codAmount = Math.max(0, total - deliveryCharge);
    rows.push(["Advance Payment", `${formatCurrency(deliveryCharge)} tk`, false]);
    rows.push(["COD", `${formatCurrency(codAmount)} tk`, true]);
  }

  return rows;
}

function drawSummary(doc, order, y) {
  const width = SUMMARY_WIDTH;
  const x = PAGE_W - SUMMARY_MARGIN_RIGHT - width;
  const rows = buildSummaryRows(order);
  const padding = 8;
  const titleH = 16;
  const boxH = titleH + rows.length * SUMMARY_ROW_H + padding * 2;

  doc.save();
  doc.roundedRect(x, y, width, boxH, 6).fillAndStroke(COLOR.white, COLOR.pink);
  doc.restore();

  let cy = y + padding;
  doc.fillColor(COLOR.dark).fontSize(9.5).font(hasFont() ? "Body-Bold" : "Helvetica-Bold");
  doc.text("Order Summary", x + padding, cy, { width: width - padding * 2 });
  cy += titleH;

  rows.forEach(([label, value, highlight]) => {
    if (highlight) {
      doc.save();
      doc.rect(x + padding - 3, cy - 2, width - padding * 2 + 6, SUMMARY_ROW_H).fill(COLOR.rowAlt);
      doc.restore();
    }
    doc.fillColor(highlight ? COLOR.pink : COLOR.dark);
    doc.font(hasFont() ? "Body-Bold" : "Helvetica-Bold").fontSize(9.5);
    doc.text(label, x + padding, cy, { width: width * 0.5, continued: false });
    doc.text(value, x + padding, cy, { width: width - padding * 2, align: "right" });
    cy += SUMMARY_ROW_H;
  });

  doc.fillColor(COLOR.dark).font(hasFont() ? "Body" : "Helvetica");

  return y + boxH;
}

function drawNoteBox(doc, order, y) {
  const note = order.billing?.note || "—";
  const padding = 8;
  doc.fontSize(9.5);
  const textHeight = doc.heightOfString(note, { width: NOTE_WIDTH - padding * 2 - 40 });
  const boxH = Math.max(28, textHeight + padding * 2);

  doc.save();
  doc.rect(NOTE_LEFT, y, NOTE_WIDTH, boxH).fill(COLOR.noteBg);
  doc.rect(NOTE_LEFT, y, 3, boxH).fill(COLOR.pink);
  doc.restore();

  doc.fillColor(COLOR.dark).font(hasFont() ? "Body-Bold" : "Helvetica-Bold").fontSize(9.5);
  doc.text("Note:", NOTE_LEFT + padding, y + padding, { width: 40, continued: false });
  doc.font(hasFont() ? "Body" : "Helvetica");
  doc.text(note, NOTE_LEFT + padding + 40, y + padding, {
    width: NOTE_WIDTH - padding * 2 - 40,
  });
}

/* ================= PDF BUFFER ================= */

async function generateInvoicePdfBuffer(order) {
  const doc = setupDoc();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });

  drawBackground(doc);
  drawOrderInfo(doc, order);
  drawBillingCard(doc, order);

  const items = order.items || [];
  const emptyRowsNeeded = Math.max(MIN_ITEM_ROWS - items.length, 0);
  const rows = items
    .map((item, index) => ({
      sl: index + 1,
      name: item.name,
      price: formatCurrency(item.price),
      qty: item.qty,
      total: formatCurrency(item.qty * item.price),
      empty: false,
    }))
    .concat(Array.from({ length: emptyRowsNeeded }, () => ({ empty: true })));

  let y = ITEMS_TOP_FIRST_PAGE;
  let cols = drawTableHeader(doc, y);
  y += ROW_H;

  rows.forEach((row, index) => {
    if (y + ROW_H > CONTENT_BOTTOM_LIMIT) {
      addPage(doc);
      y = ITEMS_TOP_NEXT_PAGE;
      cols = drawTableHeader(doc, y);
      y += ROW_H;
    }
    drawTableRow(doc, y, cols, row, index);
    y += ROW_H;
  });

  // Summary + note need ~180pt; push to a new page if they don't fit.
  if (y + 180 > CONTENT_BOTTOM_LIMIT) {
    addPage(doc);
    y = ITEMS_TOP_NEXT_PAGE;
  } else {
    y += PX(10);
  }

  const afterSummaryY = drawSummary(doc, order, y);
  drawNoteBox(doc, order, afterSummaryY + PX(20));

  // ✅ Footer page numbers on every page (matches old puppeteer "Page X of Y")
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(COLOR.gray)
      .text(`Page ${i - range.start + 1} of ${range.count}`, 0, PAGE_H - FOOTER_BOTTOM, {
        width: PAGE_W - PX(40),
        align: "right",
      });
  }

  doc.end();
  await done;
  return Buffer.concat(chunks);
}

/* ================= PUBLIC API ================= */

export async function generateAndCacheInvoice(orderIdOrOrder) {
  ensureCacheDir();

  const order =
    typeof orderIdOrOrder === "string" || orderIdOrOrder?._bsontype
      ? await Order.findById(orderIdOrOrder)
      : orderIdOrOrder;

  if (!order) {
    throw new Error("Order not found for invoice generation");
  }

  const pdfBuffer = await generateInvoicePdfBuffer(order);
  const filePath = getInvoiceFilePath(order._id.toString());

  await fs.promises.writeFile(filePath, pdfBuffer);

  await Order.findByIdAndUpdate(order._id, {
    invoice: {
      cachedAt: new Date(),
      version: (order.invoice?.version || 0) + 1,
    },
  });

  return { filePath, pdfBuffer };
}

export function getCachedInvoicePath(order) {
  if (!order?.invoice?.cachedAt) return null;
  const filePath = getInvoiceFilePath(order._id.toString());
  return fs.existsSync(filePath) ? filePath : null;
}

export async function invalidateInvoiceCache(orderId) {
  const filePath = getInvoiceFilePath(orderId.toString());
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath).catch(() => {});
  }
  await Order.findByIdAndUpdate(orderId, { $unset: { invoice: 1 } }).catch(
    () => {},
  );
}

export function regenerateInvoiceInBackground(orderId) {
  generateAndCacheInvoice(orderId).catch((err) => {
    console.error(`❌ Background invoice generation failed (${orderId}):`, err);
  });
}

export { getInvoiceFilePath };
