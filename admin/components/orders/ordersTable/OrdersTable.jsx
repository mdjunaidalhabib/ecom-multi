"use client";
import { useState } from "react";
import { Send, FileText, Edit2, Trash2 } from "lucide-react";

import Badge from "../../Badge";
import CopyButton from "../../CopyButton";
import CourierStatus from "../../CourierStatus";

import {
  STATUS_LABEL,
  STATUS_BADGE_COLOR,
  STATUS_OPTIONS,
  LOCKED_STATUSES,
  STATUS_FLOW,
  READY_STATUS,
} from "../shared/constants";

import {
  formatOrderTime,
  needsPaymentVerification,
  paymentMethodLabel,
} from "../shared/utils";
import useOrdersManager from "../hooks/useOrdersManager";
import StatusTabs from "./StatusTabs";
import BulkActions from "./BulkActions";
import useInvoiceTemplate from "../../../hooks/useInvoiceTemplate";
import downloadInvoicePdf from "../../../utils/invoiceDownload";

export default function OrdersTable({
  orders,
  onEdit,
  onDelete = null,
  onStatusChange,
  onSendCourier,
  onBulkStatusChange,
  onBulkDelete,
  onBulkSendCourier,
}) {
  const [tabStatus, setTabStatus] = useState("");
  const [q, setQ] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const { template: invoiceTemplate } = useInvoiceTemplate();

  const handleDownloadInvoice = async (order) => {
    if (!invoiceTemplate) return;
    setDownloadingId(order._id);
    try {
      await downloadInvoicePdf(order); // লোডিং/ক্যানসেল/এরর টোস্ট নিজেই দেখায়
    } catch {
      // ইতিমধ্যে toast দেখানো হয়ে গেছে — এখানে আলাদা করে দেখানোর দরকার নেই
    } finally {
      setDownloadingId(null);
    }
  };

  const manager = useOrdersManager({
    orders,
    tabStatus,
    search: q,
  });

  /* ===============================
     SINGLE ORDER STATUS CHANGE
  =============================== */
  const handleChange = async (id, payload, order) => {
    setUpdatingId(id);
    try {
      if (
        order?.status === READY_STATUS &&
        payload.status === "send_to_courier"
      ) {
        await onSendCourier(order);
        manager.setSelected([]);
        return;
      }

      await onStatusChange(id, payload);
      manager.setSelected([]);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     COURIER FINAL STATUS SYNC
  =============================== */
  const handleCourierFinalStatus = async (orderId, finalStatus) => {
    if (!orderId || !finalStatus) return;
    if (updatingId === orderId) return;

    setUpdatingId(orderId);

    try {
      const apiUrl = "/api";

      await fetch(`${apiUrl}/admin/api/sync-courier-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, finalStatus }),
      });

      await onStatusChange(orderId, { status: finalStatus });
      manager.setSelected([]);
    } catch (err) {
      console.error("Courier final sync failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="hidden md:block space-y-3">
      {/* ================= HEADER ================= */}
      <div className="rounded-lg border dark:border-slate-700 shadow-sm p-3 space-y-3 sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95">
        <input
          className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded px-3 py-2 w-full"
          placeholder="Search by OrderID / Name / Phone"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            manager.setSelected([]);
          }}
        />

        <div className="flex flex-wrap items-center gap-2 px-1">
          <StatusTabs
            tabStatus={tabStatus}
            setTabStatus={(s) => {
              setTabStatus(s);
              manager.setSelected([]);
            }}
          />

          <div className="flex-1" />

          <BulkActions
            selected={manager.selected}
            selectedOrders={manager.selectedOrders}
            sameStatus={manager.sameStatus}
            bulkStatus={manager.bulkStatus}
            canBulkSendCourier={manager.canBulkSendCourier}
            setSelected={manager.setSelected}
            onStatusChange={onStatusChange}
            onBulkStatusChange={onBulkStatusChange}
            onSendCourier={onSendCourier}
            onBulkSendCourier={onBulkSendCourier}
            onBulkDelete={onBulkDelete}
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-slate-400 px-1">
          Showing:{" "}
          <span className="font-semibold text-gray-700 dark:text-slate-300">{manager.filteredOrders.length}</span>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 shadow-sm">
        {!manager.filteredOrders.length ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No orders found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-slate-800">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={manager.allSelected}
                    onChange={manager.toggleAll}
                  />
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Order</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Customer</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Items</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Totals</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Payment</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Status Info</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Control</th>
                <th className="p-3 text-left text-gray-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>

            <tbody>
              {manager.filteredOrders.map((o) => {
                const locked = LOCKED_STATUSES.includes(o.status);
                const allowedNext = STATUS_FLOW[o.status] || [];
                const isAdminCreated = o?.createdBy === "admin";
                const paymentHold = !locked && needsPaymentVerification(o);

                return (
                  <tr
                    key={o._id}
                    className={`border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60 text-gray-900 dark:text-slate-100 ${
                      manager.selected.includes(o._id) ? "bg-blue-50 dark:bg-blue-500/10" : ""
                    }`}
                  >
                    {/* CHECKBOX */}
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={manager.selected.includes(o._id)}
                        onChange={() => manager.toggleOne(o._id)}
                        disabled={locked}
                      />
                    </td>
                    {/* ORDER INFO */}
                    <td className="p-2">
                      <div className="font-mono text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                        #{o.orderNumber ?? o._id}
                        {o.saleChannel === "offline" && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                            🏬 Offline
                          </span>
                        )}
                      </div>

                      {isAdminCreated && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-400">
                          Created by :
                          {o?.createdByName && (
                            <span className="font-semibold">
                              {o.createdByName}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {formatOrderTime(o)}
                      </div>
                    </td>
                    {/* CUSTOMER */}
                    <td className="p-2">
                      <div className="font-semibold">{o.billing?.name}</div>
                      <div>{o.billing?.phone}</div>
                      <div>{o.billing?.address}</div>
                    </td>
                    {/* ITEMS */}
                    <td className="p-2">
                      <div className="space-y-2 max-w-[200px]">
                        {(o.items || []).slice(0, 2).map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2"
                          >
                            <img
                              src={it.image || "/placeholder.png"}
                              className="w-8 h-8 rounded-md border dark:border-slate-600"
                              alt=""
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {it.name}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                Qty: {it.qty} • ৳{it.price}
                              </p>
                            </div>
                          </div>
                        ))}

                        {o.items?.length > 2 && (
                          <div className="text-[11px] text-gray-500 dark:text-slate-400">
                            +{o.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>
                    {/* TOTALS */}
                    <td className="p-1 text-xs space-y-1 min-w-[90px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Subtotal</span>
                        <span>৳{o.subtotal}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Delivery</span>
                        <span>৳{o.deliveryCharge}</span>
                      </div>

                      {!!o.discount && (
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Discount{o.promo?.code ? ` (${o.promo.code})` : ""}</span>
                          <span>-৳{o.discount}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold border-t dark:border-slate-700 pt-1">
                        <span>Total</span>
                        <span>৳{o.total}</span>
                      </div>
                    </td>
                    {/* PAYMENT */}
                    <td className="p-2 space-y-1 min-w-[150px]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge>{paymentMethodLabel(o)}</Badge>
                        {o.paymentMethod !== "cod" && (
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                              o.paymentStatus === "paid"
                                ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                                : o.paymentStatus === "failed"
                                  ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
                                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                            }`}
                          >
                            {o.paymentStatus === "paid"
                              ? "Verified"
                              : o.paymentStatus === "failed"
                                ? "Rejected"
                                : "Pending"}
                          </span>
                        )}
                      </div>

                      {o.paymentMethod !== "cod" &&
                        o.paymentDetails?.transactionId && (
                          <div className="text-[11px] text-gray-600 dark:text-slate-400 flex items-center gap-1">
                            <span className="text-gray-400 dark:text-slate-500">TrxID:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-slate-200 truncate max-w-[90px]">
                              {o.paymentDetails.transactionId}
                            </span>
                            <CopyButton
                              value={o.paymentDetails.transactionId}
                            />
                          </div>
                        )}

                      {o.paymentMethod !== "cod" &&
                        o.paymentDetails?.senderNumber && (
                          <div className="text-[11px] text-gray-500 dark:text-slate-400">
                            Sender: {o.paymentDetails.senderNumber}
                          </div>
                        )}
                    </td>
                    {/* STATUS INFO */}
                    <td className="p-2 space-y-2">
                      <span
                        className={`text-[11px] px-2 py-0 rounded-full border ${STATUS_BADGE_COLOR[o.status]}`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>

                      <CourierStatus
                        trackingId={o.courier?.trackingId}
                        courier={o.courier}
                        orderId={o._id}
                        orderStatus={o.status}
                        onFinalStatus={(orderId, finalStatus) => {
                          if (LOCKED_STATUSES.includes(o.status)) return;
                          if (o.status === finalStatus) return;
                          handleCourierFinalStatus(orderId, finalStatus);
                        }}
                      />

                      {o.status === "cancelled" && o.cancelReason && (
                        <div className="text-[11px] text-red-600 dark:text-red-400">
                          <span className="font-semibold">Reason:</span>{" "}
                          {o.cancelReason}
                        </div>
                      )}

                      {paymentHold && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded px-2 py-1 max-w-[180px]">
                          ⏳ Payment verify হয়নি — status hold করা আছে। Payments পেজ থেকে Accept/Reject করুন।
                        </div>
                      )}
                    </td>
                    {/* CONTROL COLUMN */}
                    <td className="p-3">
                      {paymentHold ? (
                        <div
                          className="text-xs text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 rounded px-2 py-1.5 text-center"
                          title="Payment এখনো verify করা হয়নি, তাই status পরিবর্তন করা যাবে না"
                        >
                          🔒 Payment Pending
                        </div>
                      ) : (
                        <select
                          className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded px-2 py-1 text-sm w-full"
                          value={o.status}
                          disabled={locked || updatingId === o._id}
                          onChange={(e) =>
                            handleChange(o._id, { status: e.target.value }, o)
                          }
                        >
                          <option value={o.status} disabled>
                            {STATUS_LABEL[o.status]}
                          </option>

                          {STATUS_OPTIONS.filter((s) =>
                            allowedNext.includes(s),
                          ).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="p-3 ">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => onEdit(o)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDelete?.(o)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>

                        {/* Send */}
                        {o.status === READY_STATUS &&
                          !o.courier?.trackingId && (
                            <button
                              onClick={() =>
                                handleChange(
                                  o._id,
                                  { status: "send_to_courier" },
                                  o,
                                )
                              }
                              disabled={updatingId === o._id}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition disabled:opacity-50"
                            >
                              <Send size={14} />
                              Send
                            </button>
                          )}

                        {/* Invoice */}
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(o)}
                          disabled={!invoiceTemplate || downloadingId === o._id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                        >
                          <FileText size={14} />
                          {downloadingId === o._id ? "..." : "Invoice"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
