import "./globals.css";
import AdminPWARegister from "../../components/pwa-register.jsx";
import ThemeProvider from "../../components/ThemeProvider.jsx";

export const metadata = {
  title: "Dashboard | Admin Panel",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// ✅ React hydrate করার আগেই localStorage থেকে থিম পড়ে html এ dark class
// বসিয়ে দেয় — এতে পেজ লোডের সময় থিম flash দেখা যায় না। কোনো preference
// সেভ করা না থাকলে ডিফল্ট সবসময় light (system preference অনুসরণ করা হয় না)।
const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('admin-theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function AdminLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ admin manifest */}
        <link rel="manifest" href="/admin-manifest.json" />
        <meta name="theme-color" content="#f472b6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* ✅ Invoice renderer "Hind Siliguri" ফন্ট নাম দিয়ে টেক্সট আঁকে, কিন্তু
        এই ফন্ট আগে কোথাও লোডই হতো না — ব্রাউজার নিঃশব্দে Arial-এ fallback করত
        (তাই লাইভ প্রিভিউ ঠিক দেখাত), কিন্তু html2canvas না-থাকা ফন্ট-নেম রিজলভ
        করতে গিয়ে ভুল metrics দিয়ে টেক্সট আঁকত — ডাউনলোড করা PDF-এ টেক্সট/bg
        মিসঅ্যালাইন হওয়ার আসল কারণ ছিল এটাই। */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>

      <body suppressHydrationWarning>
        <ThemeProvider>
          {/* ✅ SW register component */}
          <AdminPWARegister />

          <div className="flex h-screen bg-pink-50 dark:bg-slate-950 transition-colors">
            <div className="flex-1 flex flex-col">
              <main>{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
