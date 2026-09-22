"use client";

import { motion } from "framer-motion";
import { Scale, ShieldCheck } from "lucide-react";
import PlatformHeader from "./PlatformHeader";
import PlatformFooter from "./PlatformFooter";

// হালকা entrance fade — শুধু mount-এ একবার চলে (scroll-triggered viewport
// observer নেই), তাই পেজ লোড হয়ে হুট করে না এসে আলতো করে ভেসে ওঠে।
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: Math.min(i * 0.05, 0.4), ease: "easeOut" },
  }),
};

const CONTACT = {
  email: "hikmahitcenter@gmail.com",
  phone: "০১৬২৪-১১৪৪০৫",
};

const LAST_UPDATED = "৯ সেপ্টেম্বর, ২০২৬";

const PRIVACY_SECTIONS = [
  {
    title: "১. ভূমিকা",
    body: [
      { text: "ECMS (Hikmah IT-এর ই-কমার্স ম্যানেজমেন্ট সিস্টেম) আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তাকে গুরুত্ব সহকারে বিবেচনা করে। এই প্রাইভেসি পলিসি ব্যাখ্যা করে যে আমরা কীভাবে প্ল্যাটফর্ম, অ্যাডমিন প্যানেল এবং প্রতিটি শপের স্টোরফ্রন্ট ব্যবহারের সময় আপনার তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ ও সুরক্ষিত রাখি।" },
      { text: "ECMS ব্যবহার করে শপ তৈরি করলে, কোনো শপে ক্রেতা হিসেবে অর্ডার করলে, বা Google Sign-In দিয়ে অ্যাকাউন্ট তৈরি করলে — আপনি এই প্রাইভেসি পলিসিতে বর্ণিত শর্তাবলীর সাথে সম্মত হচ্ছেন বলে ধরে নেওয়া হবে।" },
    ],
  },
  {
    title: "২. আমরা যেসব তথ্য সংগ্রহ করি",
    body: [
      { label: "ক) আপনার দেওয়া তথ্য", items: [
        "নাম, ইমেইল ঠিকানা ও ফোন নম্বর",
        "শপ অ্যাডমিন হিসেবে ব্র্যান্ড নাম, লোগো, ডোমেইন ও থিম সেটিংস",
        "প্রোডাক্ট, অর্ডার, কাস্টমার ও ইনভয়েস সংক্রান্ত তথ্য",
        "পেমেন্ট সংক্রান্ত তথ্য (যেমন লেনদেন নম্বর — সম্পূর্ণ কার্ড/অ্যাকাউন্ট তথ্য আমরা সংরক্ষণ করি না)",
      ]},
      { label: "খ) Google Sign-In ব্যবহার করলে", text:
        "আপনি Google অ্যাকাউন্ট দিয়ে সাইন-ইন করলে, Google থেকে আমরা শুধু আপনার নাম, ইমেইল ঠিকানা ও প্রোফাইল ছবি (যদি থাকে) সংগ্রহ করি — আপনার অনুমতির ভিত্তিতে। আমরা কখনো আপনার Google পাসওয়ার্ড দেখতে বা সংরক্ষণ করতে পারি না।",
      },
      { label: "গ) স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য", items: [
        "ব্রাউজার টাইপ, ডিভাইস তথ্য ও IP অ্যাড্রেস",
        "প্ল্যাটফর্ম ও স্টোরফ্রন্ট ব্যবহারের প্যাটার্ন (অ্যানালিটিক্সের মাধ্যমে)",
        "কুকিজ ও সেশন সংক্রান্ত তথ্য",
      ]},
    ],
  },
  {
    title: "৩. আমরা কীভাবে তথ্য ব্যবহার করি",
    body: [
      { items: [
        "অ্যাকাউন্ট তৈরি, লগইন ও প্রমাণীকরণ (Google Sign-In সহ) পরিচালনার জন্য",
        "শপ, প্রোডাক্ট, অর্ডার ও ইনভয়েস পরিচালনার জন্য",
        "গ্রাহক সাপোর্ট প্রদান ও প্রশ্নের উত্তর দেওয়ার জন্য",
        "পেমেন্ট প্রক্রিয়াকরণ ও লেনদেন নিশ্চিতকরণের জন্য",
        "গুরুত্বপূর্ণ নোটিফিকেশন, আপডেট বা প্রমোশনাল তথ্য পাঠানোর জন্য (অপ্ট-আউট সুযোগসহ)",
        "প্ল্যাটফর্মের নিরাপত্তা বজায় রাখা ও জালিয়াতি প্রতিরোধের জন্য",
        "সার্ভিসের মান উন্নয়ন ও ব্যবহারকারীর অভিজ্ঞতা বিশ্লেষণের জন্য",
      ]},
    ],
  },
  {
    title: "৪. তথ্য শেয়ারিং ও তৃতীয় পক্ষ",
    body: [
      { text: "আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। তবে নিম্নলিখিত ক্ষেত্রে তথ্য শেয়ার হতে পারে:" },
      { items: [
        "Google — Google Sign-In ব্যবহারের ক্ষেত্রে Google-এর অথেন্টিকেশন সার্ভিসের সাথে",
        "পেমেন্ট গেটওয়ে — বিকাশ, নগদ, রকেট, SSLCommerz বা অন্যান্য পেমেন্ট প্রসেসরের সাথে লেনদেন সম্পন্ন করতে",
        "শপ অ্যাডমিন — আপনি কোনো শপে অর্ডার করলে, অর্ডার সম্পন্ন করার জন্য প্রয়োজনীয় তথ্য সেই শপের অ্যাডমিনের সাথে শেয়ার করা হয়",
        "হোস্টিং ও ডোমেইন প্রোভাইডার — সার্ভিস প্রদানের প্রয়োজনে (যেমন Hostinger, Namecheap)",
        "আইনি প্রয়োজনে — আদালতের আদেশ বা আইনি বাধ্যবাধকতা পূরণের ক্ষেত্রে",
      ]},
    ],
  },
  {
    title: "৫. কুকিজ ব্যবহার",
    body: [
      { text: "আমাদের প্ল্যাটফর্ম ও প্রতিটি শপের স্টোরফ্রন্ট আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে, লগইন সেশন মনে রাখতে এবং ব্যবহারের পরিসংখ্যান বিশ্লেষণ করতে কুকিজ ব্যবহার করে। আপনি চাইলে ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন, তবে এতে কিছু ফিচার সঠিকভাবে কাজ নাও করতে পারে।" },
    ],
  },
  {
    title: "৬. তথ্যের নিরাপত্তা",
    body: [
      { text: "আমরা আপনার তথ্য সুরক্ষিত রাখতে এনক্রিপশন, সিকিউর সার্ভার ও আধুনিক নিরাপত্তা ব্যবস্থা ব্যবহার করি। তবে ইন্টারনেটে তথ্য প্রেরণের কোনো পদ্ধতিই ১০০% নিরাপদ নয়, তাই আমরা পরম নিরাপত্তার নিশ্চয়তা দিতে পারি না। আপনার অ্যাকাউন্ট পাসওয়ার্ড গোপন রাখার দায়িত্ব আপনার নিজের।" },
    ],
  },
  {
    title: "৭. তথ্য সংরক্ষণ",
    body: [
      { text: "আপনার তথ্য ততদিন সংরক্ষণ করা হয় যতদিন আপনার অ্যাকাউন্ট বা শপ সক্রিয় থাকে অথবা সার্ভিস প্রদান, আইনি বাধ্যবাধকতা পূরণ বা বিরোধ নিষ্পত্তির জন্য প্রয়োজন হয়। অ্যাকাউন্ট মুছে ফেলার অনুরোধ করলে আমরা যুক্তিসঙ্গত সময়ের মধ্যে আপনার তথ্য মুছে ফেলি, আইনি সংরক্ষণ বাধ্যবাধকতা ব্যতীত।" },
    ],
  },
  {
    title: "৮. আপনার অধিকার",
    body: [
      { items: [
        "আপনার সংরক্ষিত ব্যক্তিগত তথ্য দেখার অধিকার",
        "ভুল বা অসম্পূর্ণ তথ্য সংশোধনের অধিকার",
        "অ্যাকাউন্ট ও সংশ্লিষ্ট তথ্য মুছে ফেলার অনুরোধের অধিকার",
        "মার্কেটিং যোগাযোগ থেকে অপ্ট-আউট করার অধিকার",
        "Google Sign-In-এর মাধ্যমে দেওয়া অনুমতি প্রত্যাহার করার অধিকার (আপনার Google অ্যাকাউন্ট সেটিংস থেকে)",
      ]},
    ],
  },
  {
    title: "৯. শিশুদের গোপনীয়তা",
    body: [
      { text: "আমাদের সার্ভিস ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা জেনেশুনে ১৩ বছরের কম বয়সী কোনো শিশুর কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। এমন কোনো তথ্য সংগৃহীত হয়েছে বলে জানতে পারলে আমরা তা দ্রুত মুছে ফেলব।" },
    ],
  },
  {
    title: "১০. পলিসি পরিবর্তন",
    body: [
      { text: "আমরা সময়ে সময়ে এই প্রাইভেসি পলিসি আপডেট করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে আমরা প্ল্যাটফর্মে নোটিশ প্রদান করব বা ইমেইলের মাধ্যমে জানাবো। পরিবর্তনের পর প্ল্যাটফর্ম ব্যবহার চালিয়ে গেলে তা নতুন পলিসিতে সম্মতি হিসেবে গণ্য হবে।" },
    ],
  },
];

