import express from "express";
import User from "../../models/User.js";
import { resolveAuthedCustomer } from "../../auth/resolveAuthedCustomer.js";

const router = express.Router();

/**
 * PUT /users/update
 * body: { name, phone, address, city, country, avatar }
 *
 * ✅ কোন user আপডেট হবে সেটা body.userId থেকে না, verified JWT থেকে বের করা
 * হয় — নাহলে যে কেউ (এমনকি লগইন ছাড়াই) body-তে ইচ্ছেমতো userId (ছোট
 * sequential integer, সহজে অনুমানযোগ্য) বসিয়ে অন্য কাস্টমারের নাম/ফোন/
 * ঠিকানা/avatar পাল্টে দিতে পারত।
 */
router.put("/update", async (req, res) => {
  try {
    const authedCustomer = await resolveAuthedCustomer(req);
    if (!authedCustomer) {
      return res.status(401).json({ message: "লগইন প্রয়োজন।" });
    }

    const { name, phone, address, city, country, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findOneAndUpdate(
      { _id: authedCustomer._id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ User update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
