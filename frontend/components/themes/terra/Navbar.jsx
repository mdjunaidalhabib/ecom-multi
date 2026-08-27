"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaSearch, FaLeaf, FaHome, FaThLarge } from "react-icons/fa";
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

// Terra: warm/organic floating navbar — a rounded pill bar with margin and
// shadow (not edge-to-edge), gradient cream-to-mint surface, single-row
// logo + segmented pill nav + icon cluster. Reuses the same functional
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

  return (
    <>
      <nav className="sticky top-3 z-50 px-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-[2rem] bg-gradient-to-r from-[var(--theme-bg)] via-[var(--theme-bg)] to-[var(--theme-primary)]/10 px-4 py-2.5 shadow-md shadow-[var(--theme-text)]/10 ring-1 ring-[var(--theme-text)]/5 sm:px-5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[var(--theme-text)] md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>

          <Link href={base || "/"} className="flex items-center gap-2.5">
            {navbar?.brand?.logo && !imgError ? (
              <img
                src={navbar.brand.logo}
                alt={navbar?.brand?.name || "Brand"}
                className="h-9 w-9 rounded-2xl object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--theme-primary)]">
                <FaLeaf className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="truncate text-lg font-bold text-[var(--theme-text)]">
              {navbar?.brand?.name?.trim() || ""}
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full bg-[var(--theme-surface)]/80 p-1 shadow-inner md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={shopHref(base, href)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive(href)
                    ? "bg-[var(--theme-primary)] text-white shadow-sm"
                    : "text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[var(--theme-surface)]/60 px-1 text-[var(--theme-text)]">
            <button
              className="p-2 hover:text-[var(--theme-primary)] md:hidden"
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
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-0 left-0 top-0 z-50 w-64 space-y-1 bg-[var(--theme-bg)] p-4"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={shopHref(base, href)}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-full px-4 py-2.5 text-sm font-medium ${
                    isActive(href)
                      ? "bg-[var(--theme-primary)] text-white"
                      : "text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating rounded bottom bar — matches the top pill bar's language */}
      <div className="fixed inset-x-3 bottom-3 z-50 rounded-[1.75rem] bg-gradient-to-r from-[var(--theme-bg)] via-[var(--theme-bg)] to-[var(--theme-primary)]/10 shadow-md shadow-[var(--theme-text)]/10 ring-1 ring-[var(--theme-text)]/5 md:hidden">
        <div className="flex items-center justify-around px-4 py-2.5 text-[var(--theme-text)]/70">
          <Link
            href={base || "/"}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${isActive("/") ? "text-[var(--theme-primary)]" : ""}`}
          >
            <FaHome className="h-4 w-4" />
            Home
          </Link>
          <Link
            href={shopHref(base, "/categories")}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${isActive("/categories") ? "text-[var(--theme-primary)]" : ""}`}
          >
            <FaThLarge className="h-4 w-4" />
            Categories
          </Link>
          <div className={`text-[11px] ${isActive("/wishlist") ? "text-[var(--theme-primary)]" : ""}`}>
            <WishlistIcon wishlistCount={wishlistCount} mobile />
          </div>
          <div className={`text-[11px] ${isActive("/cart") ? "text-[var(--theme-primary)]" : ""}`}>
            <CartIcon cartCount={cartCount} mobile />
          </div>
        </div>
      </div>
    </>
  );
}
