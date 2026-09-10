"use client";

// Loads the Hind Siliguri stylesheet without blocking first paint. A plain
// <link rel="stylesheet"> in <head> (the old approach) blocks the browser's
// first render until fonts.googleapis.com responds; the media="print" +
// onLoad swap trick below defers that instead of removing it, so the exact
// family name "Hind Siliguri" stays intact for the invoice PDF flow
// (InvoiceRenderer.jsx draws with it on canvas; InvoicePrintClient.jsx
// already awaits `document.fonts.ready` before capture, so the deferred
// load doesn't race it).
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap";

export default function FontLoader() {
  return (
    <>
      <link rel="preload" as="style" href={FONT_HREF} />
      <link
        rel="stylesheet"
        href={FONT_HREF}
        media="print"
        onLoad={(e) => {
          e.currentTarget.media = "all";
        }}
      />
      <noscript>
        <link rel="stylesheet" href={FONT_HREF} />
      </noscript>
    </>
  );
}
