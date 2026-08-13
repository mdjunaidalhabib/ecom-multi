import "./globals.css";

export const metadata = {
  title: "Dashboard | Super Admin Panel",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-pink-50">
          <div className="flex-1 flex flex-col">
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
