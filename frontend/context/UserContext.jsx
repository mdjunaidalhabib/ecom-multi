"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children, shopSlug, skipAutoFetch = false }) => {
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Helper: fetch user by token
  // extraHeaders: x-shop-slug explicit ভাবে পাঠানোর জন্য — middleware-এর
  // Referer-sniffing (frontend/src/middleware.js) সবসময় নির্ভরযোগ্য নয়
  // (যেমন /auth/callback-এর নিজের URL-এ /shop/<slug> prefix থাকে না),
  // আর মিস করলে backend ভুল/অস্তিত্বহীন শপ দিয়ে resolve করতে গিয়ে 404
  // দেয়, যেটা সাথে সাথে "logged out" অবস্থায় ফিরিয়ে দেয় (নিচে দেখুন)।
  const fetchMe = async (token, extraHeaders = {}) => {
    try {
      const res = await fetch(
        `/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...extraHeaders,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMe(data);
      } else {
        localStorage.removeItem("token");
        setMe(null);
      }
    } catch (err) {
      console.error("❌ Failed to load user:", err);
      localStorage.removeItem("token");
      setMe(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // ✅ App শুরু হলে localStorage থেকে token চেক করো
  // shopSlug: path-based শপে (/shop/<slug>) server layout থেকে সরাসরি
  // পাঠানো হয় — Referer-sniffing (middleware.js) এর উপর নির্ভর না করে
  // explicit ভাবে x-shop-slug পাঠানো হচ্ছে।
  //
  // skipAutoFetch: /auth/callback/layout.js এখানে true পাঠায়। কারণ ওই
  // পেজ (page.jsx) নিজেই সঠিক x-shop-slug header দিয়ে fetchMe() কল করে
  // এবং সেটার আগেই localStorage-এ token সেভ করে দেয় — এই effect (parent
  // হওয়ায় child-এর effect-এর পরে fire হয়) তখন সেই একই token localStorage-এ
  // পেয়ে যেত এবং shopSlug না থাকায় header ছাড়াই duplicate fetchMe() চালাত,
  // যেটা 404 দিয়ে সদ্য-সেভ হওয়া বৈধ token-টাই মুছে দিত (!res.ok হ্যান্ডলার)
  // — ফলে redirect হওয়ার আগেই "logged out" হয়ে যেত।
  useEffect(() => {
    if (skipAutoFetch) {
      setLoadingUser(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (token) {
      const extraHeaders = shopSlug ? { "x-shop-slug": shopSlug } : {};
      fetchMe(token, extraHeaders);
    } else {
      setLoadingUser(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ me, setMe, loadingUser, fetchMe }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
