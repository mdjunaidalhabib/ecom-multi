"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardList,
  Crown,
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
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import AdminCTA from "./AdminCTA";
import PlatformHeader from "./PlatformHeader";
import PlatformFooter from "./PlatformFooter";
import PlatformContactFab from "./PlatformContactFab";

const TICKER_ITEMS = [
  "কাস্টম ডোমেইন",
  "bKash / Nagad",
  "Cash on Delivery",
  "PWA — ইনস্টলযোগ্য স্টোরফ্রন্ট",
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
    accent: "teal",
  },
  {
    name: "Starter",
    tagline: "বাড়ন্ত ব্যবসার জন্য",
    highlights: ["২০০টি পর্যন্ত প্রোডাক্ট", "২ জন অ্যাডমিন", "অ্যানালিটিক্স ও প্রোমো কোড", "পেমেন্ট ইন্টিগ্রেশন"],
    accent: "emerald",
  },
  {
    name: "Business",
    tagline: "পূর্ণাঙ্গ প্রফেশনাল ফিচারের জন্য",
    highlights: ["১,০০০টি পর্যন্ত প্রোডাক্ট", "৫ জন অ্যাডমিন", "কাস্টম ডোমেইন", "ল্যান্ডিং পেজ ও ইনভয়েস কাস্টমাইজেশন"],
    popular: true,
    accent: "orange",
  },
  {
    name: "Custom",
    tagline: "চাহিদা অনুযায়ী সম্পূর্ণ কাস্টমাইজড সমাধান",
    highlights: ["৫,০০০টি পর্যন্ত প্রোডাক্ট", "১০ জন অ্যাডমিন", "সব প্রিমিয়াম ফিচার", "প্রয়োজন অনুযায়ী কাস্টমাইজেশন"],
    accent: "amber",
  },
  {
    name: "Reseller",
    tagline: "একাধিক ক্লায়েন্ট/শপ পরিচালনা ও রিসেল করার জন্য",
    highlights: ["১০,০০০টি পর্যন্ত প্রোডাক্ট", "২০ জন অ্যাডমিন", "মাল্টিপল ক্লায়েন্ট পরিচালনা", "রিসেলিং সুবিধা"],
    accent: "rose",
  },
];

const ACCENTS = {
  orange: {
    icon: "bg-gradient-to-br from-orange-500 to-rose-500",
    glow: "bg-orange-300/40",
    text: "text-orange-600",
    chip: "bg-orange-50 text-orange-700 border-orange-100",
  },
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-amber-600",
    glow: "bg-amber-300/40",
    text: "text-amber-600",
    chip: "bg-amber-50 text-amber-700 border-amber-100",
  },
  teal: {
    icon: "bg-gradient-to-br from-teal-500 to-teal-600",
    glow: "bg-teal-300/40",
    text: "text-teal-600",
    chip: "bg-teal-50 text-teal-700 border-teal-100",
  },
  emerald: {
    icon: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    glow: "bg-emerald-300/40",
    text: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  rose: {
    icon: "bg-gradient-to-br from-rose-500 to-pink-600",
    glow: "bg-rose-300/40",
    text: "text-rose-600",
    chip: "bg-rose-50 text-rose-700 border-rose-100",
  },
};

