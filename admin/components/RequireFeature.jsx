"use client";

import useShopFeatures from "../hooks/useShopFeatures";

// ✅ Sidebar/Header এ গেটেড মেনু আইটেম হাইড করা হলেও, সরাসরি URL দিয়ে গেলে
// পেজটা যাতে ভাঙা/খালি অবস্থায় না খোলে (backend শুধু API কল-এ 403 দেয়,
// পেজ শেল ঠিকই রেন্ডার হয়ে যায়) — সেটা আটকাতে plan-gated পেজগুলো এই
// কম্পোনেন্ট দিয়ে wrap করা হয়। features === null (এখনও লোড হয়নি) অবস্থায়
// children হাইড রাখা হয়, যাতে ফিচার বন্ধ থাকা অবস্থায়ও এক মুহূর্তের জন্য
// আসল পেজ flash না করে।
export default function RequireFeature({ feature, children }) {
  const features = useShopFeatures();

  if (features === null) return null;

  if (!features[feature]) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
        <p className="mb-3 text-3xl">🔒</p>
        <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-slate-200">
          এই ফিচারটি আপনার বর্তমান প্ল্যানে নেই
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    );
  }

  return children;
}
