"use client";
import { useEffect, useRef, useState } from "react";
import Badge from "./Badge";
import { formatDateTime } from "../lib/utils";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header (Fixed) */}
        <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200">
            📦 Tracking Updates
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 sm:p-10 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function CourierStatus({
  trackingId,
  courier,
  orderId,
  orderStatus,
  onFinalStatus,
}) {
  const activeTrackingId = courier?.trackingId || trackingId;

  const [status, setStatus] = useState(courier?.status || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  // ✅ guard: same order/tracking এ বারবার final status sync বন্ধ
  const notifiedFinalRef = useRef(false);

  // ✅ trackingId change হলে আবার allow (নতুন courier হলে)
  useEffect(() => {
    notifiedFinalRef.current = false;
  }, [activeTrackingId]);

  const displayStatus = (status || courier?.status || "unknown")
    .replaceAll("_", " ")
    .toUpperCase();

  const normalizeFinalStatus = (raw) => {
    const s = String(raw || "")
      .toLowerCase()
      .trim();

    if (!s) return null;

    // delivered variations: delivered, delivered_success, delivered to customer etc.
    if (s === "delivered" || s.includes("deliver")) return "delivered";

    // cancelled variations: cancelled, canceled, cancel, order_cancelled etc.
    if (s === "cancelled" || s === "canceled" || s.includes("cancel"))
      return "cancelled";

    return null;
  };

  /* ================= FETCH STATUS ================= */
  useEffect(() => {
    if (!activeTrackingId) return;

    const fetchCourierStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = "/api";
        const url = `${apiUrl}/admin/api/courier/status?trackingId=${activeTrackingId}`;

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        const nextStatus = data?.status || "unknown";
        setStatus(nextStatus);

        // ✅ FINAL STATUS SYNC (DELIVERED/CANCELLED)
        const finalStatus = normalizeFinalStatus(nextStatus);

        if (
          finalStatus &&
          typeof onFinalStatus === "function" &&
          orderId &&
          orderStatus &&
          orderStatus !== finalStatus &&
          !notifiedFinalRef.current
        ) {
          notifiedFinalRef.current = true;
          onFinalStatus(orderId, finalStatus);
        }
      } catch (err) {
        setError(err?.message || "Failed to load status");
      } finally {
        setLoading(false);
      }
    };

    fetchCourierStatus();
  }, [activeTrackingId, onFinalStatus, orderId, orderStatus]);

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    if (!activeTrackingId) return;

    setEventsLoading(true);
    setEventsError(null);

    try {
      const apiUrl = "/api";
      const url = `${apiUrl}/admin/api/courier/live?trackingId=${activeTrackingId}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      const sorted = Array.isArray(data?.events)
        ? [...data.events].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
          )
        : [];

      setEvents(sorted);
    } catch (err) {
      setEventsError(err?.message || "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  const openModal = () => {
    setModalOpen(true);
    fetchEvents();
  };

  const closeModal = () => setModalOpen(false);

  if (!activeTrackingId) {
    return (
      <div className="mt-1 text-[12px] text-gray-400 dark:text-slate-500">Courier not created</div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      {loading ? (
        <div className="text-[12px] text-gray-400 dark:text-slate-500">Loading status...</div>
      ) : error ? (
        <div className="text-[12px] text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <Badge>🚚 {displayStatus}</Badge>
      )}

      <button
        onClick={openModal}
        className="text-[11px] px-1 py-0 rounded-md border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
      >
        Live Tracking
      </button>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        {eventsLoading ? (
          <div className="text-center text-gray-500 dark:text-slate-400">Loading timeline...</div>
        ) : eventsError ? (
          <div className="text-red-500 dark:text-red-400 text-center">{eventsError}</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500 dark:text-slate-400 text-center">
            No tracking updates available.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-gray-300 dark:border-slate-600 space-y-3">
            {events.map((e, idx) => {
              const message = e?.status || "Unknown update";
              const date = e?.timestamp ? formatDateTime(e.timestamp) : "—";

              return (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div
                    className="absolute -left-[9px] top-1 w-4 h-4 md:w-5 md:h-5 
                  rounded-full bg-green-500 
                  flex items-center justify-center 
                  text-white text-[9px] md:text-[10px] shadow"
                  >
                    ✓
                  </div>

                  {/* Card */}
                  <div
                    className="bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg
                  px-3 py-2 md:px-5 md:py-3 shadow-sm"
                  >
                    <div className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 md:text-gray-500 dark:md:text-slate-400 mb-1">
                      {date}
                    </div>

                    {/* ✅ Mobile slim text */}
                    <div
                      className="text-[12px] md:text-sm
                    font-normal md:font-medium
                    text-gray-700 dark:text-slate-300 md:text-gray-800 dark:md:text-slate-200
                    leading-tight md:leading-snug
                    break-words whitespace-pre-wrap"
                    >
                      {message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