const TERMS_SECTIONS = [
  {
    title: "১. শর্তাবলী গ্রহণ",
    body: [
      { text: "ECMS-এর ওয়েবসাইট, অ্যাকাউন্ট (Google Sign-In সহ) বা যেকোনো সার্ভিস ব্যবহার করার মাধ্যমে আপনি এই ব্যবহারের শর্তাবলীতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তাহলে আমাদের প্ল্যাটফর্ম বা সার্ভিস ব্যবহার করা থেকে বিরত থাকুন।" },
    ],
  },
  {
    title: "২. সার্ভিসের বিবরণ",
    body: [
      { text: "ECMS হলো Hikmah IT-এর একটি মাল্টি-টেন্যান্ট ই-কমার্স প্ল্যাটফর্ম, যেখানে যেকোনো ব্যবসা নিজস্ব অনলাইন শপ তৈরি করে প্রোডাক্ট, অর্ডার, পেমেন্ট ও কাস্টমার একটি ড্যাশবোর্ড থেকে নিয়ন্ত্রণ করতে পারে। প্ল্যান, মূল্য ও ফিচার সময়ে সময়ে পরিবর্তিত হতে পারে এবং তা প্ল্যাটফর্মে উল্লেখ থাকবে।" },
    ],
  },
  {
    title: "৩. অ্যাকাউন্ট ও Google Sign-In",
    body: [
      { items: [
        "অ্যাকাউন্ট তৈরির সময় প্রদত্ত তথ্য অবশ্যই সত্য ও হালনাগাদ হতে হবে",
        "Google Sign-In ব্যবহার করলে আপনি নিশ্চিত করছেন যে আপনি সেই Google অ্যাকাউন্টের বৈধ মালিক",
        "আপনার অ্যাকাউন্ট পাসওয়ার্ড ও লগইন তথ্যের গোপনীয়তা রক্ষার দায়িত্ব সম্পূর্ণভাবে আপনার",
        "আপনার অ্যাকাউন্টের মাধ্যমে সংঘটিত যেকোনো কার্যক্রমের জন্য আপনি দায়ী থাকবেন",
        "অস্বাভাবিক বা অননুমোদিত ব্যবহারের সন্দেহ হলে অবিলম্বে আমাদের জানাতে হবে",
      ]},
    ],
  },
  {
    title: "৪. পেমেন্ট ও বিলিং",
    body: [
      { items: [
        "প্ল্যানের মূল্য অর্ডার/সাবস্ক্রিপশন নিশ্চিতকরণের সময় নির্ধারিত হারে প্রযোজ্য",
        "পেমেন্ট বিকাশ, নগদ, রকেট, SSLCommerz বা অন্যান্য অনুমোদিত মাধ্যমে গ্রহণ করা হয়",
        "কাস্টম ডোমেইন ও হোস্টিং প্রোভাইডারের (যেমন Hostinger, Namecheap) নিজস্ব বিলিং প্রযোজ্য হতে পারে, যা ECMS-এর সার্ভিস চার্জ থেকে আলাদা",
        "অসম্পূর্ণ বা বিলম্বিত পেমেন্টের ক্ষেত্রে শপ বা সার্ভিস সাময়িকভাবে স্থগিত রাখার অধিকার আমরা সংরক্ষণ করি",
      ]},
    ],
  },
  {
    title: "৫. রিফান্ড নীতি",
    body: [
      { text: "প্ল্যান সক্রিয় হওয়ার পর প্রদত্ত অগ্রিম মূল্য সাধারণত ফেরতযোগ্য নয়, কারণ তা রিসোর্স ও সময়ের বিপরীতে নেওয়া হয়। তবে আমাদের ব্যর্থতার কারণে সার্ভিস প্রদান সম্ভব না হলে, কেস-বাই-কেস ভিত্তিতে যৌক্তিক সমাধানের চেষ্টা করা হবে। নির্দিষ্ট রিফান্ড সংক্রান্ত বিষয়ে সরাসরি আমাদের সাথে যোগাযোগ করুন।" },
    ],
  },
  {
    title: "৬. ব্যবহারকারীর দায়িত্ব",
    body: [
      { items: [
        "প্ল্যাটফর্ম বা সার্ভিস কোনো বেআইনি, প্রতারণামূলক বা ক্ষতিকর উদ্দেশ্যে ব্যবহার করা যাবে না",
        "অন্য কোনো ব্যবহারকারী বা তৃতীয় পক্ষের অধিকার লঙ্ঘন করা যাবে না",
        "সিস্টেমে অননুমোদিতভাবে প্রবেশের চেষ্টা, ম্যালওয়্যার ছড়ানো বা সিকিউরিটি লঙ্ঘনের চেষ্টা কঠোরভাবে নিষিদ্ধ",
        "শপ অ্যাডমিন তার শপে যোগ করা প্রোডাক্ট, মূল্য, ছবি ও কন্টেন্টের স্বত্ব ও বৈধতার জন্য সম্পূর্ণভাবে দায়ী থাকবেন",
      ]},
    ],
  },
  {
    title: "৭. বুদ্ধিবৃত্তিক সম্পত্তি",
    body: [
      { text: "ECMS প্ল্যাটফর্ম, এর সোর্স কোড, টেমপ্লেট, থিম, টুলস ও ব্র্যান্ডিংয়ের মালিকানা সম্পূর্ণভাবে Hikmah IT-এর কাছে থাকে। আপনার শপে যোগ করা প্রোডাক্ট তথ্য, ছবি, ব্র্যান্ড নাম ও কাস্টমার ডেটার মালিকানা আপনার (শপ অ্যাডমিনের) কাছেই থাকে। আমরা সম্পন্ন হওয়া শপ পোর্টফোলিও ও প্রদর্শনের উদ্দেশ্যে ব্যবহার করার অধিকার সংরক্ষণ করি।" },
    ],
  },
  {
    title: "৮. তৃতীয় পক্ষের সার্ভিস",
    body: [
      { text: "আমাদের প্ল্যাটফর্ম ও সার্ভিসে Google Sign-In, পেমেন্ট গেটওয়ে ও হোস্টিং প্রোভাইডারের মতো তৃতীয় পক্ষের সার্ভিস ব্যবহৃত হতে পারে। এসব সার্ভিসের নিজস্ব শর্তাবলী ও প্রাইভেসি পলিসি প্রযোজ্য, এবং তাদের কার্যক্রমের জন্য Hikmah IT দায়ী থাকবে না।" },
    ],
  },
  {
    title: "৯. দায়বদ্ধতার সীমাবদ্ধতা",
    body: [
      { text: "আমরা সর্বোচ্চ মান বজায় রাখার চেষ্টা করি, তবে সার্ভিস \"যেমন আছে\" ভিত্তিতে প্রদান করা হয়। প্রযুক্তিগত ত্রুটি, তৃতীয় পক্ষের সার্ভিস বিভ্রাট বা ব্যবহারকারীর ভুল ব্যবহারের কারণে সৃষ্ট পরোক্ষ ক্ষতির জন্য আইন দ্বারা অনুমোদিত সর্বোচ্চ সীমা পর্যন্ত Hikmah IT দায়ী থাকবে না।" },
    ],
  },
  {
    title: "১০. সার্ভিস স্থগিতকরণ ও বাতিল",
    body: [
      { text: "শর্তাবলী লঙ্ঘন, প্রতারণামূলক কার্যক্রম বা অপব্যবহারের ক্ষেত্রে আমরা পূর্ব নোটিশ ছাড়াই কোনো অ্যাকাউন্ট বা শপ স্থগিত বা বাতিল করার অধিকার সংরক্ষণ করি। ব্যবহারকারীও যেকোনো সময় লিখিতভাবে জানিয়ে তাদের অ্যাকাউন্ট বন্ধের অনুরোধ করতে পারেন।" },
    ],
  },
  {
    title: "১১. শর্তাবলীর পরিবর্তন",
    body: [
      { text: "আমরা প্রয়োজন অনুযায়ী এই শর্তাবলী হালনাগাদ করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে প্ল্যাটফর্মে নোটিশ দেওয়া হবে। পরিবর্তনের পর সার্ভিস ব্যবহার চালিয়ে গেলে তা নতুন শর্তাবলীতে সম্মতি হিসেবে গণ্য হবে।" },
    ],
  },
  {
    title: "১২. প্রযোজ্য আইন",
    body: [
      { text: "এই শর্তাবলী বাংলাদেশের প্রচলিত আইন অনুযায়ী পরিচালিত ও ব্যাখ্যা করা হবে। এই শর্তাবলী সংক্রান্ত যেকোনো বিরোধ বাংলাদেশের প্রাসঙ্গিক আদালতের এখতিয়ারাধীন হবে।" },
    ],
  },
];

