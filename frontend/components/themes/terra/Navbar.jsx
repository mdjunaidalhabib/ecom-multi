"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import { FaBars, FaTimes, FaSearch, FaHome, FaThLarge, FaUser } from "react-icons/fa";
import { Heart, ShoppingCart, LogIn, UserPlus, LogOut, ClipboardList, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../../../context/CartContext";
import { useUser } from "../../../context/UserContext";
import SearchBox from "../../navbar/SearchBox";
import AccountMenuDesktop from "../../navbar/AccountMenuDesktop";
import CartIcon from "../../navbar/CartIcon";
import WishlistIcon from "../../navbar/WishlistIcon";
import useShopPath, { shopHref } from "../../../hooks/useShopPath";

// Phrases the search box types out and erases in a loop (module-level so the
// array identity stays stable across renders).
const SEARCH_HINTS = ["Search products...", "Find your favorites...", "What are you looking for?"];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Product" },
  { href: "/categories", label: "Categories" },
];

// Terra Prestige: refined editorial navbar — full-width ivory bar with a
// hairline gold rule, monogram brand mark + serif wordmark, understated
// uppercase links with a gold active underline. Reuses the same functional
// widgets as the other themes.
export default function TerraNavbar() {
  const [navbar, setNavbar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { base, subPath } = useShopPath();
  const { me, setMe, loadingUser } = useUser();
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || accountOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, accountOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [subPath]);

  // Login / Sign up open the shop's own auth pages (email+password or Google).
  // Only the path (not origin) is sent as `redirect` so the token isn't lost on
  // cross-domain redirects.
  const goAuth = (page) => {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `${base}/${page}?redirect=${encodeURIComponent(currentPath)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMe(null);
    window.location.replace(base || "/");
  };

  const isActive = (path) => subPath === path;
  const brandName = navbar?.brand?.name?.trim() || "";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary-dark)]/25">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="-ml-1 p-1 text-white md:hidden"
            aria-label="Open menu"
          >
            <FaBars className="h-5 w-5" />
          </button>

          <Link href={base || "/"} className="flex min-w-0 flex-1 items-center gap-2 md:flex-none md:gap-3">
            {navbar?.brand?.logo && !imgError ? (
              <img
                src={navbar.brand.logo}
                alt={brandName || "Brand"}
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-white/60 md:h-10 md:w-10"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold md:h-10 md:w-10 md:text-base text-[var(--theme-primary)] ring-2 ring-white/60">
                {(brandName.charAt(0) || "T").toUpperCase()}
              </div>
            )}
            <span className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-white md:text-lg md:tracking-[0.14em]">
              {brandName}
            </span>
          </Link>

          {/* Desktop search — sits before the menu links, themed to match */}
          <div className="hidden min-w-0 md:block [&_input]:w-52 [&_input]:rounded-full [&_input]:border-white [&_input]:bg-white [&_input]:px-4 [&_input]:py-1.5 [&_input]:text-sm [&_input]:font-medium [&_input]:text-[var(--theme-primary-dark)] [&_input]:placeholder:font-normal [&_input]:placeholder:text-[var(--theme-primary)]/60 [&_input:focus]:border-white [&_input:focus]:ring-2 [&_input:focus]:ring-white/40 lg:[&_input]:w-60 [&_button.rounded-xl]:bg-[var(--theme-primary)]/5 [&_button.rounded-xl:hover]:bg-[var(--theme-primary)]/15">
            <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} placeholders={SEARCH_HINTS} />
          </div>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={shopHref(base, href)}
                className={`relative py-1 text-[13px] font-medium uppercase tracking-[0.16em] transition-colors ${
                  isActive(href)
                    ? "text-white"
                    : "text-white/75 hover:text-white"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 rounded bg-white transition-all duration-300 ${
                    isActive(href) ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 text-white">
            <button
              className="p-2 text-white transition-colors hover:text-white/80 md:hidden"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search"
            >
              <FaSearch className="h-4 w-4" />
            </button>
            <div className="mr-1 hidden md:block [&>button]:rounded-full [&>button]:border [&>button]:border-white/70 [&>button]:bg-white/10 [&>button]:px-4 [&>button]:py-1.5 [&>button]:text-[12px] [&>button]:font-bold [&>button]:uppercase [&>button]:tracking-wider [&>button]:text-white [&>button:hover]:bg-white [&>button:hover]:text-[var(--theme-primary)] [&>div>button:first-child]:rounded-full [&>div>button:first-child]:border [&>div>button:first-child]:border-white/70 [&>div>button:first-child]:bg-white/10 [&>div>button:first-child]:py-1 [&>div>button:first-child]:pl-1 [&>div>button:first-child]:pr-4 [&>div>button:first-child]:text-[12px] [&>div>button:first-child]:font-bold [&>div>button:first-child]:uppercase [&>div>button:first-child]:tracking-wider [&>div>button:first-child]:text-white [&>div>button:first-child:hover]:bg-white [&>div>button:first-child:hover]:text-[var(--theme-primary)] [&_a:hover]:bg-[var(--theme-primary)]/10 [&_a:hover]:text-[var(--theme-primary)]">
              <AccountMenuDesktop />
            </div>
            <div className="hidden p-2 md:block [&_span.bg-red-500]:bg-white [&_span.bg-red-500]:font-bold [&_span.bg-red-500]:text-[var(--theme-primary)]">
              <WishlistIcon wishlistCount={wishlistCount} outline />
            </div>
            <div className="hidden p-2 md:block [&_span.bg-red-500]:bg-white [&_span.bg-red-500]:font-bold [&_span.bg-red-500]:text-[var(--theme-primary)]">
              <CartIcon cartCount={cartCount} outline />
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden [&_button.rounded-xl]:bg-[var(--theme-primary)]/5 [&_button.rounded-xl:hover]:bg-[var(--theme-primary)]/15">
        <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} placeholders={SEARCH_HINTS} />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-[70] flex w-72 max-w-[85vw] flex-col bg-white md:hidden"
            >
              <div className="flex items-center justify-between bg-[var(--theme-primary)] px-5 py-4 text-white">
                <span className="truncate text-sm font-semibold uppercase tracking-[0.16em]">
                  {brandName || "Menu"}
                </span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-3">
                {[
                  { href: "/", label: "Home", icon: <FaHome className="h-4 w-4" /> },
                  { href: "/products", label: "All Product", icon: <FaThLarge className="h-4 w-4" /> },
                  { href: "/categories", label: "Categories", icon: <FaThLarge className="h-4 w-4" /> },
                  { href: "/wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" />, count: wishlistCount },
                  { href: "/cart", label: "Cart", icon: <ShoppingCart className="h-4 w-4" />, count: cartCount },
                ].map(({ href, label, icon, count }) => (
                  <Link
                    key={href}
                    href={shopHref(base, href)}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive(href)
                        ? "bg-[var(--theme-primary)] text-white"
                        : "text-[var(--theme-text)]/80 hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-primary)]"
                    }`}
                  >
                    {icon}
                    <span className="flex-1">{label}</span>
                    {count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isActive(href)
                            ? "bg-white text-[var(--theme-primary)]"
                            : "bg-[var(--theme-primary)] text-white"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Auth actions */}
              {!loadingUser && (
                <div className="border-t border-[var(--theme-text)]/10 bg-[var(--theme-primary)]/[0.04] p-4">
                  {me ? (
                    <>
                      <p className="mb-3 truncate text-sm text-[var(--theme-text)]/70">
                        Signed in as <span className="font-semibold text-[var(--theme-text)]">{me.name}</span>
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--theme-primary)] py-2.5 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98]"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mb-3 text-center text-xs text-[var(--theme-text)]/60">
                        Sign in to track orders and save your wishlist
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => goAuth("login")}
                          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--theme-primary)]/30 transition active:scale-[0.98] hover:bg-[var(--theme-primary-dark)]"
                        >
                          <LogIn className="h-4 w-4" />
                          Login
                        </button>
                        <button
                          onClick={() => goAuth("signup")}
                          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--theme-primary)] bg-white py-2.5 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98] hover:bg-[var(--theme-primary)]/10"
                        >
                          <UserPlus className="h-4 w-4" />
                          Sign up
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-[var(--theme-primary)] shadow-[0_-4px_16px_rgba(0,0,0,0.15)] md:hidden">
        <div className="grid grid-cols-5 items-start text-white/75 leading-4">
          {[
            { key: "home", path: "/", node: (
              <Link href={base || "/"} className="flex flex-col items-center gap-0.5 text-[10.5px] font-medium">
                <FaHome className="h-5 w-5" />
                Home
              </Link>
            ) },
            { key: "categories", path: "/categories", node: (
              <Link href={shopHref(base, "/categories")} className="flex flex-col items-center gap-0.5 text-[10.5px] font-medium">
                <FaThLarge className="h-5 w-5" />
                Categories
              </Link>
            ) },
            { key: "wishlist", path: "/wishlist", node: (
              <div className="text-[10.5px] font-medium [&_svg]:h-5 [&_svg]:w-5 [&_a]:gap-0.5 [&_span.bg-red-500]:bg-white [&_span.bg-red-500]:font-bold [&_span.bg-red-500]:text-[var(--theme-primary)]">
                <WishlistIcon wishlistCount={wishlistCount} mobile outline filled={isActive("/wishlist")} />
              </div>
            ) },
            { key: "cart", path: "/cart", node: (
              <div className="text-[10.5px] font-medium [&_svg]:h-5 [&_svg]:w-5 [&_a]:gap-0.5 [&_span.bg-red-500]:bg-white [&_span.bg-red-500]:font-bold [&_span.bg-red-500]:text-[var(--theme-primary)]">
                <CartIcon cartCount={cartCount} mobile outline filled={isActive("/cart")} />
              </div>
            ) },
            { key: "account", path: "/profile", also: "/orders", node: (
              <button
                onClick={() => setAccountOpen(true)}
                className="flex flex-col items-center gap-0.5 text-[10.5px] font-medium"
              >
                {me?.avatar ? (
                  <Image
                    loader={cloudinaryLoader}
                    src={me.avatar}
                    referrerPolicy="no-referrer"
                    alt={me.name || "Account"}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-white/70"
                  />
                ) : (
                  <FaUser className="h-5 w-5" />
                )}
                Account
              </button>
            ) },
          ].map(({ key, path, also, node }) => (
            <div
              key={key}
              className={`relative flex min-w-0 justify-center px-0.5 pb-2 pt-2.5 transition-colors ${isActive(path) || (also && isActive(also)) ? "font-bold text-white" : ""}`}
            >
              <span
                className={`absolute inset-x-6 top-0 h-[3px] rounded-b bg-white transition-opacity ${
                  isActive(path) || (also && isActive(also)) ? "opacity-100" : "opacity-0"
                }`}
              />
              {node}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile account sheet */}
      <AnimatePresence>
        {accountOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black md:hidden"
              onClick={() => setAccountOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 z-[90] overflow-hidden rounded-t-3xl bg-white shadow-2xl md:hidden"
            >
              <div className="relative bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary-dark)] px-6 pb-6 pt-7 text-white">
                <button
                  onClick={() => setAccountOpen(false)}
                  aria-label="Close"
                  className="absolute right-4 top-4 rounded-full bg-white/15 p-2"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-4">
                  {me?.avatar ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={me.avatar}
                      referrerPolicy="no-referrer"
                      alt={me.name || "Account"}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white/70"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/50">
                      <FaUser className="h-6 w-6" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">
                      {me ? "Welcome back" : "Welcome"}
                    </p>
                    <p className="truncate text-lg font-bold">{me ? me.name : "Guest"}</p>
                    {me?.email && <p className="truncate text-xs text-white/75">{me.email}</p>}
                  </div>
                </div>
              </div>

              <div className="p-5 pb-8">
                {me ? (
                  <div className="space-y-2">
                    {[
                      { href: "/profile", label: "My Profile", icon: <FaUser className="h-4 w-4" /> },
                      { href: "/orders", label: "My Orders", icon: <ClipboardList className="h-4 w-4" /> },
                    ].map(({ href, label, icon }) => (
                      <Link
                        key={href}
                        href={shopHref(base, href)}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-[var(--theme-primary)]/20 px-4 py-3 text-sm font-semibold text-[var(--theme-text)] transition active:bg-[var(--theme-primary)]/10"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                          {icon}
                        </span>
                        <span className="flex-1">{label}</span>
                        <ChevronRight className="h-4 w-4 text-[var(--theme-text)]/30" />
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] py-3 text-sm font-bold text-white shadow-md shadow-[var(--theme-primary)]/30 transition active:scale-[0.98]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-center text-sm text-[var(--theme-text)]/65">
                      Sign in to track orders and save your wishlist
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => goAuth("login")}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] py-3 text-sm font-bold text-white shadow-md shadow-[var(--theme-primary)]/30 transition active:scale-[0.98]"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </button>
                      <button
                        onClick={() => goAuth("signup")}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--theme-primary)] py-3 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98]"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
