"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Inbox, Loader2, Phone, MessageCircle, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import LeadOverview from "./LeadOverview";

const STATUSES = ["New", "Contacted", "Interested", "Follow-up", "Converted", "Not Interested"];
const PLANS = ["Starter", "Business", "Custom", "Reseller"];
const control = "rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
const button = "rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50";
const date = value => new Date(value).toLocaleString("bn-BD");
const statusColor = status => ({
  New: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  Contacted: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Interested: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  "Follow-up": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Converted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Not Interested": "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
})[status] || "bg-gray-50 text-gray-700";

function LeadCard({ lead, onSaved, onError }) {
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setStatus(lead.status); }, [lead.status]);
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { status, ...(note.trim() ? { note: note.trim() } : {}) };
      const res = await fetch(`/api/admin/leads/${lead._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "সংরক্ষণ করা যায়নি");
      setNote("");
      onSaved();
    } catch (error) { onError(error.message); }
    finally { setSaving(false); }
  }
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 px-3 py-3 sm:px-4 md:grid-cols-[minmax(0,1.2fr)_minmax(100px,0.7fr)_auto_auto]">
        <div className="min-w-0"><h2 className="truncate text-sm font-semibold" title={lead.name}>{lead.name}</h2><a className="mt-1 inline-flex items-center gap-1.5 text-xs tabular-nums text-gray-500 hover:text-indigo-600 dark:text-slate-400" href={`tel:${lead.phone}`}><Phone size={12} />{lead.phone}</a><span className="ml-2 text-[11px] text-gray-400 md:hidden">{lead.interestedPlan}</span></div>
        <div className="hidden min-w-0 md:block"><p className="text-xs font-medium">{lead.interestedPlan}</p><p className="mt-1 truncate text-[11px] text-gray-400">{lead.businessStatus === "New Business" ? "নতুন ব্যবসা" : "চলমান ব্যবসা"}</p></div>
        <div className="flex items-center justify-end gap-1.5"><label htmlFor={`status-${lead._id}`} className="sr-only">Status — {lead.name}</label><select id={`status-${lead._id}`} disabled={saving} className={`max-w-[135px] rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 ${statusColor(status)}`} value={status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(value => <option className="bg-white text-gray-900 dark:bg-slate-900 dark:text-slate-100" key={value}>{value}</option>)}</select>{status !== lead.status && <button type="button" onClick={save} disabled={saving} aria-label="Status সংরক্ষণ করুন" className="rounded-lg bg-indigo-600 p-1.5 text-white disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>}</div>
        <div className="col-span-2 flex items-center justify-between gap-2 border-t border-gray-50 pt-2 dark:border-slate-800 md:col-span-1 md:justify-end md:border-0 md:pt-0"><time className="text-[10px] text-gray-400 md:hidden" dateTime={lead.createdAt}>{date(lead.createdAt)}</time><div className="flex items-center gap-1"><a className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10" href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp — ${lead.name}`} title="WhatsApp"><MessageCircle size={15} /></a><button type="button" aria-expanded={expanded} aria-controls={`lead-detail-${lead._id}`} onClick={() => setExpanded(value => !value)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800">বিস্তারিত{lead.notes?.length > 0 && <span className="text-[10px] text-gray-400">({lead.notes.length})</span>}{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button></div></div>
      </div>
      {expanded && <div id={`lead-detail-${lead._id}`} className="grid gap-4 border-t border-gray-100 bg-gray-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/30 sm:p-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-3"><p className="text-[11px] text-gray-400">{lead.businessStatus === "New Business" ? "নতুন ব্যবসা" : "চলমান ব্যবসা"} · <time dateTime={lead.createdAt}>{date(lead.createdAt)}</time></p>{lead.message && <div><h3 className="mb-1 text-xs font-semibold text-gray-500">গ্রাহকের বার্তা</h3><p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed">{lead.message}</p></div>}{Object.values(lead.attribution || {}).some(Boolean) && <details className="text-xs text-gray-500 dark:text-slate-400"><summary className="cursor-pointer font-medium">Campaign / UTM</summary><dl className="mt-2 space-y-1">{Object.entries(lead.attribution).filter(([, value]) => value).map(([key, value]) => <div key={key} className="break-all"><dt className="inline font-semibold">{key}: </dt><dd className="inline">{value}</dd></div>)}</dl></details>}{!!lead.notes?.length && <div><h3 className="mb-2 text-xs font-semibold text-gray-500">পূর্বের নোট ({lead.notes.length})</h3><ol className="max-h-40 space-y-2 overflow-y-auto">{lead.notes.map(item => <li key={item._id} className="border-l-2 border-indigo-200 pl-2.5 dark:border-indigo-500/30"><p className="whitespace-pre-wrap break-words text-xs leading-relaxed">{item.text}</p><time className="mt-1 block text-[10px] text-gray-400" dateTime={item.createdAt}>{date(item.createdAt)}</time></li>)}</ol></div>}</div>
        <form onSubmit={save} className="min-w-0"><fieldset disabled={saving} className="space-y-2"><label htmlFor={`note-${lead._id}`} className="block text-xs font-semibold text-gray-500">নতুন নোট</label><textarea id={`note-${lead._id}`} className={`${control} w-full text-xs`} value={note} maxLength={2000} rows={2} placeholder="কথোপকথন বা পরবর্তী পদক্ষেপ লিখুন" onChange={e => setNote(e.target.value)} /><div className="flex items-center justify-between gap-2"><span className="text-[10px] text-gray-400">{note.length}/2000</span><button type="submit" disabled={saving || (status === lead.status && !note.trim())} className={`${button} !px-3 !py-1.5 !text-xs`}>{saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}</button></div></fieldset></form>
      </div>}
    </article>
  );
}

