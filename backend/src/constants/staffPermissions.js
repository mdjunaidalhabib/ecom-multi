// ✅ Shop admin panel-এ দৃশ্যমান মূল সেকশনগুলোর সাথে মিল রেখে বানানো staff
// permission module keys। admin/components/menuConfig.jsx এর `permission`
// ফিল্ড এবং admin/lib/staffPermissions.js এর তালিকার সাথে সিঙ্কে রাখতে হবে।
export const STAFF_PERMISSION_MODULES = [
  "orders",
  "products",
  "categories",
  "users",
  "sliders",
  "promos",
  "landingPages",
  "analytics",
  "payments",
  "plan",
  "trash",
  "settings",
  "invoiceDesign",
];

// ✅ প্রতিটা module-এ ঠিক কোন কাজগুলো আলাদাভাবে অন/অফ করা যায়। HTTP
// method থেকে action স্বয়ংক্রিয়ভাবে বের করা হয় (দেখুন METHOD_TO_ACTION) —
// তাই প্রতিটা admin route ফাইল আলাদাভাবে না ছুঁয়েই action-level গেটিং হয়।
export const STAFF_PERMISSION_ACTIONS = ["view", "add", "edit", "delete"];

export const METHOD_TO_ACTION = {
  GET: "view",
  HEAD: "view",
  POST: "add",
  PUT: "edit",
  PATCH: "edit",
  DELETE: "delete",
};

export function emptyPermissions() {
  return Object.fromEntries(
    STAFF_PERMISSION_MODULES.map((moduleKey) => [
      moduleKey,
      Object.fromEntries(STAFF_PERMISSION_ACTIONS.map((action) => [action, false])),
    ]),
  );
}

// ✅ ক্লায়েন্ট থেকে আসা permissions object কে trusted শেপে normalize করে —
// অচেনা module/action key বাদ, বাকি সব boolean এ coerce করা হয়।
export function sanitizePermissions(input) {
  const result = emptyPermissions();
  if (!input || typeof input !== "object") return result;

  for (const moduleKey of STAFF_PERMISSION_MODULES) {
    const modulePerms = input[moduleKey];
    if (!modulePerms || typeof modulePerms !== "object") continue;

    for (const action of STAFF_PERMISSION_ACTIONS) {
      result[moduleKey][action] = !!modulePerms[action];
    }
  }

  return result;
}

export default STAFF_PERMISSION_MODULES;
