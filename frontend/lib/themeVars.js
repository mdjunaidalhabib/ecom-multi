// Small fixed map from a Theme preset's `fonts.heading`/`fonts.body` preset
// key (super-admin only picks from FONT_PRESETS on the backend, see
// backend/src/models/Theme.js) to an actual CSS font-family value. Keeping
// the real CSS values here — not stored as free text in the DB — means a
// theme document can never inject arbitrary CSS into these variables.
const FONT_STACKS = {
  default: "inherit",
  serif: "Georgia, 'Times New Roman', serif",
  rounded: "ui-rounded, 'Segoe UI', system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

// Builds the CSS custom properties a storefront theme's colors/fonts map to
// — consumed by the 9 theme Navbar/Footer/HomeLayout components via
// Tailwind arbitrary-value classes such as bg-[var(--theme-primary)] /
// text-[var(--theme-primary)] (written out as literal var() calls below, not
// as a bracket pattern here, since Tailwind's content scanner reads this
// file's raw text too — a literal "[var(--theme-*)]" here was previously
// getting picked up and compiled as its own (invalid) CSS class).
export function buildThemeVars(theme) {
  const colors = theme?.colors || {};
  const fonts = theme?.fonts || {};

  // Terra ("Shop Start") আর FirstCart থিমে shared ProductCard-এর body সাদা +
  // theme primary accent হিসেবে ব্যবহার হয়। Classic (OpenCart) থিম এগুলো unset
  // রাখে, তাই card/পেজ নিজের built-in pink fallback-এ থাকে।
  const isWhiteLayout = theme?.baseLayout === "terra" || theme?.baseLayout === "firstcart";
  const primary = colors.primary || "#ea580c";
  const primaryDark = colors.primaryDark || "#c2410c";
  const cardVars = isWhiteLayout
    ? {
        "--card-bg": "#ffffff",
        "--card-ring": "color-mix(in srgb, " + primary + " 15%, transparent)",
        "--card-accent": primary,
        "--card-accent-hover": primaryDark,
        "--card-border": "color-mix(in srgb, " + primary + " 45%, white)",
        "--card-sel-bg": primary,
        "--card-sel-text": "#ffffff",
        "--card-sel-hover": "color-mix(in srgb, " + primary + " 12%, white)",
        "--card-soft": "color-mix(in srgb, " + primary + " 10%, white)",
        // Cart / Wishlist পেজ: সাদা background + সাদা card (pink নয়)
        "--page-bg": "#ffffff",
        "--page-card-bg": "#ffffff",
        "--page-card-border": "#e5e7eb",
        "--page-accent": primary,
        "--page-accent-hover": primaryDark,
        "--page-heading-gradient": "linear-gradient(to right, " + primary + ", " + primary + ")",
      }
    : {};

  return {
    ...cardVars,
    "--theme-primary": colors.primary || "#db2777",
    "--theme-primary-dark": colors.primaryDark || "#be185d",
    "--theme-secondary": colors.secondary || "#111827",
    "--theme-bg": colors.background || "#fdf2f8",
    "--theme-surface": colors.surface || "#ffffff",
    "--theme-text": colors.text || "#1f2937",
    "--theme-accent": colors.accent || "#ec4899",
    "--theme-font-heading": FONT_STACKS[fonts.heading] || FONT_STACKS.default,
    "--theme-font-body": FONT_STACKS[fonts.body] || FONT_STACKS.default,
  };
}
