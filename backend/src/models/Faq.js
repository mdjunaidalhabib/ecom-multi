import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ FAQ (সচরাচর জিজ্ঞাসা) Page Content
 * "/faq" পেজের সব কন্টেন্ট সম্পূর্ণ Admin panel থেকে control হবে।
 * PrivacyPolicy/RefundPolicy এর মতোই এটা একটা singleton document per shop
 * (প্রতি শপের একটাই থাকবে)। sections একটা array বলে Admin ইচ্ছামতো যত খুশি
 * প্রশ্ন-উত্তর যোগ/মুছে/সাজাতে পারবে।
 */

const SectionSchema = new mongoose.Schema({
  heading: { type: String, required: true, trim: true }, // প্রশ্ন
  content: { type: String, default: "" }, // উত্তর
});

const FaqSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true, // ✅ প্রতি শপের একটাই FAQ document
    index: true,
  },

  pageTitle: { type: String, default: "সচরাচর জিজ্ঞাসা" },
  intro: {
    type: String,
    default:
      "আমাদের পণ্য, ডেলিভারি, রিটার্ন ও পেমেন্ট সংক্রান্ত সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাওয়া যাবে।",
  },

  sections: {
    type: [SectionSchema],
    default: [
      {
        heading: "অর্ডার করলে কত দিনের মধ্যে ডেলিভারি পাবো?",
        content:
          "ঢাকার মধ্যে সাধারণত ১-৩ কার্যদিবস এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন করা হয়। বিশেষ পরিস্থিতিতে সময় সামান্য বেশি লাগতে পারে।",
      },
      {
        heading: "সাইজ ঠিক না হলে কি এক্সচেঞ্জ করা যাবে?",
        content:
          "হ্যাঁ, প্রোডাক্ট হাতে পাওয়ার ৭ দিনের মধ্যে সাইজ এক্সচেঞ্জ করা যাবে। প্রোডাক্ট অব্যবহৃত, অক্ষত এবং ট্যাগসহ থাকতে হবে।",
      },
      {
        heading: "রিফান্ড কত দিনে পাবো?",
        content:
          "রিটার্নকৃত প্রোডাক্ট যাচাই করার পর ৩-৭ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করা হয়।",
      },
      {
        heading: "পেমেন্ট কীভাবে করতে হবে?",
        content:
          "Bkash, Nagad, Card, Bank Transfer এবং Cash on Delivery (COD)–সহ একাধিক পেমেন্ট অপশন উপলব্ধ আছে। চেকআউট পেজেই সব অপশন পাবেন।",
      },
    ],
  },

  updatedAt: { type: Date, default: Date.now },
});

FaqSchema.plugin(tenantPlugin);

const Faq = mongoose.models.Faq || mongoose.model("Faq", FaqSchema);

export default Faq;
