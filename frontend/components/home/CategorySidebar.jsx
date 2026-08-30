"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import cloudinaryLoader from "../../lib/cloudinaryLoader";
import useShopPath from "../../hooks/useShopPath";

// ✅ Desktop-only "All Categories" list beside the homepage slider (hidden
// below lg — mobile still uses HomeAllProduct's own horizontal category
// nav, unchanged). Clicking a category goes to the same /categories/[id]
// page the "See All" links elsewhere on the home page already use.
export default function CategorySidebar({ categories = [] }) {
  const { base } = useShopPath();

  if (!categories.length) return null;

  return (
    <aside className="hidden lg:flex lg:flex-col h-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-pink-600 text-white font-semibold text-sm shrink-0">
        <LayoutGrid className="w-4 h-4" />
        All Categories
      </div>

      {/* ✅ min-h-0 জরুরি — flex item ডিফল্টভাবে min-height:auto নিয়ে নিজের
          content-এর সমান জায়গা claim করে, ফলে flex-1 + overflow-y-auto
          থাকা সত্ত্বেও আসলে কখনো শ্রিঙ্ক/স্ক্রল হতো না */}
      <nav className="flex-1 min-h-0 overflow-y-auto thin-scrollbar divide-y divide-gray-100">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`${base}/categories/${cat._id}`}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors group"
          >
            <div className="relative w-6 h-6 shrink-0 overflow-hidden rounded">
              <Image
                loader={cloudinaryLoader}
                src={cat.image || "/no-image.png"}
                alt={cat.name}
                fill
                sizes="24px"
                className="object-cover"
                draggable={false}
              />
            </div>
            <span className="flex-1 truncate font-medium">{cat.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-pink-500 shrink-0" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
