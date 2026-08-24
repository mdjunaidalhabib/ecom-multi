import "./globals.css";
import ThemeProvider from "../../components/ThemeProvider.jsx";

export const metadata = {
  title: "Dashboard | Super Admin Panel",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

// ✅ React hydrate করার আগেই localStorage থেকে থিম পড়ে html এ dark class
// বসিয়ে দেয় — এতে পেজ লোডের সময় থিম flash দেখা যায় না। কোনো preference
// সেভ করা না থাকলে ডিফল্ট সবসময় light (system preference অনুসরণ করা হয় না)।
const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('super-admin-theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
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
