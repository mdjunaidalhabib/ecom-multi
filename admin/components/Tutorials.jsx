"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Loader2, Play, Search, X, VideoOff } from "lucide-react";
import Toast from "./Toast";
import {
  TUTORIAL_SECTIONS,
  sectionLabel,
  youtubeThumb,
  youtubeEmbed,
} from "../lib/tutorialSections";

function TutorialCard({ tutorial, onPlay }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(tutorial)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumb(tutorial.videoId)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/30">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-lg transition group-hover:scale-110">
            <Play size={20} className="ml-0.5" fill="currentColor" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="w-fit rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
          {sectionLabel(tutorial.section)}
        </span>
        <h3 className="text-sm font-bold leading-snug text-gray-900 dark:text-slate-100 line-clamp-2">
          {tutorial.title}
        </h3>
        {tutorial.description && (
          <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-400 line-clamp-2">
            {tutorial.description}
          </p>
        )}
      </div>
    </button>
  );
}

function PlayerModal({ tutorial, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tutorial.title}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-slate-800 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {sectionLabel(tutorial.section)}
            </span>
            <h2 className="truncate text-base font-bold text-gray-900 dark:text-slate-100 sm:text-lg">
              {tutorial.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="aspect-video w-full bg-black">
          <iframe
            src={youtubeEmbed(tutorial.videoId)}
            title={tutorial.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        {tutorial.description && (
          <p className="px-4 py-3 text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:px-5">
            {tutorial.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [section, setSection] = useState("all");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/tutorials");
        const data = await res.json();
        setTutorials(Array.isArray(data) ? data : []);
      } catch {
        setToast({ message: "টিউটোরিয়াল লোড করা যায়নি", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(() => {
    const c = { all: tutorials.length };
    for (const t of tutorials) c[t.section] = (c[t.section] || 0) + 1;
    return c;
  }, [tutorials]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tutorials.filter(
      (t) =>
        (section === "all" || t.section === section) &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)),
    );
  }, [tutorials, section, query]);

  // শুধু যে সেকশনে অন্তত একটা ভিডিও আছে সেগুলোই ট্যাবে দেখাই
  const tabs = [
    { key: "all", label: "সব" },
    ...TUTORIAL_SECTIONS.filter((s) => counts[s.key]),
  ];

  return (
    <div className="mx-auto max-w-6xl p-2 sm:p-4">
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg sm:p-7">
        <div className="mb-2 flex items-center gap-2 text-indigo-100">
          <GraduationCap size={20} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tutorials
          </span>
        </div>
        <h1 className="text-xl font-bold sm:text-2xl">
          ভিডিও দেখে শিখুন, নিজেই ম্যানেজ করুন
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          আপনার ওয়েবসাইটের কোন সেকশন কীভাবে ম্যানেজ করবেন — ধাপে ধাপে ভিডিও গাইড।
        </p>

        <div className="relative mt-4 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="টিউটোরিয়াল খুঁজুন..."
            className="w-full rounded-xl border-0 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/60"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
      ) : tutorials.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-16 text-center">
          <VideoOff size={32} className="mb-3 text-gray-400 dark:text-slate-500" />
          <p className="font-semibold text-gray-700 dark:text-slate-200">
            এখনো কোনো টিউটোরিয়াল যোগ করা হয়নি
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            শীঘ্রই ভিডিও গাইড যোগ করা হবে — আবার দেখে যান।
          </p>
        </div>
      ) : (
        <>
          <div className="-mx-2 mb-5 flex gap-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {tabs.map((tab) => {
              const active = section === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSection(tab.key)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 ring-1 ring-gray-200 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 text-xs ${active ? "text-indigo-100" : "text-gray-400 dark:text-slate-500"}`}
                  >
                    {counts[tab.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-14 text-center text-sm text-gray-500 dark:text-slate-400">
              কোনো টিউটোরিয়াল পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((t) => (
                <TutorialCard key={t._id} tutorial={t} onPlay={setPlaying} />
              ))}
            </div>
          )}
        </>
      )}

      {playing && <PlayerModal tutorial={playing} onClose={() => setPlaying(null)} />}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
