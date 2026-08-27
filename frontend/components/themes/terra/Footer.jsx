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
  FaLeaf,
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

// Terra: organic rounded-top footer — same /api/footer data contract as the
// other themes. Rounded-top "card" sitting on the page, soft blurred blob
// decorations, and each section rendered as its own rounded card instead of
// plain columns, for a warm/friendly visual language distinct from Aurora.
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

  return (
    <footer className="relative mb-20 overflow-hidden rounded-t-[2.5rem] bg-gradient-to-b from-[var(--theme-text)] to-[var(--theme-secondary)] px-4 pb-8 pt-12 text-emerald-100 md:mb-0 md:px-10">
      {/* Organic decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[var(--theme-primary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[var(--theme-accent)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Brand strip */}
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            {brand.logo && !imgError ? (
              <Image
                loader={cloudinaryLoader}
                src={brand.logo}
                alt={brand?.title || "Brand Logo"}
                width={44}
                height={44}
                className="rounded-2xl object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--theme-primary-dark)]">
                <FaLeaf className="h-5 w-5 text-emerald-200" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-white">{brand.title || "Brand"}</h2>
              <p className="max-w-sm text-sm leading-6 text-emerald-200/80">
                {brand.about || "Fresh, honest products — sourced and shared with care."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--theme-primary-dark)]/70 text-emerald-100 transition hover:bg-[var(--theme-accent)]"
                  >
                    <Icon className="text-sm" />
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Section cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--theme-text)]/40 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={shopHref(base, item.href)} className="transition hover:text-[var(--theme-accent)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[var(--theme-text)]/40 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={shopHref(base, item.href)} className="transition hover:text-[var(--theme-accent)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[var(--theme-text)]/40 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 rounded-full bg-[var(--theme-secondary)]/60 px-3 py-1.5 hover:text-[var(--theme-accent)]"
                  >
                    <FaPhoneAlt className="h-3 w-3 shrink-0 text-[var(--theme-accent)]" />
                    <span className="truncate">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 rounded-full bg-[var(--theme-secondary)]/60 px-3 py-1.5 hover:text-[var(--theme-accent)]"
                  >
                    <FaEnvelope className="h-3 w-3 shrink-0 text-[var(--theme-accent)]" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2 rounded-2xl bg-[var(--theme-secondary)]/60 px-3 py-1.5">
                  <FaMapMarkerAlt className="mt-1 h-3 w-3 shrink-0 text-[var(--theme-accent)]" />
                  <span className="leading-5">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[var(--theme-primary-dark)]/60 pt-6 text-xs text-emerald-300/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.title || "Company"}. All Rights Reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://hikmahit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-100 hover:text-[var(--theme-accent)]"
            >
              Hikmah IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
