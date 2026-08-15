"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

const THEME_KEY = "admin-theme";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

// SSR এ সবসময় "light" থেকে শুরু হয় (server এ document নেই), তাই hydration
// mismatch হয় না। কিন্তু client এ paint হওয়ার আগেই — useLayoutEffect দিয়ে —
// html ট্যাগে ইনলাইন স্ক্রিপ্ট (দেখুন app/layout.js) যে dark class বসিয়ে
// দিয়েছে সেটা পড়ে state sync করা হয়, যাতে theme-নির্ভর JS ভ্যালু (যেমন
// LoginPortal এর gradient) প্রথম paint থেকেই সঠিক থাকে, flash না করে।
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useLayoutEffect(() => {
    const initial = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
