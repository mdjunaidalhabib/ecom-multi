import { useEffect, useState } from "react";
import axios from "axios";

// ✅ লগইন করা admin-এর শপের প্ল্যানে কোন কোন ফিচার (analytics, promo...) চালু
// আছে সেটা ফেচ করে। মেনু আইটেম গেট করতে Sidebar/Header এ ব্যবহার হয়।
// লোড হওয়ার আগে null থাকে, যাতে caller গেটেড আইটেম আগেভাগে না দেখিয়ে
// লুকিয়ে রাখতে পারে (দেখানো-পরে-লুকানোর flicker এড়াতে)।
export function useShopFeatures() {
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    axios
      .get("/api/admin/my-features", { withCredentials: true })
      .then((res) => setFeatures(res.data?.features || {}))
      .catch(() => setFeatures({}));
  }, []);

  return features;
}

// ✅ বর্তমান শপের plan/status/মেয়াদ (planExpiresAt) — Header-এ সংক্ষেপে আর
// "আমার প্ল্যান" পেজে বিস্তারিত দেখানোর জন্য। null মানে এখনো লোড হয়নি।
export function useMyPlanInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    axios
      .get("/api/admin/my-features", { withCredentials: true })
      .then((res) => setInfo(res.data || null))
      .catch(() => setInfo(null));
  }, []);

  return info;
}

// ✅ navItems/settingsChildren থেকে যেসব আইটেমে `feature` key আছে কিন্তু
// শপের প্ল্যানে সেটা enabled না, সেগুলো বাদ দেয়। features === null হলে
// (এখনও লোড হয়নি) গেটেড আইটেম হাইড থাকে।
export function filterByFeature(items, features) {
  return items.filter((item) => !item.feature || features?.[item.feature]);
}

// ✅ navItems/settingsChildren থেকে যেসব আইটেমে `roles` key আছে কিন্তু
// লগইন করা admin-এর role সেই তালিকায় নেই, সেগুলো বাদ দেয় (যেমন "Staff"
// মেনু শুধু role: "admin" (শপ owner) দেখবে, "staff" role দেখবে না)।
// role === null হলে (এখনও লোড হয়নি) গেটেড আইটেম হাইড থাকে।
export function filterByRole(items, role) {
  return items.filter((item) => !item.roles || (role && item.roles.includes(role)));
}

// ✅ navItems/settingsChildren থেকে যেসব আইটেমে `permission` key আছে কিন্তু
// লগইন করা staff-কে শপ owner সেই সেকশনে "view" অ্যাক্সেস দেয়নি, সেগুলো বাদ
// দেয় (permissions এখন { orders: { view, add, edit, delete }, ... } এই
// module→action ম্যাট্রিক্স শেপে — দেখুন admin/lib/staffPermissions.js)।
// শপ owner/superadmin এর জন্য সবসময় সব আইটেম দেখানো হয় (তাদের permissions
// প্রযোজ্য না)। admin === null হলে (এখনও লোড হয়নি) গেটেড আইটেম হাইড থাকে।
export function filterByPermission(items, admin) {
  return items.filter((item) => {
    if (!item.permission) return true;
    if (!admin) return false;
    if (admin.role !== "staff") return true;
    return !!admin.permissions?.[item.permission]?.view;
  });
}

export default useShopFeatures;
