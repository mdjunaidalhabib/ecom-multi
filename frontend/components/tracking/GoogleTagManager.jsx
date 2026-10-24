import Script from "next/script";

// ✅ Google Tag Manager — ECMS প্ল্যাটফর্ম ল্যান্ডিং ও শপের ল্যান্ডিং পেজ (/lp/...)
// দুই জায়গাতেই এই একটাই কম্পোনেন্ট ব্যবহার হয়। Container ID আসে ডাটাবেস থেকে
// (শপ-মালিক: Admin → Settings → Tracking, প্ল্যাটফর্ম: Super Admin → Tracking)।
//
// ID ভ্যালিডেট করা হয় (শুধু GTM-XXXX ফরম্যাট) — তাই কেউ ভুল/ক্ষতিকর কিছু বসালেও
// তা inline script-এ ঢুকতে পারে না। ID খালি/ভুল হলে কিছুই রেন্ডার হয় না।
const GTM_ID_REGEX = /^GTM-[A-Z0-9]{4,12}$/;

export default function GoogleTagManager({ gtmId }) {
  const id = String(gtmId || "").trim().toUpperCase();
  if (!GTM_ID_REGEX.test(id)) return null;

  return (
    <>
      <Script id={`gtm-${id}`} strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
