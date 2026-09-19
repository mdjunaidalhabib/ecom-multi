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
} from "react-icons/fa";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

const SUPPORT_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Founder & CEO", href: "/founder-ceo" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "FAQ", href: "/faq" },
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
  "mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--theme-accent)]";
const FOOTER_LINK =
  "text-sm text-white/70 transition-colors hover:text-[var(--theme-accent)]";

// Terra Prestige: dark forest footer with a gold hairline rule on top — same
// /api/footer data contract as the other themes. Four clean columns (brand,
// explore, support, contact), outlined social icons, restrained bottom bar.
export default function TerraFooter() {
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

  return (
    <footer className="mb-14 border-t-2 border-[var(--theme-accent)] bg-[var(--theme-secondary)] px-4 pb-8 pt-16 text-white md:mb-0 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              {brand.logo && !imgError ? (
                <Image
                  loader={cloudinaryLoader}
                  src={brand.logo}
                  alt={brand?.title || "Brand Logo"}
                  width={44}
                  height={44}
                  className="rounded-lg object-cover ring-1 ring-[var(--theme-accent)]/50"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--theme-primary)] text-lg font-semibold text-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]/50">
                  {brandTitle.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-lg font-semibold uppercase tracking-[0.14em] text-white">
                {brandTitle}
              </h2>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              {brand.about || "Thoughtfully sourced products, delivered with care and attention to detail."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {socialLinks
                .filter((s) => s.url)
                .map((social, idx) => {
                  const Icon = SOCIAL_ICON_MAP[social.platform];
                  if (!Icon) return null;
                  return (
                    <Link
                      key={idx}
                      href={shopHref(base, social.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white"
                    >
                      <Icon className="text-sm" />
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h3 className={COLUMN_HEADING} style={{ fontFamily: "inherit" }}>
              Explore
            </h3>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={shopHref(base, item.href)} className={FOOTER_LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h3 className={COLUMN_HEADING} style={{ fontFamily: "inherit" }}>
              Support
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={shopHref(base, item.href)} className={FOOTER_LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h3 className={COLUMN_HEADING} style={{ fontFamily: "inherit" }}>
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-white/70">
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 transition-colors hover:text-[var(--theme-accent)]"
                  >
                    <FaPhoneAlt className="h-3.5 w-3.5 shrink-0 text-[var(--theme-accent)]" />
                    <span className="truncate">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 transition-colors hover:text-[var(--theme-accent)]"
                  >
                    <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-[var(--theme-accent)]" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--theme-accent)]" />
                  <span className="leading-6">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs tracking-wide text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.title || "Company"}. All Rights Reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://hikmahit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/80 transition-colors hover:text-[var(--theme-accent)]"
            >
              Hikmah IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
