"use client";

import { useEffect, useState } from "react";
import Pagination from "../../../../components/Pagination";
import { formatDateTime } from "../../../../lib/utils";

const PURPOSE_LABELS = {
  order_notification: "অর্ডার নোটিফিকেশন",
  test_mail: "টেস্ট মেইল",
};

const purposeLabel = (purpose) => PURPOSE_LABELS[purpose] || purpose;

const formatDate = (value) => formatDateTime(value);

export default function MailReportPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/mail-report?page=${page}&limit=50`);
      const data = await res.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch mail report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/mail-report`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      setPage(1);
      await fetchLogs();
      showToast("🗑️ মেইল রিপোর্ট মুছে ফেলা হয়েছে", "success");
    } catch (err) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">📧 Mail Report</h2>
        <button
          onClick={() => setConfirmReset(true)}
          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm shadow hover:scale-105 transition-all"
        >
          🔄 Reset
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          কোনো ইমেইল পাঠানো হয়নি।
        </div>
      ) : (
        <>
          {/* ✅ Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl border shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Sent At</th>
                  <th className="p-3 text-left">Recipient</th>
                  <th className="p-3 text-left">Purpose</th>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-600 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="p-3 font-medium">{log.to}</td>
                    <td className="p-3 text-gray-700">
                      {purposeLabel(log.purpose)}
                    </td>
                    <td className="p-3 text-gray-700">{log.subject}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          log.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {log.status === "failed" ? "ব্যর্থ" : "পাঠানো হয়েছে"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Card View */}
          <div className="grid gap-3 md:hidden">
            {logs.map((log) => (
              <div
                key={log._id}
                className="border rounded-xl p-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold text-gray-800 break-all">
                    {log.to}
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-md text-xs font-semibold ${
                      log.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {log.status === "failed" ? "ব্যর্থ" : "পাঠানো হয়েছে"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {purposeLabel(log.purpose)}
                </div>
                {log.subject && (
                  <div className="text-xs text-gray-500 mt-1">
                    {log.subject}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(log.createdAt)}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Reset confirm modal */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <p className="font-bold text-gray-800 mb-2">
              Mail Report রিসেট করবেন?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              রিসেট করলে এখন পর্যন্ত লগ হওয়া সব মেইল রেকর্ড ডাটাবেজ থেকে
              স্থায়ীভাবে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setConfirmReset(false)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? "রিসেট হচ্ছে..." : "হ্যাঁ, Reset করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2.5 rounded-lg shadow-lg text-sm text-white z-50 ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
