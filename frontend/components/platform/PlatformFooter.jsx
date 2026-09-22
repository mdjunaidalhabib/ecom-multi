import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

// Shared across PlatformLanding and PlatformLegalPage — see PlatformHeader.jsx
// for why this is a standalone component instead of being duplicated per page.
export default function PlatformFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gradient-to-b from-teal-50/50 to-orange-50/40">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-md shadow-orange-200">
                <ShoppingCart size={16} className="text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-gray-900">ECMS</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
              সহজ ও শক্তিশালী ই-কমার্স প্ল্যাটফর্ম — প্রোডাক্ট, অর্ডার, পেমেন্ট ও
              কাস্টমার ম্যানেজমেন্ট একটি ড্যাশবোর্ড থেকে।
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">প্ল্যাটফর্ম</p>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li><Link href="/#features" className="transition-colors hover:text-gray-900">সার্ভিস</Link></li>
              <li><Link href="/#why-us" className="transition-colors hover:text-gray-900">কেন ECMS</Link></li>
              <li><Link href="/#plans" className="transition-colors hover:text-gray-900">প্ল্যান</Link></li>
              <li><Link href="/#how-it-works" className="transition-colors hover:text-gray-900">কিভাবে কাজ করে</Link></li>
              <li><Link href="/#faq" className="transition-colors hover:text-gray-900">সাধারণ জিজ্ঞাসা</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">যোগাযোগ</p>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li><Link href="/#contact" className="transition-colors hover:text-gray-900">যোগাযোগ করুন</Link></li>
              <li>
                <a href="mailto:hikmahitcenter@gmail.com" className="transition-colors hover:text-gray-900">
                  hikmahitcenter@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://hikmahit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-gray-900"
                >
                  Hikmah IT
                  <ArrowRight size={12} className="-rotate-45" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">আইনি তথ্য</p>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li><Link href="/privacy-policy" className="transition-colors hover:text-gray-900">প্রাইভেসি পলিসি</Link></li>
              <li><Link href="/terms-of-service" className="transition-colors hover:text-gray-900">ব্যবহারের শর্তাবলী</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-gray-200 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <a
            href="https://hikmahit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-400 transition-colors hover:text-gray-600"
          >
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              ECMS
            </span>{" "}
            — Powered by{" "}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              Hikmah IT
            </span>
          </a>
          <a
            href="https://hikmahit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            &copy; ২০২৬{" "}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text font-semibold text-transparent">
              Hikmah IT
            </span>
            . সর্বস্বত্ব সংরক্ষিত।
          </a>
        </div>
      </div>
    </footer>
  );
}
