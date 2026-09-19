import mongoose from "mongoose";
import { TUTORIAL_SECTIONS } from "../constants/tutorialSections.js";

/**
 * ✅ Tutorial — প্ল্যাটফর্ম-ওয়াইড ভিডিও গাইড (শপ-নির্দিষ্ট নয়, তাই
 * tenantPlugin নেই)। শুধু super-admin YouTube লিংক যোগ/এডিট/মুছতে পারে;
 * সব শপের admin/staff শুধু published গুলো দেখতে পারে।
 */
const tutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 600 },
    section: { type: String, enum: TUTORIAL_SECTIONS, default: "other" },
    youtubeUrl: { type: String, required: true, trim: true },
    // youtubeUrl থেকে সার্ভারে বের করা ১১-অক্ষরের আইডি — embed/thumbnail এটা দিয়েই
    videoId: { type: String, required: true },
    // পজিশন (১, ২, ৩…) — controller নিজে ম্যানেজ করে (যোগ/সরানো/ডিলিটে বাকিদের
    // অটো অ্যাডজাস্ট), সরাসরি সেট করা হয় না
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

tutorialSchema.index({ sortOrder: 1, createdAt: 1 });

export default mongoose.models.Tutorial || mongoose.model("Tutorial", tutorialSchema);