function SectionBlock({ index, title, body }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
    >
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-[11px] font-black text-white shadow-md shadow-orange-200">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-gray-500">
            {body.map((block, i) => (
              <div key={i}>
                {block.label && <p className="mb-1.5 font-semibold text-gray-700">{block.label}</p>}
                {block.text && <p>{block.text}</p>}
                {block.items && (
                  <ul className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PlatformLegalPage({ type, adminUrl }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const Icon = isPrivacy ? ShieldCheck : Scale;
  const eyebrow = "আইনি তথ্য";
  const title = isPrivacy ? "প্রাইভেসি পলিসি" : "ব্যবহারের শর্তাবলী";
  const intro = isPrivacy
    ? "ECMS প্ল্যাটফর্ম ও প্রতিটি শপ ব্যবহারের সময় আপনার তথ্য আমরা কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখি — তার বিস্তারিত বিবরণ।"
    : "ECMS প্ল্যাটফর্ম, অ্যাকাউন্ট ও সার্ভিস ব্যবহারের শর্তাবলী — অ্যাকাউন্ট, পেমেন্ট, রিফান্ড ও দায়বদ্ধতা সংক্রান্ত বিস্তারিত।";

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-gradient-to-br from-teal-50 via-amber-50 to-orange-100 text-gray-900"
      style={{ fontFamily: '"Hind Siliguri", ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* Ambient background — matches the platform landing page */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-teal-300/50 blur-[100px]" />
        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-orange-300/50 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-rose-300/45 blur-[100px]" />
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
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative mx-auto max-w-3xl px-5 pb-6 pt-14 text-center sm:pt-16"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-orange-200">
          <Icon size={24} className="text-white" />
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-600">
          {eyebrow}
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-[2.2rem]">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">{intro}</p>
        <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-gray-500">
          সর্বশেষ হালনাগাদ: {LAST_UPDATED}
        </p>
      </motion.section>

      {/* Sections */}
      <section className="relative mx-auto max-w-3xl px-5 pb-10 pt-6 sm:pb-14">
        <div className="space-y-4">
          {sections.map((section, i) => (
            <SectionBlock key={section.title} index={i + 1} title={section.title} body={section.body} />
          ))}

          <motion.div
            custom={sections.length + 1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
          >
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-[11px] font-black text-white shadow-md shadow-orange-200">
                {sections.length + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">যোগাযোগ করুন</h2>
                <div className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-gray-500">
                  <p>
                    {isPrivacy
                      ? "আপনার তথ্য বা এই প্রাইভেসি পলিসি সম্পর্কে কোনো প্রশ্ন থাকলে যোগাযোগ করুন:"
                      : "এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে যোগাযোগ করুন:"}
                  </p>
                  <p>
                    ইমেইল:{" "}
                    <a href={`mailto:${CONTACT.email}`} className="font-semibold text-orange-600 hover:underline">
                      {CONTACT.email}
                    </a>
                  </p>
                  <p>
                    ফোন: <span className="font-semibold text-gray-800">{CONTACT.phone}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PlatformFooter />
    </div>
  );
}