const WHY_US = [
  {
    icon: Zap,
    title: "কয়েক মিনিটেই শপ লাইভ",
    desc: "কোনো কোডিং ছাড়াই ব্র্যান্ড নাম, লোগো ও থিম সেট করে সাথে সাথে স্টোরফ্রন্ট চালু করুন।",
    accent: "orange",
  },
  {
    icon: Wallet,
    title: "বাংলাদেশ-কেন্দ্রিক পেমেন্ট",
    desc: "bKash, Nagad ও Cash on Delivery প্রথম থেকেই ইন্টিগ্রেটেড — আলাদা সেটআপের ঝামেলা নেই।",
    accent: "teal",
  },
  {
    icon: Smartphone,
    title: "মোবাইল-রেডি স্টোরফ্রন্ট",
    desc: "প্রতিটি শপ PWA হিসেবে ইনস্টলযোগ্য, তাই গ্রাহক অ্যাপের মতো অভিজ্ঞতা পায় মোবাইলেই।",
    accent: "emerald",
  },
  {
    icon: Layers,
    title: "ব্যবসার সাথে বাড়ে এমন প্ল্যান",
    desc: "নতুন শুরু থেকে মাল্টি-শপ রিসেলিং পর্যন্ত — প্রয়োজন অনুযায়ী প্ল্যান আপগ্রেড করুন।",
    accent: "amber",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ ও নির্ভরযোগ্য",
    desc: "এনক্রিপশন ও সিকিউর সার্ভারে ডেটা সংরক্ষিত থাকে, নিয়মিত মনিটরিং হয় প্ল্যাটফর্মের।",
    accent: "rose",
  },
  {
    icon: LifeBuoy,
    title: "বাংলায় ডেডিকেটেড সাপোর্ট",
    desc: "WhatsApp ও ইমেইলের মাধ্যমে সরাসরি Hikmah IT টিমের সহায়তা পাবেন।",
    accent: "orange",
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
    tag: "কোর সার্ভিস",
    title: "অনলাইন স্টোর ডেভেলপমেন্ট",
    desc: "আপনার ব্র্যান্ডের জন্য সম্পূর্ণ কাস্টমাইজযোগ্য, প্রফেশনাল অনলাইন স্টোরফ্রন্ট তৈরি — নিজের কাস্টম ডোমেইনে।",
    accent: "orange",
  },
  {
    icon: Package,
    tag: "ইনভেন্টরি",
    title: "প্রোডাক্ট ও ক্যাটাগরি ম্যানেজমেন্ট",
    desc: "আনলিমিটেড প্রোডাক্ট, ভ্যারিয়েন্ট, স্টক ও ক্যাটাগরি সহজে সাজিয়ে রাখার সিস্টেম।",
    accent: "teal",
  },
  {
    icon: ClipboardList,
    tag: "অর্ডার",
    title: "অর্ডার প্রসেসিং ও ইনভয়েসিং",
    desc: "রিয়েল-টাইম অর্ডার ট্র্যাকিং, সাথে কাস্টম ডিজাইন করা ইনভয়েস জেনারেশন।",
    accent: "amber",
  },
  {
    icon: Wallet,
    tag: "পেমেন্ট",
    title: "পেমেন্ট গেটওয়ে ইন্টিগ্রেশন",
    desc: "bKash, Nagad ও Cash on Delivery — সব পেমেন্ট মেথড একসাথে ইন্টিগ্রেটেড।",
    accent: "rose",
  },
  {
    icon: Truck,
    tag: "ডেলিভারি",
    title: "কুরিয়ার ও ডেলিভারি ম্যানেজমেন্ট",
    desc: "কুরিয়ার সেটআপ ও এলাকাভিত্তিক ডেলিভারি চার্জ নিয়ন্ত্রণ করুন সহজেই।",
    accent: "emerald",
  },
  {
    icon: Tag,
    tag: "মার্কেটিং",
    title: "প্রোমো কোড ও ডিসকাউন্ট",
    desc: "কাস্টম প্রোমো কোড ও অফার তৈরি করে বিক্রয় বাড়ানোর সুযোগ।",
    accent: "orange",
  },
  {
    icon: Megaphone,
    tag: "ক্যাম্পেইন",
    title: "মার্কেটিং ল্যান্ডিং পেজ",
    desc: "প্রতিটি প্রোডাক্টের জন্য আলাদা হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি করুন।",
    accent: "teal",
  },
  {
    icon: Palette,
    tag: "ব্র্যান্ডিং",
    title: "স্টোরফ্রন্ট কাস্টমাইজেশন",
    desc: "থিম, নেভবার, ফুটার, স্লাইডার ও ব্র্যান্ডিং — সবকিছু নিজের মতো সাজান।",
    accent: "amber",
  },
  {
    icon: BarChart3,
    tag: "ম্যানেজমেন্ট",
    title: "স্টাফ, রোল ও অ্যানালিটিক্স",
    desc: "একাধিক স্টাফ অ্যাকাউন্ট ও রোল পরিচালনা, সাথে বিক্রয় অ্যানালিটিক্স।",
    accent: "rose",
  },
];

