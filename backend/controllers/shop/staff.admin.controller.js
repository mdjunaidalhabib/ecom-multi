import Shop from "../../src/models/Shop.js";
import Admin from "../../src/models/Admin.js";
import { sanitizePermissions } from "../../src/constants/staffPermissions.js";

/* -------------------------------------------------------
   GET /admin/staff — এই শপে assigned staff-দের তালিকা
   (শুধু role: "staff" — শপ owner নিজে এই তালিকায় থাকবে না)
------------------------------------------------------- */
export const listStaff = async (req, res) => {
  try {
    const staff = await Admin.find({
      shops: req.shopId,
      role: "staff",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (err) {
    console.error("❌ listStaff error:", err);
    res.status(500).json({ message: "Server error fetching staff" });
  }
};

/* -------------------------------------------------------
   POST /admin/staff — নতুন staff তৈরি করে এই শপে assign
   (ইমেইল আগে থেকে থাকলে ও কোনো শপে assigned না থাকলে — সেই
   অ্যাকাউন্টকে staff হিসেবে এই শপে assign করে দেয়, নতুন তৈরি করে না)
------------------------------------------------------- */
export const inviteStaff = async (req, res) => {
  try {
    const shop = await Shop.findById(req.shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { name, email, password, permissions } = req.body || {};
    const grantedPermissions = sanitizePermissions(permissions);

    if (!email?.trim()) {
      return res.status(400).json({ message: "ইমেইল আবশ্যক" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const platformSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

    if (platformSuperAdminEmail && normalizedEmail === platformSuperAdminEmail) {
      return res.status(409).json({
        message:
          "এই ইমেইলটি Platform Super Admin-এর। Staff হিসেবে ব্যবহার করা যাবে না।",
      });
    }

    const existing = await Admin.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.role === "superadmin") {
        return res.status(409).json({
          message:
            "এই ইমেইলটি Platform Super Admin-এর। Staff হিসেবে ব্যবহার করা যাবে না।",
        });
      }

      if (existing.shops.some((s) => String(s) === String(shop._id))) {
        return res
          .status(409)
          .json({ message: "এই ইমেইলটি ইতিমধ্যে এই শপে assign করা আছে" });
      }

      // ✅ একটা ইমেইল একসাথে দুইটা শপের admin/staff হতে পারবে না
      if (existing.shops.length > 0) {
        return res.status(409).json({
          message:
            "এই ইমেইলটি ইতিমধ্যে অন্য একটি শপে ব্যবহৃত হচ্ছে। আলাদা ইমেইল ব্যবহার করুন।",
        });
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

      existing.role = "staff";
      existing.permissions = grantedPermissions;
      existing.shops.push(shop._id);
      await existing.save();

      const { password: _pw, ...safe } = existing.toObject();
      return res.status(200).json({
        message: `✅ ${existing.email} কে staff হিসেবে assign করা হলো`,
        staff: safe,
      });
    }

    if (!name?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "নতুন staff-এর জন্য নাম এবং পাসওয়ার্ড আবশ্যক" });
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

    const staff = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password, // pre-save hook হ্যাশ করে দেবে
      role: "staff",
      shops: [shop._id],
      permissions: grantedPermissions,
    });

    const { password: _pw, ...safeStaff } = staff.toObject();

    res.status(201).json({
      message: "✅ নতুন staff তৈরি হয়ে এই শপে assign হলো",
      staff: safeStaff,
    });
  } catch (err) {
    console.error("❌ inviteStaff error:", err);
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "এই ইমেইল দিয়ে ইতিমধ্যে একটা অ্যাকাউন্ট আছে" });
    }
    res.status(500).json({ message: "Server error inviting staff" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/staff/:staffId/status — active/suspended টগল
------------------------------------------------------- */
export const updateStaffStatus = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { status } = req.body || {};

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "অকার্যকর status" });
    }

    const staff = await Admin.findOne({
      _id: staffId,
      shops: req.shopId,
      role: "staff",
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.status = status;
    await staff.save();

    const { password: _pw, ...safe } = staff.toObject();
    res.json({ message: "✅ Staff status আপডেট হয়েছে", staff: safe });
  } catch (err) {
    console.error("❌ updateStaffStatus error:", err);
    res.status(500).json({ message: "Server error updating staff status" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/staff/:staffId/permissions — কোন কোন সেকশনে (orders,
   products, ...) এই staff অ্যাক্সেস পাবে সেটা owner সেট করে দেয়
------------------------------------------------------- */
export const updateStaffPermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    const grantedPermissions = sanitizePermissions(req.body?.permissions);

    const staff = await Admin.findOne({
      _id: staffId,
      shops: req.shopId,
      role: "staff",
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.permissions = grantedPermissions;
    await staff.save();

    const { password: _pw, ...safe } = staff.toObject();
    res.json({ message: "✅ Staff-এর অ্যাক্সেস আপডেট হয়েছে", staff: safe });
  } catch (err) {
    console.error("❌ updateStaffPermissions error:", err);
    res.status(500).json({ message: "Server error updating staff permissions" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/staff/:staffId
   — শুধু এই শপ থেকে unassign করে (অ্যাকাউন্ট ডিলিট হয় না)
------------------------------------------------------- */
export const removeStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Admin.findOne({
      _id: staffId,
      shops: req.shopId,
      role: "staff",
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.shops = staff.shops.filter((s) => String(s) !== String(req.shopId));
    await staff.save();

    res.json({ message: "✅ Staff কে এই শপ থেকে সরিয়ে দেওয়া হলো" });
  } catch (err) {
    console.error("❌ removeStaff error:", err);
    res.status(500).json({ message: "Server error removing staff" });
  }
};
