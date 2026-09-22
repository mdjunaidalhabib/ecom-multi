"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import FooterSkeleton from "../../skeletons/FooterSkeleton";
import useShopPath, { shopHref } from "../../../hooks/useShopPath";
import {
  FaFacebookF,
  FaUsers,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaLinkedinIn,
  FaPinterest,
  FaSnapchatGhost,
  FaWhatsapp,
  FaTelegram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHome,
  FaShoppingBag,
  FaThLarge,
  FaChevronRight,
  FaHeadset,
  FaApple,
  FaGooglePlay,
  FaMoneyBillWave,
  FaCcVisa,
  FaCcMastercard,
  FaMobileAlt,
} from "react-icons/fa";

const QUICK_LINKS = [
  { label: "Home", href: "/", icon: FaHome },
  { label: "Shop", href: "/products", icon: FaShoppingBag },
  { label: "Categories", href: "/categories", icon: FaThLarge },
];

const SOCIAL_ICON_MAP = {
  facebook: FaFacebookF,
  facebook_group: FaUsers,
  youtube: FaYoutube,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  twitter: FaTwitter,
  linkedin: FaLinkedinIn,
  pinterest: FaPinterest,
  snapchat: FaSnapchatGhost,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
};

const COLUMN_HEADING =
  "mb-6 text-sm font-bold uppercase tracking-wider text-white";
const HEADING_BAR =
  "mt-2 block h-0.5 w-8 rounded-full bg-[var(--theme-primary)]";
const FOOTER_LINK =
  "group flex items-center gap-2 text-sm text-white/70 transition-all hover:translate-x-1 hover:text-white";
const CONTACT_ICON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs";

// FirstCart: dark footer with a bold primary "need help" band on top, then a
// 4-column grid (brand, quick links, contact, follow us) and a bottom bar.
// Same /api/footer data contract as the other themes.
export default function FirstCartFooter() {
  const { base } = useShopPath();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/footer", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load footer data");
        setData(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") console.error("❌ Footer Error:", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  if (loading) return <FooterSkeleton />;
  if (!data) return null;

  const { brand = {}, contact = {}, socialLinks = [] } = data;
  const brandTitle = brand.title || "Brand";
  const socials = socialLinks.filter(
    (s) => s.url && SOCIAL_ICON_MAP[s.platform]
  );

  return (
    <footer
      className="mb-14 md:mb-0"
      style={{
        background: "var(--theme-secondary, #111827)",
        color: "#fff",
      }}
    >
      {/* Help / CTA band */}
      <div style={{ background: "var(--theme-primary)" }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-5 px-4 py-8 text-center md:flex-row md:px-10 md:text-left">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl text-white">
              <FaHeadset />
            </span>
            <div>
              <h3
                className="text-xl font-bold text-white md:text-2xl"
                style={{ fontFamily: "var(--theme-font-heading, inherit)" }}
              >
                Need help? Contact us
              </h3>
              <p className="mt-1 text-sm text-white/85">
                We are here to help with your orders and questions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:scale-[1.03] hover:shadow-md"
                style={{ color: "var(--theme-primary)" }}
              >
                <FaPhoneAlt className="text-xs" />
                <span>{contact.phone}</span>
              </a>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-white/80 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <FaEnvelope className="shrink-0 text-xs" />
                <span className="truncate">{contact.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-14 md:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand + about */}
          <div>
            <div className="flex items-center gap-3">
              {brand.logo && !imgError ? (
                <Image
                  loader={cloudinaryLoader}
                  src={brand.logo}
                  alt={brand?.title || "Brand Logo"}
                  width={48}
                  height={48}
                  className="rounded-xl bg-white/10 object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white"
                  style={{ background: "var(--theme-primary)" }}
                >
                  {brandTitle.charAt(0).toUpperCase()}
                </div>
              )}
              <h2
                className="text-xl font-extrabold text-white"
                style={{ fontFamily: "var(--theme-font-heading, inherit)" }}
              >
                {brandTitle}
              </h2>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              {brand.about ||
                "Thoughtfully sourced products, delivered with care and attention to detail."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={COLUMN_HEADING}>
              Quick Links
              <span className={HEADING_BAR} />
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={shopHref(base, item.href)}
                    className={FOOTER_LINK}
                  >
                    <FaChevronRight
                      className="h-2.5 w-2.5 shrink-0"
                      style={{ color: "var(--theme-primary)" }}
                    />
                    <item.icon className="h-3.5 w-3.5 shrink-0 text-white/50" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={COLUMN_HEADING}>
              Contact
              <span className={HEADING_BAR} />
            </h3>
            <ul className="space-y-4 text-sm text-white/70">
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <span
                      className={CONTACT_ICON}
                      style={{ color: "var(--theme-primary)" }}
                    >
                      <FaPhoneAlt />
                    </span>
                    <span className="truncate">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <span
                      className={CONTACT_ICON}
                      style={{ color: "var(--theme-primary)" }}
                    >
                      <FaEnvelope />
                    </span>
                    <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-3">
                  <span
                    className={CONTACT_ICON}
                    style={{ color: "var(--theme-primary)" }}
                  >
                    <FaMapMarkerAlt />
                  </span>
                  <span className="pt-1.5 leading-6">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Follow us + we accept + get the app */}
          <div>
            <h3 className={COLUMN_HEADING}>
              Stay Connected
              <span className={HEADING_BAR} />
            </h3>

            {socials.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2.5">
                {socials.map((social, idx) => {
                  const Icon = SOCIAL_ICON_MAP[social.platform];
                  return (
                    <Link
                      key={idx}
                      href={shopHref(base, social.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-[var(--theme-primary)]"
                    >
                      <Icon className="text-sm" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* We accept */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              We Accept
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {[FaMoneyBillWave, FaMobileAlt, FaCcVisa, FaCcMastercard].map(
                (Icon, idx) => (
                  <span
                    key={idx}
                    className="flex h-9 w-11 items-center justify-center rounded-md bg-white/10 text-base text-white/80"
                  >
                    <Icon />
                  </span>
                )
              )}
            </div>

            {/* Get the app */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Get The App
            </p>
            <div className="flex flex-col gap-2.5">
              <span className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-white/90 transition hover:border-white/30 hover:bg-white/10">
                <FaApple className="text-lg" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-white/60">
                    Download on the
                  </span>
                  <span className="block text-sm font-semibold">
                    App Store
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-white/90 transition hover:border-white/30 hover:bg-white/10">
                <FaGooglePlay className="text-lg" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-white/60">
                    Get it on
                  </span>
                  <span className="block text-sm font-semibold">
                    Google Play
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-[var(--theme-secondary)]/70 md:flex-row md:px-10 md:text-left">
          <p>
            © {new Date().getFullYear()} {brand.title || "Company"}. All Rights
            Reserved.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Secure checkout</span>
            <span className="text-[var(--theme-secondary)]/30">•</span>
            <span>Cash on delivery</span>
            <span className="text-[var(--theme-secondary)]/30">•</span>
            <span>Fast delivery</span>
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://hikmahit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--theme-primary)] transition-opacity hover:opacity-80"
            >
              Hikmah IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
