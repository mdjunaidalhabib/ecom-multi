import { useMemo } from "react";
import { settingsChildren, settingsGroups } from "../components/menuConfig";
import { useShopFeatures, filterByFeature, filterByPermission } from "./useShopFeatures";
import { useCurrentAdmin } from "./useCurrentAdmin";

const groupItems = (items) =>
  settingsGroups
    .map((group) => ({ ...group, items: items.filter((item) => item.group === group.key) }))
    .filter((group) => group.items.length > 0);

// ✅ লগইন করা admin-এর ফিচার/পারমিশন অনুযায়ী দেখার মতো Settings আইটেমগুলো
// গ্রুপ অনুযায়ী সাজিয়ে দেয় (খালি গ্রুপ বাদ)।
//   allGroups / allTotal → সার্চ ছাড়া পুরো তালিকা
//   groups / total       → `query` (label/desc) দিয়ে ফিল্টার করা তালিকা
// SettingsSideMenu ও /admin/settings হাব দুটোই এটা ব্যবহার করে।
export default function useSettingsGroups(query = "") {
  const features = useShopFeatures();
  const admin = useCurrentAdmin();

  return useMemo(() => {
    const visible = filterByPermission(filterByFeature(settingsChildren, features), admin);
    const q = query.trim().toLowerCase();
    const matched = q
      ? visible.filter((item) => `${item.label} ${item.desc}`.toLowerCase().includes(q))
      : visible;

    return {
      allGroups: groupItems(visible),
      allTotal: visible.length,
      groups: groupItems(matched),
      total: matched.length,
      loading: features === null || admin === null,
    };
  }, [features, admin, query]);
}
