import Link from "next/link";
import { LayoutDashboard, ShoppingCart } from "lucide-react";
import AdminCTA from "./AdminCTA";

// Shared across PlatformLanding and PlatformLegalPage so the platform's
// marketing pages (landing, privacy policy, terms of service) all render the
// exact same header instead of each page rolling its own stripped-down copy.
export default function PlatformHeader({ adminUrl }) {
  return (
    <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-gradient-to-r from-teal-50/90 via-white/90 to-orange-50/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-md shadow-orange-200">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight text-gray-900">ECMS</p>
            <p className="text-[11px] font-medium text-gray-400">E-Commerce Management System</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-500 md:flex">
          <Link href="/#features" className="transition-colors hover:text-gray-900">সার্ভিস</Link>
          <Link href="/#plans" className="transition-colors hover:text-gray-900">প্ল্যান</Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-gray-900">প্রক্রিয়া</Link>
        </nav>

        <AdminCTA
          adminUrl={adminUrl}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-200 transition-transform hover:scale-105 sm:text-sm"
        >
          <LayoutDashboard size={14} />
          অ্যাডমিন প্যানেলে যান
        </AdminCTA>
      </div>
    </header>
  );
}
