"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, Inbox, Sparkles } from "lucide-react";

const items = [
  { label: "Total Leads", status: "", icon: Inbox, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" },
  { label: "New Leads", status: "New", icon: Sparkles, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" },
  { label: "Follow-up", status: "Follow-up", icon: Clock3, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10" },
  { label: "Converted", status: "Converted", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" },
];

export default function LeadOverview({ refresh = 0, onSelectStatus, activeStatus }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    fetch("/api/admin/leads/summary", { cache: "no-store", signal: controller.signal })
      .then(async res => { const body = await res.json(); if (!res.ok) throw new Error(body.message || "Lead summary লোড করা যায়নি"); return body; })
      .then(setData)
      .catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [refresh, attempt]);

  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{error}<button type="button" onClick={() => setAttempt(value => value + 1)} className="ml-3 underline">আবার চেষ্টা করুন</button></div>;
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {items.map(({ label, status, icon: Icon, color }) => {
        const value = data ? (status ? data.byStatus[status] || 0 : data.total) : null;
        const className = `group flex min-w-0 items-center gap-3 rounded-xl border bg-white p-3 text-left transition hover:shadow-sm dark:bg-slate-900 sm:p-4 ${onSelectStatus && activeStatus === status ? "border-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-500/20" : "border-gray-200 hover:border-indigo-300 dark:border-slate-700"}`;
        const content = <><span className={`rounded-lg p-2 ${color}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs text-gray-500 dark:text-slate-400">{label}</span><span className="mt-0.5 block text-xl font-bold tabular-nums text-gray-900 dark:text-slate-100">{value === null ? <span className="block h-6 w-10 animate-pulse rounded bg-gray-100 dark:bg-slate-800" /> : value.toLocaleString("bn-BD")}</span></span><ArrowUpRight size={14} className="hidden text-gray-400 group-hover:text-indigo-600 sm:block" /></>;
        return onSelectStatus ? <button key={label} type="button" onClick={() => onSelectStatus(status)} aria-pressed={activeStatus === status} className={className}>{content}</button> : <Link key={label} href={status ? `/leads?status=${encodeURIComponent(status)}` : "/leads"} className={className}>{content}</Link>;
      })}
    </div>
  );
}
