"use client";

import { useEffect, useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

function FaqSkeleton() {
  return (
    <div className="bg-pink-50 min-h-screen animate-pulse">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <div className="h-8 w-1/2 bg-pink-200 rounded mx-auto" />
        <div className="h-4 w-2/3 bg-pink-100 rounded mx-auto" />
        <div className="space-y-4 pt-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccordionItem({ heading, content, isOpen, onToggle }) {
  return (
    <div
      className={`rounded-2xl border bg-pink-50 shadow-md shadow-pink-200/30 transition-all overflow-hidden ${
        isOpen ? "border-pink-300 shadow-lg shadow-pink-200/50" : "border-pink-100"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
      >
        <h3 className="font-bold text-slate-900">{heading}</h3>
        <ChevronDown
          size={20}
          className={`shrink-0 text-pink-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-slate-600 leading-8 whitespace-pre-line">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch("/api/faq", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load FAQ data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("❌ FAQ Error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  if (loading) return <FaqSkeleton />;
  if (!data) return null;

  const { pageTitle, intro, sections = [] } = data;

  return (
    <div className="bg-pink-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-pink-100">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
            <HelpCircle className="text-pink-500" size={24} />
          </div>
          <h1 className="mt-5 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
          {intro && (
            <p className="mt-4 text-slate-500 leading-7 max-w-xl mx-auto text-sm md:text-base">
              {intro}
            </p>
          )}
        </div>
      </header>

      {/* Sections — accordion */}
      {sections.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-10">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <AccordionItem
                key={index}
                heading={section.heading}
                content={section.content}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex((cur) => (cur === index ? -1 : index))}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
