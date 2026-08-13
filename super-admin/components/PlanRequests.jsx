"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "./button";
import Toast from "./Toast";

const PLAN_LABELS = { free: "Free", starter: "Starter", pro: "Pro" };
const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];
const STATUS_META = {
  pending: ["Pending", "bg-amber-50 text-amber-700 border-amber-200", Clock],
  approved: ["Approved", "bg-green-50 text-green-700 border-green-200", CheckCircle2],
  rejected: ["Rejected", "bg-red-50 text-red-700 border-red-200", XCircle],
};

export default function PlanRequests() {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [reviewing, setReviewing] = useState(null); // { id, action }
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const notify = (message, type = "info") => setToast({ message, type });

  const load = () => {
    setLoading(true);
    const query = status !== "all" ? `?status=${status}` : "";
    fetch(`/api/admin/shops/plan-requests${query}`)
      .then((res) => res.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => notify("রিকোয়েস্ট লোড করা যায়নি", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const startReview = (id, action) => {
    setReviewing({ id, action });
    setReviewNote("");
  };

  const cancelReview = () => {
    setReviewing(null);
    setReviewNote("");
  };

  const confirmReview = async () => {
    if (!reviewing) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/shops/plan-requests/${reviewing.id}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: reviewing.action, reviewNote }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "review failed");
      notify(
        reviewing.action === "approve" ? "প্ল্যান অনুমোদন হয়েছে" : "রিকোয়েস্ট বাতিল হয়েছে",
        "success",
      );
      setReviewing(null);
      setReviewNote("");
      load();
    } catch (err) {
      notify(err.message || "কাজটি করা যায়নি", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-1">Plan Requests</h1>
      <p className="text-sm text-gray-500 mb-6">
        শপগুলোর প্ল্যান আপগ্রেড/ডাউনগ্রেড অনুরোধ এখান থেকে অনুমোদন বা বাতিল করুন।
        অনুমোদন করলে শপের plan এবং limits সাথে সাথে আপডেট হয়ে যাবে।
      </p>

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              status === tab.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : requests.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          কোনো রিকোয়েস্ট নেই।
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const meta = STATUS_META[r.status] || STATUS_META.pending;
            const StatusIcon = meta[2];
            const isReviewingThis = reviewing?.id === r._id;
            return (
              <div
                key={r._id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      {r.shopId?.name || "অজানা শপ"}{" "}
                      <span className="font-normal text-gray-400">
                        ({r.shopId?.slug || "—"})
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {PLAN_LABELS[r.currentPlan]} → {PLAN_LABELS[r.requestedPlan]}
                    </p>
                    {r.note && (
                      <p className="mt-1 text-xs text-gray-500">নোট: {r.note}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta[1]}`}
                  >
                    <StatusIcon size={13} />
                    {meta[0]}
                  </span>
                </div>

                {r.reviewNote && (
                  <p className="mt-2 text-xs text-gray-500">
                    মন্তব্য: {r.reviewNote}
                  </p>
                )}

                {r.status === "pending" && (
                  <div className="mt-3">
                    {isReviewingThis ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          maxLength={500}
                          placeholder="মন্তব্য (ঐচ্ছিক)"
                          className="min-h-16 w-full resize-y rounded-lg border border-gray-300 p-2 text-sm outline-none"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelReview}
                            disabled={saving}
                          >
                            বাতিল
                          </Button>
                          <Button
                            variant={
                              reviewing.action === "approve" ? "default" : "destructive"
                            }
                            size="sm"
                            onClick={confirmReview}
                            isLoading={saving}
                          >
                            {reviewing.action === "approve"
                              ? "অনুমোদন নিশ্চিত করুন"
                              : "বাতিল নিশ্চিত করুন"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => startReview(r._id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => startReview(r._id, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
