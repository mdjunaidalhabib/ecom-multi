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

// Terra: warm, deep-green footer — same /api/footer data contract as the
// other themes, organic/friendly visual language.
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
    <footer className="mb-14 bg-emerald-950 px-4 pb-8 pt-14 text-emerald-100 md:mb-0 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {brand.logo && !imgError ? (
                <Image
                  loader={cloudinaryLoader}
                  src={brand.logo}
                  alt={brand?.title || "Brand Logo"}
                  width={40}
                  height={40}
                  className="rounded-2xl object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-800">
                  <FaLeaf className="h-4 w-4 text-emerald-200" />
                </div>
              )}
              <h2 className="text-lg font-bold text-white">{brand.title || "Brand"}</h2>
            </div>
            <p className="text-sm leading-6 text-emerald-200/80">
              {brand.about || "Fresh, honest products — sourced and shared with care."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
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
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900 text-emerald-100 transition hover:bg-amber-700"
                    >
                      <Icon className="text-sm" />
                    </Link>
                  );
                })}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={shopHref(base, item.href)} className="transition hover:text-amber-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={shopHref(base, item.href)} className="transition hover:text-amber-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              {contact.phone && (
                <li className="flex items-center gap-2.5">
                  <FaPhoneAlt className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <a href={`tel:${contact.phone}`} className="truncate hover:text-amber-400">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2.5">
                  <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <a href={`mailto:${contact.email}`} className="truncate hover:text-amber-400">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2.5">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="leading-5">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-emerald-800/60" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-emerald-300/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.title || "Company"}. All Rights Reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://hikmahit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-100 hover:text-amber-400"
            >
              Hikmah IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
