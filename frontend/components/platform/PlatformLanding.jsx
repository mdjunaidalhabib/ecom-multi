"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardList,
  Globe2,
  Layers,
  LifeBuoy,
  Mail,
  Megaphone,
  Package,
  Palette,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import AdminCTA from "./AdminCTA";
import PlatformHeader from "./PlatformHeader";
import PlatformFooter from "./PlatformFooter";
import PlatformContactFab from "./PlatformContactFab";

const CAPABILITIES = [
  "কাস্টম ডোমেইন",
  "bKash / Nagad",
  "Cash on Delivery",
  "PWA স্টোরফ্রন্ট",
  "রিয়েল-টাইম অর্ডার ড্যাশবোর্ড",
  "মাল্টি-শপ ম্যানেজমেন্ট",
];

const STEPS = [
  {
    n: "০১",
    title: "শপ তৈরি করুন",
    desc: "ব্র্যান্ড নাম, লোগো, থিম আর ডোমেইন সেট করুন — অ্যাডমিন প্যানেল থেকে কয়েক মিনিটেই।",
  },
  {
    n: "০২",
    title: "প্রোডাক্ট যোগ করুন",
    desc: "ছবি, দাম, ভ্যারিয়েন্ট ও স্টক দিয়ে ক্যাটালগ সাজান, ক্যাটাগরি অনুযায়ী গুছিয়ে রাখুন।",
  },
  {
    n: "০৩",
    title: "অর্ডার প্রসেস করুন",
    desc: "গ্রাহক অর্ডার করবে, পেমেন্ট কনফার্ম হবে, আপনি ড্যাশবোর্ড থেকে ডেলিভারি ট্র্যাক করবেন।",
  },
];

const PLANS = [
  {
    name: "Free",
    tagline: "নতুন শপ শুরু করার জন্য",
    highlights: ["৫০টি পর্যন্ত প্রোডাক্ট", "১ জন অ্যাডমিন", "সম্পূর্ণ স্টোরফ্রন্ট"],
  },
  {
    name: "Starter",
    tagline: "বাড়ন্ত ব্যবসার জন্য",
    highlights: ["২০০টি পর্যন্ত প্রোডাক্ট", "২ জন অ্যাডমিন", "অ্যানালিটিক্স ও প্রোমো কোড", "পেমেন্ট ইন্টিগ্রেশন"],
  },
  {
    name: "Business",
    tagline: "পূর্ণাঙ্গ প্রফেশনাল ফিচারের জন্য",
    highlights: ["১,০০০টি পর্যন্ত প্রোডাক্ট", "৫ জন অ্যাডমিন", "কাস্টম ডোমেইন", "ল্যান্ডিং পেজ ও ইনভয়েস কাস্টমাইজেশন"],
    popular: true,
  },
  {
    name: "Custom",
    tagline: "চাহিদা অনুযায়ী সম্পূর্ণ কাস্টমাইজড সমাধান",
    highlights: ["৫,০০০টি পর্যন্ত প্রোডাক্ট", "১০ জন অ্যাডমিন", "সব প্রিমিয়াম ফিচার", "প্রয়োজন অনুযায়ী কাস্টমাইজেশন"],
  },
  {
    name: "Reseller",
    tagline: "একাধিক ক্লায়েন্ট/শপ পরিচালনা ও রিসেল করার জন্য",
    highlights: ["১০,০০০টি পর্যন্ত প্রোডাক্ট", "২০ জন অ্যাডমিন", "মাল্টিপল ক্লায়েন্ট পরিচালনা", "রিসেলিং সুবিধা"],
  },
];

