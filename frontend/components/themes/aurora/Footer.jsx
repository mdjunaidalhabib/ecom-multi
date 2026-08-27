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

// Aurora: dark, centered editorial footer — same /api/footer data contract
// as the other themes (brand/contact/socialLinks). Brand block, then all
// links/contact centered underneath in a single flowing column, separated
// by thin gold rules — a boutique/magazine-style layout rather than a grid.
export default function AuroraFooter() {
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
    <footer className="mb-14 bg-[var(--theme-secondary)] px-4 pb-10 pt-16 text-neutral-300 md:mb-0 md:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Brand block — centered */}
        <div className="flex items-center gap-3">
          {brand.logo && !imgError ? (
            <Image
              loader={cloudinaryLoader}
              src={brand.logo}
              alt={brand?.title || "Brand Logo"}
              width={44}
              height={44}
              className="rounded-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-neutral-800" />
          )}
          <h2 className="font-serif text-2xl tracking-tight text-white">
            {brand.title || "Brand"}
          </h2>
        </div>
        <p className="mt-4 max-w-md text-sm leading-6 text-neutral-400">
          {brand.about || "Thoughtfully curated products, delivered with care."}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
                >
                  <Icon className="text-sm" />
                </Link>
              );
            })}
        </div>

        {/* Gold rule */}
        <div className="my-10 h-px w-24 bg-gradient-to-r from-transparent via-[var(--theme-accent)]/60 to-transparent" />

        {/* Links + contact — flowing centered row, wraps on small screens */}
        <div className="flex flex-wrap items-start justify-center gap-x-14 gap-y-8 text-sm">
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={shopHref(base, item.href)}
                    className="transition hover:text-[var(--theme-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Support
            </h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={shopHref(base, item.href)}
                    className="transition hover:text-[var(--theme-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Contact
            </h3>
            <ul className="space-y-3">
              {contact.phone && (
                <li className="flex items-center gap-2.5">
                  <FaPhoneAlt className="h-3.5 w-3.5 shrink-0 text-[var(--theme-accent)]" />
                  <a href={`tel:${contact.phone}`} className="hover:text-[var(--theme-accent)]">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2.5">
                  <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-[var(--theme-accent)]" />
                  <a href={`mailto:${contact.email}`} className="hover:text-[var(--theme-accent)]">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2.5 text-left">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--theme-accent)]" />
                  <span className="leading-5">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-1.5 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} {brand.title || "Company"}. All Rights Reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://hikmahit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-300 hover:text-[var(--theme-accent)]"
            >
              Hikmah IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
