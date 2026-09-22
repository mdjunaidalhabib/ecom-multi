"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import { FaBars, FaTimes, FaSearch, FaHome, FaThLarge, FaUser, FaPhoneAlt } from "react-icons/fa";
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
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
];

// Shared badge override: the shared icon widgets render a red count badge; here
// it is re-skinned with theme vars (primary chip, or white chip on primary bg).
const BADGE_ON_LIGHT =
  "[&_span.bg-red-500]:bg-[var(--theme-primary)] [&_span.bg-red-500]:font-bold [&_span.bg-red-500]:text-white [&_span.bg-red-500]:ring-2 [&_span.bg-red-500]:ring-[var(--theme-surface)] [&_span.bg-red-500]:-right-2 [&_span.bg-red-500]:-top-2";
const BADGE_ON_PRIMARY =
  "[&_span.bg-red-500]:bg-white [&_span.bg-red-500]:font-bold [&_span.bg-red-500]:text-[var(--theme-primary)] [&_span.bg-red-500]:-right-2 [&_span.bg-red-500]:-top-2";

// FirstCart: modern marketplace navbar — slim dark announcement strip (phone +
// tagline), a white main bar (logo | large pill search | round icon buttons
// with count badges), and a sticky primary-coloured category/link row beneath.
// Mobile: compact top bar, slide-in drawer with quick tiles, and a bottom tab
// bar with a raised centre cart button. Same functional widgets as other themes.
export default function FirstCartNavbar() {
  const [navbar, setNavbar] = useState(null);
  const [phone, setPhone] = useState("");
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

  // Shop phone for the top strip (optional — strip simply hides it if missing).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/footer");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPhone(data?.contact?.phone || "");
      } catch {
        /* optional data — ignore */
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

  const logoMark = (size) =>
    navbar?.brand?.logo && !imgError ? (
      <img
        src={navbar.brand.logo}
        alt={brandName || "Brand"}
        className={`${size} shrink-0 rounded-xl object-cover`}
        onError={() => setImgError(true)}
      />
    ) : (
      <div
        className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary)] text-base font-extrabold text-white`}
        style={{ fontFamily: "var(--theme-font-heading)" }}
      >
        {(brandName.charAt(0) || "F").toUpperCase()}
      </div>
    );

  return (
    <>
      {/* ── Sticky header: main bar + category row ── */}
      <header className="sticky top-0 z-50 bg-[var(--theme-surface)] shadow-sm">
        {/* Main bar */}
        <div className="mx-auto flex h-[60px] w-full max-w-[1320px] items-center gap-3 px-4 sm:px-6 md:h-[76px] md:gap-8">
          <button
            onClick={() => setMenuOpen(true)}
            className="-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-bg)] md:hidden"
            aria-label="Open menu"
          >
            <FaBars className="h-5 w-5" />
          </button>

          <Link href={base || "/"} className="flex min-w-0 flex-1 items-center gap-2.5 md:flex-none">
            {logoMark("h-9 w-9 md:h-11 md:w-11")}
            <span
              className="truncate text-base font-extrabold tracking-tight text-[var(--theme-text)] md:max-w-[200px] md:text-xl"
              style={{ fontFamily: "var(--theme-font-heading)" }}
            >
              {brandName}
            </span>
          </Link>

          {/* Large pill search (desktop) */}
          <div className="relative hidden min-w-0 flex-1 md:block [&>div]:w-full [&_div.absolute]:w-full [&_div.absolute]:rounded-2xl [&_input]:h-12 [&_input]:w-full [&_input]:rounded-full [&_input]:border-2 [&_input]:border-transparent [&_input]:bg-[var(--theme-bg)] [&_input]:pl-12 [&_input]:pr-5 [&_input]:text-sm [&_input]:text-[var(--theme-text)] [&_input]:transition [&_input:focus]:border-[var(--theme-primary)] [&_input:focus]:bg-[var(--theme-surface)] [&_input:focus]:outline-none">
            <FaSearch className="pointer-events-none absolute left-5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--theme-primary)]" />
            <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} placeholders={SEARCH_HINTS} />
          </div>

          {/* Icon buttons */}
          <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-bg)] md:hidden"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search"
            >
              <FaSearch className="h-4 w-4" />
            </button>

            <div className="hidden text-[var(--theme-text)] md:block [&_button]:rounded-full [&_button]:font-semibold [&_button:hover]:bg-[var(--theme-bg)] [&_button:hover]:text-[var(--theme-primary)] [&_a:hover]:bg-[var(--theme-bg)] [&_a:hover]:text-[var(--theme-primary)]">
              <AccountMenuDesktop />
            </div>

            <div
              className={`hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-primary)]/15 hover:text-[var(--theme-primary)] md:flex ${BADGE_ON_LIGHT}`}
            >
              <WishlistIcon wishlistCount={wishlistCount} outline />
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/30 transition-colors hover:bg-[var(--theme-primary-dark)] md:h-11 md:w-11 ${BADGE_ON_PRIMARY}`}
            >
              <CartIcon cartCount={cartCount} outline />
            </div>
          </div>
        </div>

        {/* Category / link row (desktop) */}
        <div className="hidden text-white md:block" style={{ background: "var(--theme-primary)" }}>
          <div className="mx-auto flex h-11 w-full max-w-[1320px] items-stretch justify-between px-6">
            <div className="flex items-stretch gap-1">
              <Link
                href={shopHref(base, "/categories")}
                className="mr-3 flex items-center gap-2 bg-[var(--theme-primary-dark)] px-5 text-[13px] font-bold uppercase tracking-wide transition-colors hover:brightness-110"
              >
                <FaBars className="h-3.5 w-3.5" />
                All Categories
              </Link>
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={shopHref(base, href)}
                  className={`relative flex items-center px-4 text-[13px] font-semibold tracking-wide transition-colors ${
                    isActive(href) ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute inset-x-4 bottom-0 h-[3px] rounded-t bg-white transition-opacity ${
                      isActive(href) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              ))}
            </div>
            <Link
              href={shopHref(base, "/cart")}
              className="flex items-center gap-2 text-[13px] font-semibold text-white/90 transition-colors hover:text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? "s" : ""} in cart` : "Your cart is empty"}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile search dropdown (rendered by SearchBox, anchored under header) */}
      <div className="md:hidden">
        <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} placeholders={SEARCH_HINTS} />
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[300px] max-w-[88vw] flex-col bg-[var(--theme-surface)] md:hidden"
            >
              {/* Drawer header: brand + greeting */}
              <div className="relative bg-[var(--theme-primary)] px-5 pb-5 pt-5 text-white">
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="absolute right-3 top-3 rounded-full bg-white/15 p-2"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-3">
                  {me?.avatar ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={me.avatar}
                      referrerPolicy="no-referrer"
                      alt={me.name || "Account"}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
                      <FaUser className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 pr-8">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/75">
                      {me ? "Welcome back" : "Welcome"}
                    </p>
                    <p
                      className="truncate text-base font-bold"
                      style={{ fontFamily: "var(--theme-font-heading)" }}
                    >
                      {me ? me.name : brandName || "Guest"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Quick tiles */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: "/cart", label: "Cart", icon: <ShoppingCart className="h-5 w-5" />, count: cartCount },
                    { href: "/wishlist", label: "Wishlist", icon: <Heart className="h-5 w-5" />, count: wishlistCount },
                  ].map(({ href, label, icon, count }) => (
                    <Link
                      key={href}
                      href={shopHref(base, href)}
                      onClick={() => setMenuOpen(false)}
                      className={`relative flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-sm font-semibold transition-colors ${
                        isActive(href)
                          ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                          : "border-[var(--theme-text)]/10 bg-[var(--theme-bg)] text-[var(--theme-text)]"
                      }`}
                    >
                      {icon}
                      {label}
                      {count > 0 && (
                        <span
                          className={`absolute right-3 top-3 min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold ${
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
                </div>

                {/* Links */}
                <nav className="mt-4 space-y-1">
                  {[
                    { href: "/", label: "Home", icon: <FaHome className="h-4 w-4" /> },
                    { href: "/products", label: "Shop", icon: <FaThLarge className="h-4 w-4" /> },
                    { href: "/categories", label: "Categories", icon: <FaThLarge className="h-4 w-4" /> },
                    ...(me ? [{ href: "/orders", label: "My Orders", icon: <ClipboardList className="h-4 w-4" /> }] : []),
                  ].map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={shopHref(base, href)}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive(href)
                          ? "bg-[var(--theme-primary)]/10 font-bold text-[var(--theme-primary)]"
                          : "text-[var(--theme-text)]/85 hover:bg-[var(--theme-bg)]"
                      }`}
                    >
                      <span className="text-[var(--theme-primary)]">{icon}</span>
                      <span className="flex-1">{label}</span>
                      <ChevronRight className="h-4 w-4 text-[var(--theme-text)]/30" />
                    </Link>
                  ))}
                </nav>

                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--theme-secondary)] px-4 py-3 text-sm font-medium text-white"
                  >
                    <FaPhoneAlt className="h-3.5 w-3.5" />
                    {phone}
                  </a>
                )}
              </div>

              {/* Auth actions */}
              {!loadingUser && (
                <div className="border-t border-[var(--theme-text)]/10 p-4">
                  {me ? (
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--theme-primary)] py-2.5 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => goAuth("login")}
                        className="flex items-center justify-center gap-2 rounded-full bg-[var(--theme-primary)] py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--theme-primary)]/30 transition active:scale-[0.98] hover:bg-[var(--theme-primary-dark)]"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </button>
                      <button
                        onClick={() => goAuth("signup")}
                        className="flex items-center justify-center gap-2 rounded-full border-2 border-[var(--theme-primary)] py-2.5 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98] hover:bg-[var(--theme-primary)]/10"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom tab bar (raised centre cart) ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--theme-text)]/10 bg-[var(--theme-surface)] shadow-[0_-6px_20px_rgba(0,0,0,0.08)] md:hidden">
        <div className="grid h-14 grid-cols-5 items-center text-[var(--theme-text)]/60">
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
            { key: "cart", path: "/cart", center: true, node: (
              <div className="-mt-7 flex flex-col items-center gap-1 text-[10.5px] font-semibold">
                <div
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/40 ring-4 ring-[var(--theme-surface)] ${BADGE_ON_LIGHT}`}
                >
                  <CartIcon cartCount={cartCount} outline filled={isActive("/cart")} />
                </div>
                Cart
              </div>
            ) },
            { key: "wishlist", path: "/wishlist", node: (
              <div className={`text-[10.5px] font-medium [&_svg]:h-5 [&_svg]:w-5 [&_a]:gap-0.5 ${BADGE_ON_LIGHT}`}>
                <WishlistIcon wishlistCount={wishlistCount} mobile outline filled={isActive("/wishlist")} />
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
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-[var(--theme-primary)]/60"
                  />
                ) : (
                  <FaUser className="h-5 w-5" />
                )}
                Account
              </button>
            ) },
          ].map(({ key, path, also, center, node }) => {
            const active = isActive(path) || (also && isActive(also));
            return (
              <div
                key={key}
                className={`relative flex min-w-0 justify-center transition-colors ${
                  active && !center ? "font-bold text-[var(--theme-primary)]" : ""
                } ${center && active ? "text-[var(--theme-primary)]" : ""}`}
              >
                {active && !center && (
                  <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-b bg-[var(--theme-primary)]" />
                )}
                {node}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile account sheet ── */}
      <AnimatePresence>
        {accountOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black md:hidden"
              onClick={() => setAccountOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 z-[90] overflow-hidden rounded-t-3xl bg-[var(--theme-surface)] shadow-2xl md:hidden"
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--theme-text)]/15" />
              <button
                onClick={() => setAccountOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full bg-[var(--theme-bg)] p-2 text-[var(--theme-text)]"
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-4 px-6 pb-4 pt-5">
                {me?.avatar ? (
                  <Image
                    loader={cloudinaryLoader}
                    src={me.avatar}
                    referrerPolicy="no-referrer"
                    alt={me.name || "Account"}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--theme-primary)]"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                    <FaUser className="h-6 w-6" />
                  </span>
                )}
                <div className="min-w-0 pr-8">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--theme-primary)]">
                    {me ? "Welcome back" : "Welcome"}
                  </p>
                  <p
                    className="truncate text-lg font-bold text-[var(--theme-text)]"
                    style={{ fontFamily: "var(--theme-font-heading)" }}
                  >
                    {me ? me.name : "Guest"}
                  </p>
                  {me?.email && <p className="truncate text-xs text-[var(--theme-text)]/60">{me.email}</p>}
                </div>
              </div>

              <div className="px-5 pb-8">
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
                        className="flex items-center gap-3 rounded-2xl bg-[var(--theme-bg)] px-4 py-3 text-sm font-semibold text-[var(--theme-text)] transition active:bg-[var(--theme-primary)]/10"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white">
                          {icon}
                        </span>
                        <span className="flex-1">{label}</span>
                        <ChevronRight className="h-4 w-4 text-[var(--theme-text)]/30" />
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--theme-primary)] py-3 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98]"
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
                        className="flex items-center justify-center gap-2 rounded-full bg-[var(--theme-primary)] py-3 text-sm font-bold text-white shadow-md shadow-[var(--theme-primary)]/30 transition active:scale-[0.98]"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </button>
                      <button
                        onClick={() => goAuth("signup")}
                        className="flex items-center justify-center gap-2 rounded-full border-2 border-[var(--theme-primary)] py-3 text-sm font-bold text-[var(--theme-primary)] transition active:scale-[0.98]"
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
