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

// ✅ navItems/settingsChildren থেকে যেসব আইটেমে `feature` key আছে কিন্তু
// শপের প্ল্যানে সেটা enabled না, সেগুলো বাদ দেয়। features === null হলে
// (এখনও লোড হয়নি) গেটেড আইটেম হাইড থাকে।
export function filterByFeature(items, features) {
  return items.filter((item) => !item.feature || features?.[item.feature]);
}

export default useShopFeatures;