function useTilt() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.07, ease: "easeOut" },
  }),
};

function DashboardMock() {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="relative mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-2xl shadow-orange-200/50 backdrop-blur-xl sm:max-w-lg"
    >
      <div className="flex items-center gap-1.5 px-2 pb-3 pt-1">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 rounded-md bg-gray-100 px-3 py-1 text-[10px] font-medium text-gray-400">
          ecms-admin
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="col-span-1 space-y-2 rounded-lg bg-white p-2.5 shadow-sm">
          {["ড্যাশবোর্ড", "অর্ডার", "প্রোডাক্ট", "কাস্টমার"].map((label, i) => (
            <div
              key={label}
              className={`rounded-md px-2 py-1.5 text-[10px] font-semibold ${
                i === 0 ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white" : "text-gray-400"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="col-span-2 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
              <p className="text-[9px] font-medium text-gray-400">আজকের অর্ডার</p>
              <p className="mt-1 text-base font-extrabold text-gray-900">৩৮</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
              <p className="text-[9px] font-medium text-gray-400">বিক্রয়</p>
              <p className="mt-1 text-base font-extrabold text-gray-900">৳ ৪২,৫০০</p>
            </div>
          </div>

          <div className="flex h-16 items-end gap-1.5 rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
            {[40, 65, 35, 80, 55, 90, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-orange-500 to-rose-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-2.5 py-2 shadow-sm">
            <span className="text-[10px] text-gray-500">নতুন অর্ডার #১২৮৪</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
              কনফার্মড
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-gray-200 bg-gradient-to-r from-teal-50 via-orange-50 to-rose-50 py-3.5">
      <div className="animate-[ecms-marquee_28s_linear_infinite] flex w-max gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Sparkles size={13} className="text-orange-500" />
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ecms-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function StepsPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <button
            key={step.n}
            onClick={() => setActive(i)}
            className={`group relative block w-full rounded-2xl border px-5 py-4 text-left transition-all ${
              active === i
                ? "border-orange-200 bg-orange-50/60"
                : "border-gray-100 bg-transparent hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`text-sm font-black tracking-tight ${
                  active === i ? "text-orange-600" : "text-gray-300"
                }`}
              >
                {step.n}
              </span>
              <div className="flex-1">
                <h3 className={`font-bold ${active === i ? "text-gray-900" : "text-gray-500"}`}>
                  {step.title}
                </h3>
                {active === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1.5 text-sm leading-relaxed text-gray-500"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </div>
            </div>
            {active === i && (
              <motion.div
                layoutId="step-progress"
                className="absolute bottom-0 left-5 right-5 h-px overflow-hidden bg-gray-200"
              >
                <motion.div
                  key={active}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3.8, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500"
                />
              </motion.div>
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex aspect-square max-w-sm items-center justify-center justify-self-center rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-teal-50 p-8 shadow-sm sm:aspect-video lg:aspect-square"
      >
        {active === 0 && (
          <div className="relative w-full space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-500 to-rose-500" />
              <span className="text-xs font-semibold text-gray-700">আপনার ব্র্যান্ড নাম</span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-500 shadow-sm">
              yourbrand.com
            </div>
            <div className="flex gap-2">
              {["#f97316", "#f43f5e", "#0d9488"].map((c) => (
                <span key={c} className="h-7 w-7 rounded-full border border-white shadow" style={{ background: c }} />
              ))}
            </div>
          </div>
        )}
        {active === 1 && (
          <div className="relative grid w-full grid-cols-2 gap-3">
            {[Package, ShoppingBag].map((Icon, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Icon size={18} className="text-orange-500" />
                <div className="mt-3 h-2 w-3/4 rounded-full bg-gray-200" />
                <div className="mt-2 h-2 w-1/2 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        )}
        {active === 2 && (
          <div className="relative w-full space-y-2.5">
            {["#১২৮১ — কনফার্মড", "#১২৮২ — প্রসেসিং", "#১২৮৩ — ডেলিভারড"].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-600 shadow-sm"
              >
                {row}
                <Check size={14} className="text-emerald-500" />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

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

function FAQItem({ index, q, a, isOpen, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors ${
        isOpen ? "border-orange-200 bg-orange-50/40" : "border-gray-100 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-gray-900">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-5 pb-4 text-sm leading-relaxed text-gray-500">{a}</div>
      </div>
    </div>
  );
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.44-1.43a9.87 9.87 0 0 0 4.6 1.17h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.08.99-2.36c.26-.28.56-.35.75-.35h.54c.17 0 .4-.02.62.48.24.55.81 1.9.88 2.04.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export default function PlatformLanding({ adminUrl, whatsappNumber }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-gradient-to-br from-teal-50 via-amber-50 to-orange-100 text-gray-900"
      style={{ fontFamily: '"Hind Siliguri", ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* Ambient background — persists across the whole page */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-teal-300/50 blur-[100px]" />
        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-orange-300/50 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-rose-300/45 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[22rem] w-[22rem] rounded-full bg-amber-200/40 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <PlatformHeader adminUrl={adminUrl} />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-6 sm:pt-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-600">
              <ShoppingCart size={12} />
              Online Shopping Platform
            </span>

            <h1 className="mt-4 text-3xl font-semibold leading-[1.2] tracking-tight text-gray-900 sm:text-4xl md:text-[2.6rem]">
              অনলাইন শপ চালান,{" "}
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                ঝামেলা ছাড়াই
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
              ECMS, Hikmah IT-এর ই-কমার্স ম্যানেজমেন্ট সিস্টেম, বাংলাদেশের
              ব্যবসার জন্য দ্রুত, নিরাপদ ও বিক্রয়-উপযোগী অনলাইন স্টোর তৈরি করে।
              প্রোডাক্ট, অর্ডার, পেমেন্ট ও কাস্টমার, সব কিছু একটি ড্যাশবোর্ড
              থেকে নিয়ন্ত্রণ করুন।
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AdminCTA
                adminUrl={adminUrl}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-300/40 transition-transform hover:scale-105"
              >
                ফ্রি ট্রাই করুন
                <ArrowRight size={15} />
              </AdminCTA>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                প্ল্যান দেখুন
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> নিরাপদ হোস্টিং</span>
              <span className="flex items-center gap-1.5"><Globe2 size={14} className="text-amber-500" /> কাস্টম ডোমেইন</span>
              <span className="flex items-center gap-1.5"><Smartphone size={14} className="text-teal-500" /> মোবাইল-রেডি</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <DashboardMock />
          </motion.div>
        </div>
      </section>

      <Ticker />

      {/* Services */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="mx-auto max-w-xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">আমাদের সার্ভিস</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            প্রফেশনাল ই-কমার্স সার্ভিসসমূহ
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            আপনার ব্যবসাকে অনলাইনে নিয়ে যাওয়ার জন্য যা যা দরকার, সবই এক জায়গায়।
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, tag, title, desc, accent }, i) => {
            const a = ACCENTS[accent];
            return (
              <motion.div
                key={title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/70"
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${a.glow} blur-3xl opacity-0 transition-opacity group-hover:opacity-100`} />

                <div className="relative flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md ${a.icon}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${a.chip}`}>{tag}</span>
                </div>

                <h3 className="relative mt-5 font-semibold text-gray-900">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why us */}
      <section id="why-us" className="border-t border-gray-100 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mx-auto max-w-xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">কেন ECMS</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              কেন ব্যবসার জন্য ECMS বেছে নেবেন
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              অন্য প্ল্যাটফর্মের বদলে ECMS-এ শপ চালানোর পেছনে যে কারণগুলো সবচেয়ে বেশি গুরুত্বপূর্ণ।
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map(({ icon: Icon, title, desc, accent }, i) => {
              const a = ACCENTS[accent];
              return (
                <motion.div
                  key={title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${a.icon}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="border-t border-gray-100 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mx-auto max-w-xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">প্ল্যান</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              যে যেভাবে বড় হচ্ছেন, সেভাবেই প্ল্যান
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              ছোট শুরু থেকে বড় পরিসরের ব্যবসা — সব ধরনের প্রয়োজনের জন্য আলাদা প্ল্যান রয়েছে।
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PLANS.map((plan, i) => {
              const a = ACCENTS[plan.accent];
              return (
                <motion.div
                  key={plan.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    plan.popular
                      ? "border-orange-300 bg-gradient-to-b from-orange-50/80 to-white shadow-xl shadow-orange-100 lg:-translate-y-2"
                      : "border-gray-100 bg-white shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                      <Crown size={11} />
                      সবচেয়ে জনপ্রিয়
                    </span>
                  )}
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black text-white shadow ${a.icon}`}>
                    {plan.name.charAt(0)}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{plan.tagline}</p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={whatsappPlanLink(whatsappNumber, plan.name)}
                    target={whatsappNumber ? "_blank" : undefined}
                    rel={whatsappNumber ? "noopener noreferrer" : undefined}
                    className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-200 transition-transform hover:scale-105"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    এই প্ল্যান নিন
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-gray-100 bg-gradient-to-b from-teal-50/70 via-white to-orange-50/50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mx-auto max-w-xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">প্রক্রিয়া</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              মাত্র ৩ ধাপে শুরু করুন
            </h2>
          </motion.div>

          <div className="mt-14">
            <StepsPanel />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-gray-100 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mx-auto max-w-xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">সাধারণ জিজ্ঞাসা</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              যা সবচেয়ে বেশি জানতে চাওয়া হয়
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              ECMS নিয়ে সাধারণ প্রশ্নের উত্তর। আরও কিছু জানতে চাইলে নিচে যোগাযোগ করুন।
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mt-10 space-y-3"
          >
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
      <section id="contact" className="border-t border-gray-100 bg-gradient-to-b from-teal-50/60 via-white to-orange-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mx-auto max-w-xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">যোগাযোগ</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              আমাদের সাথে যোগাযোগ করুন
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              শপ শুরু করা নিয়ে প্রশ্ন থাকলে বা ডেমো দেখতে চাইলে সরাসরি যোগাযোগ করুন — দ্রুত উত্তর পাবেন।
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <motion.a
              href={whatsappContactLink(whatsappNumber)}
              target={whatsappNumber ? "_blank" : undefined}
              rel={whatsappNumber ? "noopener noreferrer" : undefined}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md shadow-emerald-200">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <p className="mt-1 text-sm text-gray-500">দ্রুততম উত্তরের জন্য মেসেজ করুন</p>
              </div>
            </motion.a>

            <motion.a
              href={`mailto:${CONTACT.email}`}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ইমেইল</h3>
                <p className="mt-1 break-all text-sm text-gray-500">{CONTACT.email}</p>
              </div>
            </motion.a>

            <motion.a
              href={`tel:${CONTACT.phone.replace(/[^0-9]/g, "")}`}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-200">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ফোন</h3>
                <p className="mt-1 text-sm text-gray-500">{CONTACT.phone}</p>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 px-6 py-16 text-center shadow-2xl shadow-orange-200"
        >
          <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[8rem] font-black leading-none text-white/10 sm:text-[11rem]">
            ECMS
          </p>
          <div className="relative">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">আজই আপনার অনলাইন শপ চালু করুন</h2>
            <p className="mx-auto mt-3 max-w-md text-white/80">
              Hikmah IT-এর ECMS প্ল্যাটফর্মে আপনার ব্যবসাকে ডিজিটাল রূপ দিন।
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="https://hikmahit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-gray-900 shadow-xl transition-transform hover:scale-105"
              >
                Hikmah IT সম্পর্কে জানুন
                <ArrowRight size={16} />
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
