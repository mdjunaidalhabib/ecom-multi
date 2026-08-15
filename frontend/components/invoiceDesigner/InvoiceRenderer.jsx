"use client";

import {
  formatCurrency,
  formatOrderDateTime,
  shortOrderId,
  getInvoicePromoAmounts,
  buildPaymentStatusText,
  buildExtraSummaryRows,
} from "../../lib/invoiceTemplateContract";

// ✅ Pure presentational — template + order/shop ডেটা দিয়ে ইনভয়েসের ৭টা
// element আঁকে। editor (InvoiceCanvas) এবং PDF-ক্যাপচার (invoiceDownload.js)
// দুটোই এই কম্পোনেন্ট অবিকল একইভাবে ব্যবহার করে — তাই প্রিভিউ আর ডাউনলোড
// করা PDF সবসময় হুবহু একরকম দেখায়।
export default function InvoiceRenderer({ template, order, shop, editable = false, children }) {
  const pageSize = template?.pageSize || { width: 794, height: 1123 };
  const background = template?.background || { type: "color", color: "#ffffff" };
  const elements = template?.elements || [];

  const pageStyle = {
    position: "relative",
    width: pageSize.width,
    height: pageSize.height,
    background:
      background.type === "image" && background.imageUrl
        ? `url(${background.imageUrl})`
        : background.color || "#ffffff",
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    fontFamily: "'Hind Siliguri', Arial, sans-serif",
    overflow: "hidden",
    flexShrink: 0,
  };

  return (
    <div style={pageStyle} data-invoice-page>
      {elements
        .filter((el) => el.visible)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((el) => (
          <div
            key={el.id}
            data-element-id={el.id}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              fontSize: el.fontSize,
              color: el.color,
              fontWeight: el.fontWeight,
              textAlign: el.textAlign,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <ElementContent element={el} order={order} shop={shop} />
            {editable && children ? children(el) : null}
          </div>
        ))}
    </div>
  );
}

function ElementContent({ element, order, shop }) {
  switch (element.id) {
    case "logo":
      return shop?.logo ? (
        <img src={shop.logo} alt="logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", border: "1px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#9ca3af" }}>
          Logo
        </div>
      );

    case "shopInfo":
      return (
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.2em" }}>{shop?.name || ""}</div>
          {shop?.contactPhone && <div>{shop.contactPhone}</div>}
          {shop?.contactEmail && <div>{shop.contactEmail}</div>}
        </div>
      );

    case "orderInfo": {
      const { datePart, timePart } = formatOrderDateTime(order?.createdAt);
      const paymentStatus = buildPaymentStatusText(order);
      return (
        <div style={{ lineHeight: 1.6 }}>
          <div>
            <strong>Order NO:</strong> {shortOrderId(order)}
          </div>
          <div>
            <strong>Date:</strong> {datePart} ; {timePart}
          </div>
          <div>
            <strong>Payment:</strong> {String(order?.paymentMethod || "cod").toUpperCase()}
          </div>
          {paymentStatus && (
            <div style={{ fontWeight: 700, color: paymentStatus.color }}>
              Payment Status: {paymentStatus.text}
            </div>
          )}
        </div>
      );
    }

    case "customerInfo":
      return (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "1.15em" }}>Customer Details</div>
          <Row label="Name" value={order?.billing?.name} />
          <Row label="Phone" value={order?.billing?.phone} />
          <Row label="Address" value={order?.billing?.address} />
          {order?.billing?.note && <Row label="Note" value={order.billing.note} />}
        </div>
      );

    case "itemsTable":
      return <ItemsTable element={element} order={order} />;

    case "totals": {
      const amounts = getInvoicePromoAmounts(order);
      const extraRows = buildExtraSummaryRows(order);
      return (
        <div style={{ border: "1px solid #ff36ac", borderRadius: 8, padding: "9px 12px", background: "#ffffff" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9em", marginBottom: 5, borderBottom: "1px dashed #e5e7eb", paddingBottom: 4 }}>
            Order Summary
          </div>
          <SummaryRow label="Subtotal" value={`${formatCurrency(order?.subtotal)} tk`} />
          <SummaryRow label="Delivery" value={`${formatCurrency(amounts.displayedDelivery)} tk`} />
          <SummaryRow
            label={order?.promo?.code ? `Promo discount (${order.promo.code})` : "Discount"}
            value={`${formatCurrency(amounts.displayedDiscount)} tk`}
          />
          <SummaryRow label="Total" value={`${formatCurrency(order?.total)} tk`} highlight />
          {extraRows.map((row) => (
            <SummaryRow key={row.label} label={row.label} value={row.value} highlight={row.variant === "cod"} />
          ))}
        </div>
      );
    }

    case "footerText":
      return element.content ? (
        <div style={{ background: "#fff6cf", borderLeft: "4px solid #ff36ac", borderRadius: 8, padding: "8px 14px", height: "100%", boxSizing: "border-box" }}>
          {element.content}
        </div>
      ) : null;

    default:
      return null;
  }
}

function Row({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 6, marginBottom: 3, lineHeight: 1.4 }}>
      <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{label}:</span>
      <span style={{ wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "1em",
        fontWeight: 600,
        padding: highlight ? "5px 7px" : "2px 0",
        borderRadius: highlight ? 5 : 0,
        background: highlight ? "#ffe6f5" : "transparent",
        color: highlight ? "#ff36ac" : "#111827",
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}

function ItemsTable({ element, order }) {
  const columns = (element.columns || []).filter((c) => c.visible).sort((a, b) => a.order - b.order);
  const gridTemplate = columns.map((c) => `${c.width}px`).join(" ");
  const items = order?.items || [];

  const cellValue = (col, item, index) => {
    if (col.key === "sl") return index + 1;
    if (col.key === "item") return item.name;
    if (col.key === "price") return formatCurrency(item.price);
    if (col.key === "qty") return item.qty;
    if (col.key === "total") return formatCurrency(item.qty * item.price);
    return "";
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: gridTemplate, background: "#ff36ac", color: "#fff", fontWeight: 700, borderBottom: "2px solid #111827" }}>
        {columns.map((c) => (
          <span key={c.key} style={{ textAlign: "center", padding: "6px 4px" }}>
            {c.label}
          </span>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.productId || index}
          style={{
            display: "grid",
            gridTemplateColumns: gridTemplate,
            background: index % 2 === 0 ? "#ffe6f5" : "#ffffff",
            borderBottom: "1px solid #ffc7f3",
          }}
        >
          {columns.map((c) => (
            <span key={c.key} style={{ textAlign: "center", padding: "5px 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cellValue(c, item, index)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