const WHY_US = [
  {
    icon: Zap,
    title: "কয়েক মিনিটেই শপ লাইভ",
    desc: "কোনো কোডিং ছাড়াই ব্র্যান্ড নাম, লোগো ও থিম সেট করে সাথে সাথে স্টোরফ্রন্ট চালু করুন।",
  },
  {
    icon: Wallet,
    title: "বাংলাদেশ-কেন্দ্রিক পেমেন্ট",
    desc: "bKash, Nagad ও Cash on Delivery প্রথম থেকেই ইন্টিগ্রেটেড — আলাদা সেটআপের ঝামেলা নেই।",
  },
  {
    icon: Smartphone,
    title: "মোবাইল-রেডি স্টোরফ্রন্ট",
    desc: "প্রতিটি শপ PWA হিসেবে ইনস্টলযোগ্য, তাই গ্রাহক অ্যাপের মতো অভিজ্ঞতা পায় মোবাইলেই।",
  },
  {
    icon: Layers,
    title: "ব্যবসার সাথে বাড়ে এমন প্ল্যান",
    desc: "নতুন শুরু থেকে মাল্টি-শপ রিসেলিং পর্যন্ত — প্রয়োজন অনুযায়ী প্ল্যান আপগ্রেড করুন।",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ ও নির্ভরযোগ্য",
    desc: "এনক্রিপশন ও সিকিউর সার্ভারে ডেটা সংরক্ষিত থাকে, নিয়মিত মনিটরিং হয় প্ল্যাটফর্মের।",
  },
  {
    icon: LifeBuoy,
    title: "বাংলায় ডেডিকেটেড সাপোর্ট",
    desc: "WhatsApp ও ইমেইলের মাধ্যমে সরাসরি Hikmah IT টিমের সহায়তা পাবেন।",
  },
];

const FAQS = [
  {
    q: "ECMS দিয়ে শপ তৈরি করতে কি কোনো কোডিং জ্ঞান লাগবে?",
    a: "না, লাগবে না। অ্যাডমিন প্যানেল থেকেই ব্র্যান্ড নাম, লোগো, থিম, প্রোডাক্ট ও ডোমেইন সেট করে সম্পূর্ণ শপ পরিচালনা করা যায়।",
  },
  {
    q: "শপ তৈরি করে লাইভ করতে কত সময় লাগে?",
    a: "সাধারণত কয়েক মিনিটের মধ্যেই ব্র্যান্ডিং ও প্রাথমিক প্রোডাক্ট সেট করে শপ লাইভ করা যায়। প্রোডাক্ট সংখ্যা বেশি হলে ক্যাটালগ সাজাতে একটু বেশি সময় লাগতে পারে।",
  },
  {
    q: "কোন কোন পেমেন্ট মেথড সাপোর্ট করে?",
    a: "bKash, Nagad ও Cash on Delivery (COD) প্রথম থেকেই ইন্টিগ্রেটেড। প্ল্যান অনুযায়ী অতিরিক্ত পেমেন্ট গেটওয়েও যোগ করা যায়।",
  },
  {
    q: "আমি কি নিজের কাস্টম ডোমেইনে শপ চালাতে পারবো?",
    a: "হ্যাঁ। Business ও তার উপরের প্ল্যানে নিজের কাস্টম ডোমেইন যুক্ত করে শপ চালানো যায়।",
  },
  {
    q: "পরবর্তীতে প্ল্যান পরিবর্তন বা আপগ্রেড করা যাবে?",
    a: "হ্যাঁ, ব্যবসার চাহিদা অনুযায়ী যেকোনো সময় প্ল্যান আপগ্রেড করা যায় — নতুন করে শপ সেটআপ করার প্রয়োজন হয় না।",
  },
  {
    q: "সমস্যা হলে সাপোর্ট কীভাবে পাবো?",
    a: "WhatsApp বা ইমেইলে সরাসরি যোগাযোগ করলে Hikmah IT-এর টিম সহায়তা দেয়। নিচের 'যোগাযোগ' সেকশনে বিস্তারিত পাবেন।",
  },
];

const CONTACT = {
  email: "hikmahitcenter@gmail.com",
  phone: "০১৬২৪-১১৪৪০৫",
};

