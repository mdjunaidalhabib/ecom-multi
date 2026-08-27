"use client";

import { usePathname } from "next/navigation";

// shop/[shopSlug]/layout.js normally wraps every route in the shop's theme
// Navbar/Footer/FloatingActionButton. Landing pages (shop/[shopSlug]/lp/**)
// need to be distraction-free — no nav to browse away, no cart icon — so
// this client wrapper reads the current path and skips that chrome for /lp/
// routes instead. A nested layout.js under lp/ can't remove a parent
// layout's chrome (Next.js layouts only nest, never override), so this is
// the smallest change that gets a genuinely different shell without
// restructuring the whole shop/[shopSlug]/ route tree into groups.
export default function StorefrontChrome({
  navbar,
  footer,
  floatingActionButton,
  mainClassName,
  themeVars,
  children,
}) {
  const pathname = usePathname();
  const isLandingPage = /\/lp(\/|$)/.test(pathname || "");

  if (isLandingPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div
      className="flex min-h-screen flex-1 flex-col"
      style={{ ...themeVars, fontFamily: "var(--theme-font-body)" }}
    >
      {navbar}
      <main className={`flex-grow ${mainClassName}`}>
        <div className="mx-auto w-full">{children}</div>
      </main>
      {footer}
      {floatingActionButton}
    </div>
  );
}
