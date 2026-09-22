"use client";
import { useState, useEffect } from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebookMessenger,
  FaTimes,
  FaHeadset,
} from "react-icons/fa";

const formatWhatsapp = (raw) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "88" + digits;
  return "880" + digits;
};

const ITEM =
  "group relative flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition hover:bg-orange-500 hover:text-white hover:ring-orange-500 active:scale-95";
const TIP =
  "pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100";

// Shop Start: contact rail docked to the right edge — an orange tab that
// slides open a white panel of orange contact icons. Same
// /api/contact-button config as the classic floating button.
export default function TerraContactFab() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/api/contact-button")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("❌ Failed to load contact button config", err));
  }, []);

  if (!config || !config.enabled) return null;

  const { phone, whatsapp, messenger } = config;

  return (
    <div className="fixed bottom-24 right-0 z-[9999] flex flex-col items-end gap-2">
      <div
        className={`flex flex-col items-center gap-2.5 rounded-l-2xl border border-r-0 border-orange-200 bg-white p-2.5 shadow-[0_12px_30px_-10px_rgba(249,115,22,0.45)] transition-all duration-300 ${
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
      >
        {phone && (
          <a href={`tel:${phone}`} aria-label="Call" className={ITEM}>
            <FaPhoneAlt size={15} />
            <span className={TIP}>Call</span>
          </a>
        )}
        {whatsapp && (
          <a
            href={`https://wa.me/${formatWhatsapp(whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className={ITEM}
          >
            <FaWhatsapp size={19} />
            <span className={TIP}>WhatsApp</span>
          </a>
        )}
        {messenger && (
          <a
            href={messenger}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Messenger"
            className={ITEM}
          >
            <FaFacebookMessenger size={17} />
            <span className={TIP}>Messenger</span>
          </a>
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        className="relative flex h-12 w-12 items-center justify-center rounded-l-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/40 transition active:scale-95"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-l-2xl bg-orange-400/30" />
        )}
        <span className={`relative transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
          {open ? <FaTimes size={18} /> : <FaHeadset size={19} />}
        </span>
      </button>
    </div>
  );
}
