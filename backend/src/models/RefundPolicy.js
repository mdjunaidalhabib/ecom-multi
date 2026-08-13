import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ Refund Policy Page Content
 * "/refund-policy" পেজের সব কন্টেন্ট সম্পূর্ণ Admin panel থেকে control হবে।
 * PrivacyPolicy এর মতোই এটা একটা singleton document per shop (প্রতি শপের
 * একটাই থাকবে)। sections একটা array বলে Admin ইচ্ছামতো যত খুশি সেকশন
 * যোগ/মুছে/সাজাতে পারবে — তাই কন্টেন্ট পুরোপুরি ফ্লেক্সিবল, কোনো ফিক্সড স্ট্রাকচার নেই।
 */

const SectionSchema = new mongoose.Schema({
  heading: { type: String, required: true, trim: true },
  points: { type: [String], default: [] }, // একাধিক বুলেট পয়েন্ট
});

const RefundPolicySchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true, // ✅ প্রতি শপের একটাই Refund Policy document
    index: true,
  },

  pageTitle: { type: String, default: "রিটার্ন ও রিফান্ড পলিসি" },
  intro: {
    type: String,
    default:
      "আমরা সবসময় গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দিই। এই পেজে আমরা ব্যাখ্যা করেছি কীভাবে রিটার্ন, এক্সচেঞ্জ ও রিফান্ড প্রক্রিয়া কাজ করে।",
  },
  effectiveDate: { type: String, default: "" }, // e.g. "০১ আগস্ট, ২০২৬"

  sections: {
    type: [SectionSchema],
    default: [
      {
        heading: "রিটার্নের শর্তাবলী",
        points: [
          "প্রোডাক্ট হাতে পাওয়ার ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জ করা যাবে।",
          "প্রোডাক্ট অবশ্যই অব্যবহৃত, অক্ষত এবং আসল প্যাকেজিং ও ট্যাগসহ থাকতে হবে।",
          "ভুল প্রোডাক্ট, ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ প্রোডাক্ট হলে তাৎক্ষণিকভাবে রিটার্ন/রিপ্লেসমেন্ট গ্রহণযোগ্য।",
        ],
      },
      {
        heading: "যেসব ক্ষেত্রে রিটার্ন প্রযোজ্য নয়",
        points: [
          "প্রোডাক্ট ব্যবহার করা হলে বা গ্রাহকের কারণে ক্ষতিগ্রস্ত হলে।",
          "ট্যাগ, লেবেল বা আসল প্যাকেজিং না থাকলে।",
          "“ফাইনাল সেল” বা বিশেষ ছাড়ে বিক্রিত প্রোডাক্ট (যদি আলাদাভাবে উল্লেখ থাকে)।",
        ],
      },
      {
        heading: "রিটার্ন প্রক্রিয়া",
        points: [
          "ডেলিভারির পর নির্দিষ্ট সময়সীমার মধ্যে আমাদের ওয়েবসাইট, অফিশিয়াল ইনবক্স অথবা কাস্টমার কেয়ার নম্বরে রিটার্ন রিকোয়েস্ট জানাতে হবে।",
          "অনুমোদনের পর আমাদের কুরিয়ার পার্টনার প্রোডাক্ট সংগ্রহ করবে।",
        ],
      },
      {
        heading: "রিফান্ড ও রিপ্লেসমেন্ট সুবিধা",
        points: [
          "অনলাইন পেমেন্ট করলে সেই একই মাধ্যমেই রিফান্ড দেওয়া হবে।",
          "ক্যাশ অন ডেলিভারিতে পেমেন্ট করলে অনুমোদিত পেমেন্ট সিস্টেমের (Bkash/Nagad/Bank) মাধ্যমে রিফান্ড দেওয়া হবে।",
          "চাইলে নতুন প্রোডাক্ট বিনামূল্যে রিপ্লেসমেন্ট হিসেবেও পাঠানো হবে।",
        ],
      },
      {
        heading: "যোগাযোগ করুন",
        points: [
          "এই রিফান্ড পলিসি সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।",
        ],
      },
    ],
  },

  updatedAt: { type: Date, default: Date.now },
});

RefundPolicySchema.plugin(tenantPlugin);

const RefundPolicy =
  mongoose.models.RefundPolicy ||
  mongoose.model("RefundPolicy", RefundPolicySchema);

export default RefundPolicy;
