"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaSearch, FaUserCircle, FaHome, FaThLarge } from "react-icons/fa";
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

// Aurora: clean, minimal top bar — white surface, thin bottom border,
// uppercase tracking-wide links, single amber accent. Reuses the same
// functional widgets (search/account/cart/wishlist) as the classic navbar.
export default function AuroraNavbar() {
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
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-neutral-700 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>

          <Link href={base || "/"} className="flex items-center gap-2.5">
            {navbar?.brand?.logo && !imgError ? (
              <img
                src={navbar.brand.logo}
                alt={navbar?.brand?.name || "Brand"}
                className="h-8 w-8 rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                <FaUserCircle className="h-4 w-4 text-neutral-300" />
              </div>
            )}
            <span className="truncate text-lg font-semibold tracking-tight text-neutral-900">
              {navbar?.brand?.name?.trim() || ""}
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={shopHref(base, href)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                  isActive(href)
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:text-amber-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 text-neutral-700">
            <button
              className="p-2 hover:text-amber-600 md:hidden"
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
              className="fixed bottom-0 left-0 top-0 z-50 w-64 space-y-1 bg-white p-4"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={shopHref(base, href)}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(href)
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom bar — same functional icons as classic, minimal styling */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white md:hidden">
        <div className="flex items-center justify-around px-4 py-2 text-neutral-600">
          <Link
            href={base || "/"}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${isActive("/") ? "text-amber-600" : ""}`}
          >
            <FaHome className="h-4 w-4" />
            Home
          </Link>
          <Link
            href={shopHref(base, "/categories")}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${isActive("/categories") ? "text-amber-600" : ""}`}
          >
            <FaThLarge className="h-4 w-4" />
            Categories
          </Link>
          <div className={`text-[11px] ${isActive("/wishlist") ? "text-amber-600" : ""}`}>
            <WishlistIcon wishlistCount={wishlistCount} mobile />
          </div>
          <div className={`text-[11px] ${isActive("/cart") ? "text-amber-600" : ""}`}>
            <CartIcon cartCount={cartCount} mobile />
          </div>
        </div>
      </div>
    </>
  );
}
