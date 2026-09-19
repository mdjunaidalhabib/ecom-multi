import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

// Shared across PlatformLanding and PlatformLegalPage — see PlatformHeader.jsx
// for why this is a standalone component instead of being duplicated per page.
export default function PlatformFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                <ShoppingCart size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">ECMS</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              সহজ ও শক্তিশালী ই-কমার্স প্ল্যাটফর্ম — প্রোডাক্ট, অর্ডার, পেমেন্ট ও
              কাস্টমার ম্যানেজমেন্ট একটি ড্যাশবোর্ড থেকে।
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">প্ল্যাটফর্ম</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li><Link href="/#features" className="transition-colors hover:text-white">সার্ভিস</Link></li>
              <li><Link href="/#why-us" className="transition-colors hover:text-white">কেন ECMS</Link></li>
              <li><Link href="/#plans" className="transition-colors hover:text-white">প্ল্যান</Link></li>
              <li><Link href="/#how-it-works" className="transition-colors hover:text-white">কিভাবে কাজ করে</Link></li>
              <li><Link href="/#faq" className="transition-colors hover:text-white">সাধারণ জিজ্ঞাসা</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">যোগাযোগ</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li><Link href="/#contact" className="transition-colors hover:text-white">যোগাযোগ করুন</Link></li>
              <li>
                <a href="mailto:hikmahitcenter@gmail.com" className="transition-colors hover:text-white">
                  hikmahitcenter@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://hikmahit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-white"
                >
                  Hikmah IT
                  <ArrowRight size={12} className="-rotate-45" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">আইনি তথ্য</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li><Link href="/privacy-policy" className="transition-colors hover:text-white">প্রাইভেসি পলিসি</Link></li>
              <li><Link href="/terms-of-service" className="transition-colors hover:text-white">ব্যবহারের শর্তাবলী</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-slate-800 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <a
            href="https://hikmahit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
          >
            <span className="text-slate-300">ECMS</span>{" "}
            — Powered by{" "}
            <span className="text-slate-300">Hikmah IT</span>
          </a>
          <a
            href="https://hikmahit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            &copy; ২০২৬{" "}
            <span className="font-semibold text-slate-300">Hikmah IT</span>
            . সর্বস্বত্ব সংরক্ষিত।
          </a>
        </div>
      </div>
    </footer>
  );
}
