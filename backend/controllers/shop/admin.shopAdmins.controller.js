import Shop from "../../src/models/Shop.js";
import Admin from "../../src/models/Admin.js";

/* -------------------------------------------------------
   GET /admin/shops/:id/admins — এই শপে assigned সব admin/staff
------------------------------------------------------- */
export const listShopAdmins = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const admins = await Admin.find({
      shops: shop._id,
      role: { $ne: "superadmin" },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (err) {
    console.error("❌ listShopAdmins error:", err);
    res.status(500).json({ message: "Server error fetching shop admins" });
  }
};

/* -------------------------------------------------------
   POST /admin/shops/:id/admins — নতুন admin/staff তৈরি করে এই শপে assign
------------------------------------------------------- */
export const inviteShopAdmin = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { name, email, password, role } = req.body || {};

    if (!email?.trim()) {
      return res.status(400).json({ message: "ইমেইল আবশ্যক" });
    }

    const finalRole = role === "staff" ? "staff" : "admin";
    const normalizedEmail = email.toLowerCase().trim();
    const platformSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

    if (platformSuperAdminEmail && normalizedEmail === platformSuperAdminEmail) {
      return res.status(409).json({
        message:
          "এই ইমেইলটি Platform Super Admin-এর। Shop Admin হিসেবে ব্যবহার করা যাবে না।",
      });
    }

    const existing = await Admin.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.role === "superadmin") {
        return res.status(409).json({
          message:
            "এই ইমেইলটি Platform Super Admin-এর। Shop Admin হিসেবে ব্যবহার করা যাবে না।",
        });
      }

      // ✅ ইতিমধ্যে থাকা admin হলে — এই শপে assign করে দেওয়া (নতুন account বানাবে না)
      if (existing.shops.some((s) => String(s) === String(shop._id))) {
        return res
          .status(409)
          .json({ message: "এই admin ইতিমধ্যে এই শপে assign করা আছে" });
      }

      // ✅ একটা ইমেইল একসাথে দুইটা শপের admin/staff হতে পারবে না — প্রতিটা
      // শপের ইমেইল সেই শপের জন্যই নির্দিষ্ট থাকবে (একটা শপ থেকে unassign
      // করা হলে — shops খালি হলে — তখনই সেই ইমেইল অন্য শপে ব্যবহার করা যাবে)
      if (existing.shops.length > 0) {
        return res.status(409).json({
          message:
            "এই ইমেইলটি ইতিমধ্যে অন্য একটি শপে ব্যবহৃত হচ্ছে। একই ইমেইল দিয়ে দুইটা শপ খোলা যাবে না — আলাদা ইমেইল ব্যবহার করুন।",
        });
      }

      // ⚠️ এই email-এর Admin ডকুমেন্ট আগে অন্য কোনো শপে ছিল, পরে সরিয়ে
      // ফেলা হয়েছিল (shops = [])। এই পুরনো account-টাকে চুপচাপ reuse করা
      // হতো আগে — ফর্মে নতুন যে name/password দেওয়া হতো সেটা কখনো সেট হতো
      // না, ফলে ব্যবহারকারী নতুন পাসওয়ার্ড টাইপ করেও লগইন করতে পারতো না
      // (পুরনো পাসওয়ার্ডই থেকে যেত)। তাই এখন এই ক্ষেত্রেও নতুন
      // admin তৈরির মতোই name/password আবশ্যক এবং পুরোপুরি ওভাররাইট করা হয়।
      if (!name?.trim() || !password) {
        return res
          .status(400)
          .json({ message: "নাম এবং পাসওয়ার্ড আবশ্যক" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে" });
      }

      const currentCount = await Admin.countDocuments({
        shops: shop._id,
        role: { $ne: "superadmin" },
      });
      if (currentCount >= (shop.limits?.maxAdmins ?? 2)) {
        return res.status(403).json({
          message: `এই শপের জন্য সর্বোচ্চ ${shop.limits?.maxAdmins ?? 2} জন admin/staff assign করা যাবে। প্ল্যান আপগ্রেড করুন।`,
        });
      }

      existing.name = name.trim();
      existing.password = password; // pre-save hook নতুন করে হ্যাশ করে দেবে
      existing.role = finalRole;
      existing.shops = [shop._id];
      await existing.save();

      const { password: _pw, ...safe } = existing.toObject();
      return res.status(201).json({
        message: `✅ নতুন ${finalRole} তৈরি হয়ে এই শপে assign হলো`,
        admin: safe,
      });
    }

    if (!name?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "নতুন admin-এর জন্য নাম এবং পাসওয়ার্ড আবশ্যক" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে" });
    }

    // ✅ Shop এর maxAdmins limit চেক (soft limit)
    const currentCount = await Admin.countDocuments({
      shops: shop._id,
      role: { $ne: "superadmin" },
    });
    if (currentCount >= (shop.limits?.maxAdmins ?? 2)) {
      return res.status(403).json({
        message: `এই শপের জন্য সর্বোচ্চ ${shop.limits?.maxAdmins ?? 2} জন admin/staff assign করা যাবে। প্ল্যান আপগ্রেড করুন।`,
      });
    }

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password, // pre-save hook হ্যাশ করে দেবে
      role: finalRole,
      shops: [shop._id],
    });

    const { password: _pw, ...safeAdmin } = admin.toObject();

    res.status(201).json({
      message: `✅ নতুন ${finalRole} তৈরি হয়ে এই শপে assign হলো`,
      admin: safeAdmin,
    });
  } catch (err) {
    console.error("❌ inviteShopAdmin error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "এই ইমেইল দিয়ে ইতিমধ্যে একটা admin আছে" });
    }
    res.status(500).json({ message: "Server error inviting admin" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/shops/:id/admins/:adminId/password
   — এই শপে assigned admin/staff-এর পাসওয়ার্ড super-admin থেকে রিসেট
------------------------------------------------------- */
export const resetShopAdminPassword = async (req, res) => {
  try {
    const { id: shopId, adminId } = req.params;
    const { password } = req.body || {};

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে" });
    }

    // ✅ adminId-র সাথে শপ ম্যাচ করা হয় যাতে ভুল করে অন্য শপের admin-এর
    // পাসওয়ার্ড রিসেট না হয়ে যায়
    const admin = await Admin.findOne({ _id: adminId, shops: shopId });
    if (!admin) {
      return res.status(404).json({ message: "এই শপে এই admin পাওয়া যায়নি" });
    }

    admin.password = password; // pre-save hook হ্যাশ করে দেবে
    await admin.save();

    res.json({ message: `✅ ${admin.email}-এর পাসওয়ার্ড রিসেট করা হয়েছে` });
  } catch (err) {
    console.error("❌ resetShopAdminPassword error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/shops/:id/admins/:adminId
   — শুধু এই শপ থেকে unassign করে (admin-এর account ডিলিট হয় না,
   অন্য শপে assigned থাকলে সেখানে ঠিকই থাকবে)
------------------------------------------------------- */
export const removeShopAdmin = async (req, res) => {
  try {
    const { id: shopId, adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.role === "superadmin") {
      return res
        .status(400)
        .json({ message: "Superadmin কে কোনো শপ থেকে unassign করা যায় না" });
    }

    admin.shops = admin.shops.filter((s) => String(s) !== String(shopId));
    await admin.save();

    res.json({ message: "✅ Admin কে এই শপ থেকে সরিয়ে দেওয়া হলো" });
  } catch (err) {
    console.error("❌ removeShopAdmin error:", err);
    res.status(500).json({ message: "Server error removing shop admin" });
  }
};
