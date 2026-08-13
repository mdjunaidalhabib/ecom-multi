export function makeImageUrl(path) {
  if (!path) return "/placeholder.png";

  return path.startsWith("http") ? path : `/api${path}`;
}

// Cloudinary transformation logic now lives in lib/cloudinaryLoader.js,
// wired globally via next.config.js images.loaderFile — so every
// next/image usage gets it automatically, no per-component call needed.

// ✅ App-wide fixed timezone. Order/record timestamps are always generated
// server-side (mongoose `timestamps: true`), so the stored value is already
// correct — but rendering with the browser's default `toLocaleString()`
// silently uses the CUSTOMER'S DEVICE timezone. If that device's
// clock/timezone is misconfigured, the same correct server time shows up
// wrong on screen. Pinning `timeZone` here keeps the display correct
// regardless of device settings.
const APP_TIME_ZONE = "Asia/Dhaka";

export function formatDateTime(value, options = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}

export function formatDate(value, options = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}
