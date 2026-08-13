import express from "express";
import Counter from "../../models/Counter.js";
import Order from "../../models/Order.js";
import { protect } from "../../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ✅ Multi-tenant: Order.js এর pre-save hook counter নাম `orderNumber:${shopId}`
// দিয়ে রাখে (Counter model নিজে shop-scoped না, তাই নামের মধ্যেই শপ এনকোড করা)।
// এখানেও ঠিক একই counter document refer করতে হবে, নাহলে admin panel-এ যা
// দেখানো/সেট করা হবে তা আসল checkout-flow যেই counter ব্যবহার করে তার সাথে মিলবে না।
const counterName = (req) => `orderNumber:${req.shopId}`;

// ✅ Admin Read — current counter + highest orderNumber already used
router.get("/", protect, async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: counterName(req) });
    const seq = counter?.seq ?? 0;

    const lastOrder = await Order.findOne()
      .sort({ orderNumber: -1 })
      .select("orderNumber");

    res.json({
      seq,
      nextOrderNumber: seq + 1,
      maxUsedOrderNumber: lastOrder?.orderNumber ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load order counter" });
  }
});

// ✅ Admin Update — set the number the NEXT new order will get
router.patch("/", protect, async (req, res) => {
  try {
    const { startFrom, force } = req.body;
    const start = Number(startFrom);

    if (!Number.isInteger(start) || start < 1) {
      return res
        .status(400)
        .json({ error: "startFrom অবশ্যই ১ বা তার বেশি একটি পূর্ণ সংখ্যা হতে হবে" });
    }

    if (!force) {
      const lastOrder = await Order.findOne()
        .sort({ orderNumber: -1 })
        .select("orderNumber");
      const maxUsed = lastOrder?.orderNumber ?? 0;

      if (start <= maxUsed) {
        return res.status(409).json({
          error: `#${start} নাম্বারটি আগে থেকেই একটি অর্ডারে ব্যবহৃত হয়ে গেছে (সর্বোচ্চ ব্যবহৃত অর্ডার নাম্বার: #${maxUsed})। এর চেয়ে বড় নাম্বার দিন।`,
          maxUsedOrderNumber: maxUsed,
        });
      }
    }

    const counter = await Counter.findOneAndUpdate(
      { name: counterName(req) },
      { $set: { seq: start - 1 } },
      { new: true, upsert: true },
    );

    res.json({
      seq: counter.seq,
      nextOrderNumber: counter.seq + 1,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order counter" });
  }
});

// ✅ Admin Reset — DELETE all orders (এই শপের) and reset counter to 0 (next order = 1)
router.post("/reset", protect, async (req, res) => {
  try {
    if (req.body?.confirm !== true) {
      return res
        .status(400)
        .json({ error: "confirm:true পাঠাতে হবে — এটি সব অর্ডার স্থায়ীভাবে মুছে দেয়" });
    }

    const { deletedCount } = await Order.deleteMany({});

    const counter = await Counter.findOneAndUpdate(
      { name: counterName(req) },
      { $set: { seq: 0 } },
      { new: true, upsert: true },
    );

    res.json({
      seq: counter.seq,
      nextOrderNumber: counter.seq + 1,
      deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset orders" });
  }
});

export default router;
