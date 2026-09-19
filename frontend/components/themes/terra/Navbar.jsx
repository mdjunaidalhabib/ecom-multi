"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaSearch, FaHome, FaThLarge } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../../../context/CartContext";
import SearchBox from "../../navbar/SearchBox";
import AccountMenuDesktop from "../../navbar/AccountMenuDesktop";
import AccountMenuMobile from "../../navbar/AccountMenuMobile";
import CartIcon from "../../navbar/CartIcon";
import WishlistIcon from "../../navbar/WishlistIcon";
import useShopPath, { shopHref } from "../../../hooks/useShopPath";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
];

// Terra Prestige: refined editorial navbar — full-width ivory bar with a
// hairline gold rule, monogram brand mark + serif wordmark, understated
// uppercase links with a gold active underline. Reuses the same functional
// widgets as the other themes.
export default function TerraNavbar() {
  const [navbar, setNavbar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { base, subPath } = useShopPath();
  const { cart = {}, wishlist = [] } = useCart() || {};
  const cartCount = Object.keys(cart).length;
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/navbar");
        const data = await res.json();
        const brand = data?.brand || {};
        if (!("name" in brand)) brand.name = "";
        if (!("logo" in brand)) brand.logo = "";
        if (!cancelled) setNavbar({ ...data, brand });
      } catch (err) {
        console.error("❌ Failed to load navbar:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (path) => subPath === path;
  const brandName = navbar?.brand?.name?.trim() || "";

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[var(--theme-accent)]/30 bg-[var(--theme-bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[var(--theme-text)] md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>

          <Link href={base || "/"} className="flex min-w-0 items-center gap-3">
            {navbar?.brand?.logo && !imgError ? (
              <img
                src={navbar.brand.logo}
                alt={brandName || "Brand"}
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-[var(--theme-accent)]/40"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--theme-secondary)] text-base font-semibold text-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]/50">
                {(brandName.charAt(0) || "T").toUpperCase()}
              </div>
            )}
            <span className="truncate text-lg font-semibold uppercase tracking-[0.14em] text-[var(--theme-text)]">
              {brandName}
            </span>
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={shopHref(base, href)}
                className={`relative py-1 text-[13px] font-medium uppercase tracking-[0.16em] transition-colors ${
                  isActive(href)
                    ? "text-[var(--theme-primary)]"
                    : "text-[var(--theme-text)]/70 hover:text-[var(--theme-primary)]"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-[var(--theme-accent)] transition-all duration-300 ${
                    isActive(href) ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[var(--theme-text)]">
            <button
              className="p-2 transition-colors hover:text-[var(--theme-primary)] md:hidden"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search"
            >
              <FaSearch className="h-4 w-4" />
            </button>
            <div className="hidden md:block">
              <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} />
            </div>
            <div className="hidden md:block">
              <AccountMenuDesktop />
            </div>
            <div className="md:hidden">
              <AccountMenuMobile topbar />
            </div>
            <div className="p-2">
              <WishlistIcon wishlistCount={wishlistCount} />
            </div>
            <div className="p-2">
              <CartIcon cartCount={cartCount} />
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden">
        <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[var(--theme-secondary)]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-0 left-0 top-0 z-50 w-72 border-r border-[var(--theme-accent)]/30 bg-[var(--theme-bg)] px-6 py-8"
            >
              <p className="mb-6 truncate text-sm font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
                {brandName || "Menu"}
              </p>
              <div className="divide-y divide-[var(--theme-text)]/10">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={shopHref(base, href)}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3.5 text-sm font-medium uppercase tracking-[0.16em] ${
                      isActive(href)
                        ? "text-[var(--theme-primary)]"
                        : "text-[var(--theme-text)]/75"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom bar — full-width, hairline top rule */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--theme-accent)]/30 bg-[var(--theme-bg)]/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-4 py-2.5 text-[var(--theme-text)]/60">
          <Link
            href={base || "/"}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium uppercase tracking-wider ${isActive("/") ? "text-[var(--theme-primary)]" : ""}`}
          >
            <FaHome className="h-4 w-4" />
            Home
          </Link>
          <Link
            href={shopHref(base, "/categories")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium uppercase tracking-wider ${isActive("/categories") ? "text-[var(--theme-primary)]" : ""}`}
          >
            <FaThLarge className="h-4 w-4" />
            Categories
          </Link>
          <div className={`text-[10px] ${isActive("/wishlist") ? "text-[var(--theme-primary)]" : ""}`}>
            <WishlistIcon wishlistCount={wishlistCount} mobile />
          </div>
          <div className={`text-[10px] ${isActive("/cart") ? "text-[var(--theme-primary)]" : ""}`}>
            <CartIcon cartCount={cartCount} mobile />
          </div>
        </div>
      </div>
    </>
  );
}
