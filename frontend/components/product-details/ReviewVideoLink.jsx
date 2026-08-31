"use client";

import React from "react";
import { FaPlay } from "react-icons/fa";

// ✅ প্রতিটা প্রোডাক্টের নিজস্ব রিভিউ ভিডিও লিংক (YouTube/Facebook/TikTok
// ইত্যাদি অন্য প্লাটফর্মে থাকা রিভিউ ভিডিও)। admin panel এ product form থেকে
// link ও বাটন টেক্সট সেট করা যায়। link খালি থাকলে কিছুই render হয় না —
// FacebookGroupLink.jsx এর মতোই আচরণ।
const ReviewVideoLink = ({ product }) => {
  const link = product?.reviewVideo?.link;
  if (!link) return null;

  const text = product?.reviewVideo?.text || "রিভিউ ভিডিও দেখুন";

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {/* Icon */}
      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-rose-600 hover:bg-rose-700 transition flex items-center justify-center">
        <FaPlay className="text-white text-[10px] ml-[1px]" />
      </div>

      {/* Text */}
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="text-xs md:text-sm text-gray-900 hover:underline font-medium"
      >
        {text}
      </a>
    </div>
  );
};

export default ReviewVideoLink;
