import { useEffect, useState } from "react";
import { getAdmin } from "../lib/auth";

// ✅ লগইন করা admin-এর তথ্য (role সহ) — Sidebar/Header এ role-gated মেনু
// আইটেম (যেমন Staff, শুধু শপ owner-দের জন্য) দেখানো/লুকানোর জন্য ব্যবহার হয়।
export function useCurrentAdmin() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    getAdmin().then(setAdmin);
  }, []);

  return admin;
}

export default useCurrentAdmin;
