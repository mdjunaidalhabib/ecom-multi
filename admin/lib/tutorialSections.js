// ✅ Tutorial সেকশনের তালিকা — backend/src/constants/tutorialSections.js এর সাথে
// key মিলিয়ে রাখতে হবে (super-admin/lib/tutorialSections.js এও একই তালিকা)।
export const TUTORIAL_SECTIONS = [
  { key: "getting-started", label: "শুরু করুন", hint: "প্রথমবার ব্যবহারের গাইড" },
  { key: "products", label: "প্রোডাক্ট", hint: "প্রোডাক্ট ও ক্যাটাগরি ম্যানেজ" },
  { key: "orders", label: "অর্ডার", hint: "অর্ডার, পেমেন্ট ও প্রোমো" },
  { key: "storefront", label: "স্টোরফ্রন্ট", hint: "নেভবার, স্লাইডার, ফুটার, হোমপেজ" },
  { key: "pages", label: "পেজ ও পলিসি", hint: "About, FAQ, পলিসি পেজ" },
  { key: "delivery", label: "ডেলিভারি ও কুরিয়ার", hint: "চার্জ, কুরিয়ার সেটআপ" },
  { key: "settings", label: "সেটিংস", hint: "প্ল্যান, ইনভয়েস, মেইল ও অন্যান্য" },
  { key: "other", label: "অন্যান্য", hint: "বাকি সব গাইড" },
];

export const sectionLabel = (key) =>
  TUTORIAL_SECTIONS.find((s) => s.key === key)?.label || "অন্যান্য";

export const youtubeThumb = (videoId) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const youtubeEmbed = (videoId) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