export default function Leads({ initialStatus = "" }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(STATUSES.includes(initialStatus) ? initialStatus : "");
  const [plan, setPlan] = useState("");
  const [business, setBusiness] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ leads: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("search", query);
    if (status) params.set("status", status);
    if (plan) params.set("plan", plan);
    if (business) params.set("businessStatus", business);
    fetch(`/api/admin/leads?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.message || "Leads লোড করা যায়নি"); return data; })
      .then(data => {
        if (page > data.pages) { setPage(data.pages); return; }
        setResult(data);
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, status, plan, business, page, refresh]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 text-gray-900 dark:text-slate-100">
      <div className="flex items-start justify-between gap-3"><div><h1 className="flex items-center gap-2 text-xl font-semibold"><Inbox size={21} className="text-indigo-600 dark:text-indigo-400" />Lead Management</h1><p className="mt-1 text-xs text-gray-500 dark:text-slate-400">আগ্রহী গ্রাহকদের যোগাযোগ ও ফলো-আপ এক জায়গায়।</p></div><button type="button" aria-label="Refresh leads" disabled={loading} onClick={() => setRefresh(value => value + 1)} className={control}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button></div>
      <LeadOverview refresh={refresh} activeStatus={status} onSelectStatus={value => { setStatus(value); setPage(1); }} />
      <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <form onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(1); }} className="flex gap-2"><label htmlFor="lead-search" className="sr-only">নাম বা ফোন নম্বর খুঁজুন</label><div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input id="lead-search" className={`${control} w-full !pl-9`} value={search} maxLength={100} onChange={e => setSearch(e.target.value)} placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন" /></div><button className={`${button} !bg-indigo-600 hover:!bg-indigo-700`} type="submit">খুঁজুন</button></form>
        <div className="mt-2.5 flex items-center gap-2"><SlidersHorizontal size={14} className="hidden shrink-0 text-gray-400 sm:block" /><div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          <select aria-label="Filter by status" className={`${control} min-w-0 w-full !text-xs`} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">সব Status</option>{STATUSES.map(value => <option key={value}>{value}</option>)}</select>
          <select aria-label="Filter by plan" className={`${control} min-w-0 w-full !text-xs`} value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }}><option value="">সব প্ল্যান</option>{PLANS.map(value => <option key={value}>{value}</option>)}</select>
          <select aria-label="Filter by business" className={`${control} min-w-0 w-full !text-xs`} value={business} onChange={e => { setBusiness(e.target.value); setPage(1); }}><option value="">সব ব্যবসা</option><option value="New Business">নতুন ব্যবসা</option><option value="Existing Business">চলমান ব্যবসা</option></select>
        </div>{(query || status || plan || business) && <button type="button" aria-label="Clear filters" onClick={() => { setSearch(""); setQuery(""); setStatus(""); setPlan(""); setBusiness(""); setPage(1); }} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"><X size={16} /></button>}</div>
      </div>
      {notice && <p role="status" className="mb-4 text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      {saveError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <div role="status" className="flex items-center justify-center gap-2 py-12"><Loader2 className="animate-spin" size={22} /><span className="text-sm">লোড হচ্ছে…</span></div> : error ? null : result.leads.length ? <><div className="flex items-center justify-between gap-3 px-1 text-xs text-gray-400"><span>{result.total.toLocaleString("bn-BD")}টি ফলাফল</span><span>নতুন Lead আগে</span></div><div className="space-y-2">{result.leads.map(lead => <LeadCard key={lead._id} lead={lead} onError={message => { setNotice(""); setSaveError(message); }} onSaved={() => { setSaveError(""); setNotice("পরিবর্তন সংরক্ষণ হয়েছে।"); setRefresh(value => value + 1); }} />)}</div></> : <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-slate-700"><Inbox size={26} className="mx-auto mb-2 text-gray-300" />কোনো Lead পাওয়া যায়নি।</div>}
      {!loading && !error && <nav aria-label="Lead pages" className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"><button className={control} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>আগের পৃষ্ঠা</button><span>পৃষ্ঠা {page} / {result.pages}</span><button className={control} disabled={page >= result.pages} onClick={() => setPage(value => value + 1)}>পরের পৃষ্ঠা</button></nav>}
    </div>
  );
}