const SERVICES = [
  {
    icon: ShoppingBag,
    title: "অনলাইন স্টোর ডেভেলপমেন্ট",
    desc: "আপনার ব্র্যান্ডের জন্য সম্পূর্ণ কাস্টমাইজযোগ্য, প্রফেশনাল অনলাইন স্টোরফ্রন্ট তৈরি — নিজের কাস্টম ডোমেইনে।",
  },
  {
    icon: Package,
    title: "প্রোডাক্ট ও ক্যাটাগরি ম্যানেজমেন্ট",
    desc: "আনলিমিটেড প্রোডাক্ট, ভ্যারিয়েন্ট, স্টক ও ক্যাটাগরি সহজে সাজিয়ে রাখার সিস্টেম।",
  },
  {
    icon: ClipboardList,
    title: "অর্ডার প্রসেসিং ও ইনভয়েসিং",
    desc: "রিয়েল-টাইম অর্ডার ট্র্যাকিং, সাথে কাস্টম ডিজাইন করা ইনভয়েস জেনারেশন।",
  },
  {
    icon: Wallet,
    title: "পেমেন্ট গেটওয়ে ইন্টিগ্রেশন",
    desc: "bKash, Nagad ও Cash on Delivery — সব পেমেন্ট মেথড একসাথে ইন্টিগ্রেটেড।",
  },
  {
    icon: Truck,
    title: "কুরিয়ার ও ডেলিভারি ম্যানেজমেন্ট",
    desc: "কুরিয়ার সেটআপ ও এলাকাভিত্তিক ডেলিভারি চার্জ নিয়ন্ত্রণ করুন সহজেই।",
  },
  {
    icon: Tag,
    title: "প্রোমো কোড ও ডিসকাউন্ট",
    desc: "কাস্টম প্রোমো কোড ও অফার তৈরি করে বিক্রয় বাড়ানোর সুযোগ।",
  },
  {
    icon: Megaphone,
    title: "মার্কেটিং ল্যান্ডিং পেজ",
    desc: "প্রতিটি প্রোডাক্টের জন্য আলাদা হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি করুন।",
  },
  {
    icon: Palette,
    title: "স্টোরফ্রন্ট কাস্টমাইজেশন",
    desc: "থিম, নেভবার, ফুটার, স্লাইডার ও ব্র্যান্ডিং — সবকিছু নিজের মতো সাজান।",
  },
  {
    icon: BarChart3,
    title: "স্টাফ, রোল ও অ্যানালিটিক্স",
    desc: "একাধিক স্টাফ অ্যাকাউন্ট ও রোল পরিচালনা, সাথে বিক্রয় অ্যানালিটিক্স।",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" },
  }),
};

const reveal = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.25 },
  variants: fadeUp,
};

function whatsappPlanLink(whatsappNumber, planName) {
  if (!whatsappNumber) return "#";
  const text = `আমি ECMS-এর "${planName}" প্ল্যানটি নিতে চাই। বিস্তারিত জানতে চাই।`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function whatsappContactLink(whatsappNumber) {
  if (!whatsappNumber) return "#";
  const text = "আমি ECMS সম্পর্কে জানতে চাই।";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.44-1.43a9.87 9.87 0 0 0 4.6 1.17h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.08.99-2.36c.26-.28.56-.35.75-.35h.54c.17 0 .4-.02.62.48.24.55.81 1.9.88 2.04.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      {desc && <p className="mt-3 text-base leading-relaxed text-slate-600">{desc}</p>}
    </motion.div>
  );
}

function DashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-b from-indigo-100/70 to-transparent" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
            admin.yourshop.com
          </span>
        </div>

        <div className="grid grid-cols-[6.5rem_1fr] sm:grid-cols-[7.5rem_1fr]">
          {/* Sidebar */}
          <div className="space-y-1 border-r border-slate-100 bg-slate-50/60 p-3">
            {["ড্যাশবোর্ড", "অর্ডার", "প্রোডাক্ট", "কাস্টমার", "রিপোর্ট"].map((label, i) => (
              <div
                key={label}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                  i === 0 ? "bg-indigo-600 text-white" : "text-slate-500"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[10px] font-medium text-slate-500">আজকের অর্ডার</p>
                <p className="mt-1 text-lg font-bold text-slate-900">৩৮</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[10px] font-medium text-slate-500">বিক্রয়</p>
                <p className="mt-1 text-lg font-bold text-slate-900">৳ ৪২,৫০০</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] font-medium text-slate-500">সাপ্তাহিক বিক্রয়</p>
              <div className="mt-3 flex h-16 items-end gap-2">
                {[40, 65, 35, 80, 55, 90, 60].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${i === 5 ? "bg-indigo-600" : "bg-indigo-100"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
              <span className="text-[11px] text-slate-600">নতুন অর্ডার #১২৮৪</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                কনফার্মড
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ index, q, a, isOpen, onToggle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-slate-900">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-600" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-5 text-sm leading-relaxed text-slate-600">
          <div className="pb-4">{a}</div>
        </div>
      </div>
    </div>
  );
}

export default function PlatformLanding({ adminUrl, whatsappNumber }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div
      className="min-h-screen overflow-x-clip bg-white text-slate-900 antialiased"
      style={{ fontFamily: '"Hind Siliguri", ui-sans-serif, system-ui, sans-serif' }}
    >
      <PlatformHeader adminUrl={adminUrl} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              বাংলাদেশের ব্যবসার জন্য ই-কমার্স প্ল্যাটফর্ম
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-[1.25] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              অনলাইন শপ চালান, <span className="text-indigo-600">ঝামেলা ছাড়াই</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              ECMS, Hikmah IT-এর ই-কমার্স ম্যানেজমেন্ট সিস্টেম, দ্রুত, নিরাপদ ও
              বিক্রয়-উপযোগী অনলাইন স্টোর তৈরি করে। প্রোডাক্ট, অর্ডার, পেমেন্ট ও
              কাস্টমার — সব কিছু একটি ড্যাশবোর্ড থেকে নিয়ন্ত্রণ করুন।
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AdminCTA
                adminUrl={adminUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                ফ্রি ট্রাই করুন
                <ArrowRight size={16} />
              </AdminCTA>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                প্ল্যান দেখুন
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-600" /> নিরাপদ হোস্টিং
              </li>
              <li className="flex items-center gap-2">
                <Globe2 size={16} className="text-indigo-600" /> কাস্টম ডোমেইন
              </li>
              <li className="flex items-center gap-2">
                <Smartphone size={16} className="text-indigo-600" /> মোবাইল-রেডি
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <DashboardMock />
          </motion.div>
        </div>
      </section>

      {/* Capabilities strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {CAPABILITIES.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Check size={15} className="text-indigo-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services */}
      <section id="features" className="scroll-mt-16 mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <SectionHeading
          eyebrow="আমাদের সার্ভিস"
          title="প্রফেশনাল ই-কমার্স সার্ভিসসমূহ"
          desc="আপনার ব্যবসাকে অনলাইনে নিয়ে যাওয়ার জন্য যা যা দরকার, সবই এক জায়গায়।"
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              custom={i % 3}
              {...reveal}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section id="why-us" className="scroll-mt-16 border-y border-slate-100 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            eyebrow="কেন ECMS"
            title="কেন ব্যবসার জন্য ECMS বেছে নেবেন"
            desc="অন্য প্ল্যাটফর্মের বদলে ECMS-এ শপ চালানোর পেছনে যে কারণগুলো সবচেয়ে বেশি গুরুত্বপূর্ণ।"
          />

          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} custom={i % 3} {...reveal} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="scroll-mt-16 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading
            eyebrow="প্ল্যান"
            title="যে যেভাবে বড় হচ্ছেন, সেভাবেই প্ল্যান"
            desc="ছোট শুরু থেকে বড় পরিসরের ব্যবসা — সব ধরনের প্রয়োজনের জন্য আলাদা প্ল্যান রয়েছে।"
          />

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i % 3}
                {...reveal}
                className={`relative flex flex-col rounded-2xl p-6 ${
                  plan.popular
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 xl:-translate-y-3"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white">
                    সবচেয়ে জনপ্রিয়
                  </span>
                )}

                <h3 className={`text-lg font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-1.5 min-h-[2.5rem] text-sm leading-snug ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                  {plan.tagline}
                </p>

                <div className={`my-5 h-px ${plan.popular ? "bg-slate-700" : "bg-slate-100"}`} />

                <ul className="flex-1 space-y-3">
                  {plan.highlights.map((h) => (
                    <li
                      key={h}
                      className={`flex items-start gap-2.5 text-sm ${plan.popular ? "text-slate-200" : "text-slate-700"}`}
                    >
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${plan.popular ? "text-indigo-400" : "text-indigo-600"}`}
                      />
                      {h}
                    </li>
                  ))}
                </ul>

                <a
                  href={whatsappPlanLink(whatsappNumber, plan.name)}
                  target={whatsappNumber ? "_blank" : undefined}
                  rel={whatsappNumber ? "noopener noreferrer" : undefined}
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  এই প্ল্যান নিন
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16 border-y border-slate-100 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHeading eyebrow="প্রক্রিয়া" title="মাত্র ৩ ধাপে শুরু করুন" />

          <div className="relative mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                custom={i}
                {...reveal}
                className="relative rounded-xl border border-slate-200 bg-white p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-[1.15rem] top-1/2 z-10 hidden -translate-y-1/2 text-slate-300 md:block"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <SectionHeading
            eyebrow="সাধারণ জিজ্ঞাসা"
            title="যা সবচেয়ে বেশি জানতে চাওয়া হয়"
            desc="ECMS নিয়ে সাধারণ প্রশ্নের উত্তর। আরও কিছু জানতে চাইলে নিচে যোগাযোগ করুন।"
          />

          <motion.div {...reveal} className="mt-10 space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={faq.q}
                index={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                onToggle={(idx) => setOpenFaq((cur) => (cur === idx ? null : idx))}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-16 border-y border-slate-100 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHeading
            eyebrow="যোগাযোগ"
            title="আমাদের সাথে যোগাযোগ করুন"
            desc="শপ শুরু করা নিয়ে প্রশ্ন থাকলে বা ডেমো দেখতে চাইলে সরাসরি যোগাযোগ করুন — দ্রুত উত্তর পাবেন।"
          />

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <motion.a
              href={whatsappContactLink(whatsappNumber)}
              target={whatsappNumber ? "_blank" : undefined}
              rel={whatsappNumber ? "noopener noreferrer" : undefined}
              custom={0}
              {...reveal}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center transition-shadow hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">WhatsApp</h3>
                <p className="mt-1 text-sm text-slate-600">দ্রুততম উত্তরের জন্য মেসেজ করুন</p>
              </div>
            </motion.a>

            <motion.a
              href={`mailto:${CONTACT.email}`}
              custom={1}
              {...reveal}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center transition-shadow hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">ইমেইল</h3>
                <p className="mt-1 break-all text-sm text-slate-600">{CONTACT.email}</p>
              </div>
            </motion.a>

            <motion.a
              href={`tel:${CONTACT.phone.replace(/[^0-9]/g, "")}`}
              custom={2}
              {...reveal}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center transition-shadow hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">ফোন</h3>
                <p className="mt-1 text-sm text-slate-600">{CONTACT.phone}</p>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <motion.div
          {...reveal}
          className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-14 text-center sm:px-12 sm:py-16"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at center, #000 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, #000 20%, transparent 75%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">আজই আপনার অনলাইন শপ চালু করুন</h2>
            <p className="mx-auto mt-3 max-w-md text-indigo-100">
              Hikmah IT-এর ECMS প্ল্যাটফর্মে আপনার ব্যবসাকে ডিজিটাল রূপ দিন।
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <AdminCTA
                adminUrl={adminUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
              >
                ফ্রি ট্রাই করুন
                <ArrowRight size={16} />
              </AdminCTA>
              <a
                href="https://hikmahit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-300/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Hikmah IT সম্পর্কে জানুন
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <PlatformFooter />
      <PlatformContactFab whatsappNumber={whatsappNumber} />
    </div>
  );
}
