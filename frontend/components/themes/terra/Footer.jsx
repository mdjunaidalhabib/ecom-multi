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
  "mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-500";
const FOOTER_LINK =
  "text-sm text-gray-600 transition-colors hover:text-orange-500";

// Terra Prestige: white footer with a orange hairline rule on top — same
// /api/footer data contract as the other themes. Three clean columns (brand,
// quick links, contact), outlined social icons, restrained bottom bar.
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
    <footer className="mb-14 border-t-2 border-orange-500 bg-white px-4 pb-8 pt-16 text-gray-900 md:mb-0 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center gap-3">
              {brand.logo && !imgError ? (
                <Image
                  loader={cloudinaryLoader}
                  src={brand.logo}
                  alt={brand?.title || "Brand Logo"}
                  width={44}
                  height={44}
                  className="rounded-lg object-cover ring-1 ring-orange-500/50"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500 text-lg font-semibold text-white ring-1 ring-orange-500/50">
                  {brandTitle.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-lg font-semibold uppercase tracking-[0.14em] text-gray-900">
                {brandTitle}
              </h2>
            </div>

            <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-gray-600">
              {brand.about || "Thoughtfully sourced products, delivered with care and attention to detail."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
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
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <Icon className="text-sm" />
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={COLUMN_HEADING} style={{ fontFamily: "inherit" }}>
              Quick Links
            </h3>
            <ul className="mx-auto w-fit space-y-3 text-left">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={shopHref(base, item.href)}
                    className={`flex items-center gap-3 ${FOOTER_LINK}`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={COLUMN_HEADING} style={{ fontFamily: "inherit" }}>
              Contact
            </h3>
            <ul className="mx-auto w-fit max-w-full space-y-4 text-left text-sm text-gray-600">
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 transition-colors hover:text-orange-500"
                  >
                    <FaPhoneAlt className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="truncate">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 transition-colors hover:text-orange-500"
                  >
                    <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-orange-500" />
                  <span className="leading-6">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-orange-200 pt-6 text-xs tracking-wide text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.title || "Company"}. All Rights Reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://hikmahit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-orange-500 transition-colors hover:text-orange-600"
            >
              Hikmah IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
