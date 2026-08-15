// ✅ backend/src/constants/staffPermissions.js এর সাথে সিঙ্কে রাখতে হবে —
// শপ owner Staff পেজ থেকে এই module/action ম্যাট্রিক্স দিয়ে প্রতিটা
// staff-কে view/add/edit/delete লেভেলে অ্যাক্সেস দেয়।
export const STAFF_PERMISSION_MODULES = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Category" },
  { key: "users", label: "Users" },
  { key: "sliders", label: "Sliders" },
  { key: "promos", label: "Promo Codes" },
  { key: "landingPages", label: "Landing Pages" },
  { key: "analytics", label: "Visitor" },
  { key: "payments", label: "Payments" },
  { key: "plan", label: "Plan" },
  { key: "trash", label: "Trash" },
  { key: "settings", label: "Settings" },
  { key: "invoiceDesign", label: "Invoice Design" },
];

export const STAFF_PERMISSION_ACTIONS = [
  { key: "view", label: "View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

export function emptyStaffPermissions() {
  return Object.fromEntries(
    STAFF_PERMISSION_MODULES.map(({ key: moduleKey }) => [
      moduleKey,
      Object.fromEntries(
        STAFF_PERMISSION_ACTIONS.map(({ key: action }) => [action, false]),
      ),
    ]),
  );
}

// ✅ কতগুলো module-এ অন্তত একটা action চালু আছে — Staff লিস্টে সংক্ষেপে
// দেখানোর জন্য।
export function countActiveModules(permissions) {
  if (!permissions) return 0;
  return Object.values(permissions).filter((modulePerms) =>
    Object.values(modulePerms || {}).some(Boolean),
  ).length;
}
