import express from "express";
import Order from "../../models/Order.js";
import { moveToTrash } from "../../../utils/trash/trash.helpers.js";
import { releasePromoUsage } from "../../services/promoService.js";
import {
  updateInventoryForItems,
  updateInventoryForItem,
} from "../../services/inventoryService.js";

const router = express.Router();

/**
 * ================================
 * STATUS FLOW (SINGLE SOURCE)
 * ================================
 */
const STATUS_FLOW = {
  pending: ["ready_to_delivery", "cancelled"],
  ready_to_delivery: ["send_to_courier", "cancelled"],
  send_to_courier: ["delivered"],
  delivered: [],
  cancelled: [],
};

/**
 * ================================
 * 🔒 PAYMENT VERIFICATION HOLD
 * ================================
 * Manual/mobile-banking payments (bKash/Nagad/etc.) must be verified
 * (accepted or rejected) by admin from the Payments > Pending queue
 * before the order is allowed to move forward in the status flow.
 * COD orders are exempt — cash is collected on delivery, so payment
 * is naturally settled later and shouldn't block dispatch.
 */
function needsPaymentVerification(order) {
  return (
    order?.paymentMethod &&
    order.paymentMethod !== "cod" &&
    order.paymentStatus === "pending"
  );
}

const PAYMENT_HOLD_MESSAGE =
  "এই অর্ডারের Payment এখনো verify করা হয়নি। Payments > Pending Verification থেকে আগে Accept/Reject করুন, তারপর order status পরিবর্তন করা যাবে।";

/**
 * ================================
 * GET all orders
 * ================================
 */
/**
 * ================================
 * ✅ CREATE order (ADMIN)
 * POST /admin/orders
 * ================================
 */
import Product from "../../models/Product.js"; // ✅ add (আপনার product model path ঠিক করে দিবেন)

router.post("/", async (req, res) => {
  try {
    const {
      items = [],
      deliveryCharge = 120,
      discount = 0,
      billing = {},
      promoCode = null,
      userId = null,

      paymentMethod = "cod",
      paymentStatus = "pending",
      status = "pending",

      // ✅ NEW: createdBy fields
      createdBy = "admin",
      createdByName = "Admin",
      createdById = null,

      // ✅ NEW: sale channel — "online" (delivery order) or "offline" (in-store sale)
      saleChannel = "online",
    } = req.body;

    // ✅ Validate billing — শুধু "online" sale-এ বাধ্যতামূলক, "offline" sale-এ ঐচ্ছিক
    if (
      saleChannel !== "offline" &&
      (!billing?.name?.trim() ||
        !billing?.phone?.trim() ||
        !billing?.address?.trim())
    ) {
      return res
        .status(400)
        .json({ error: "Billing name, phone & address are required" });
    }

    // ✅ Validate items basic
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least 1 item is required" });
    }

    // ✅ Resolve products from DB (safe)
    const productIds = items.map((it) => String(it.productId));
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach((p) => productMap.set(String(p._id), p));

    const finalItems = [];
    let subtotal = 0;

    for (const it of items) {
      const pid = String(it.productId || "");
      const qty = Number(it.qty || 0);
      const color = it.color ? String(it.color) : null;

      if (!pid || qty <= 0) continue;

      const p = productMap.get(pid);
      if (!p) continue;

      // ✅ color variant match
      const variant =
        color && Array.isArray(p.colors)
          ? p.colors.find(
              (c) =>
                String(c?.name || "")
                  .trim()
                  .toLowerCase() === String(color).trim().toLowerCase()
            )
          : null;

      // ✅ variant সিলেক্ট থাকলে variant এর নিজস্ব price ব্যবহার হবে
      // (customer checkout-এর buildPricedOrderItemsFromDB-এর মতোই), শুধু
      // base product price না — নাহলে ভিন্ন দামের color variant অর্ডার করলেও
      // ভুল দাম বসত
      const price = Number(variant?.price ?? p.price ?? 0);
      const name = p.name || "Product";
      const image =
        variant?.images?.[0] ||
        p.image ||
        (Array.isArray(p.images) ? p.images[0] : null) ||
        null;

      subtotal += price * qty;

      finalItems.push({
        productId: pid,
        name,
        price,
        qty,
        image,
        color: variant?.name || color || null,
        stock: variant?.stock ?? p.stock ?? 0,
      });
    }

    if (!finalItems.length) {
      return res.status(400).json({ error: "No valid items found" });
    }

    const total = Math.max(
      0,
      Number(subtotal) + Number(deliveryCharge || 0) - Number(discount || 0)
    );

    const created = await Order.create({
      items: finalItems,
      subtotal,
      deliveryCharge,
      discount,
      total,

      billing: {
        name: billing?.name?.trim() || "",
        phone: billing?.phone?.trim() || "",
        address: billing?.address?.trim() || "",
        note: billing?.note?.trim() || "",
      },

      promoCode,
      userId,
      paymentMethod,
      paymentStatus,
      status,

      // ✅ IMPORTANT: Save createdBy
      createdBy,
      createdByName,
      createdById,

      saleChannel,
    });

    /* ✅✅ STRICT INVENTORY UPDATE
       - Validates real stock and decrements stock/sold, same as
         customer checkout. If any item doesn't have enough stock,
         the order is rolled back (not silently created).
    */
    try {
      await updateInventoryForItems(finalItems, "decrease");
    } catch (stockErr) {
      console.error("❌ Stock/Sold Update Error (admin order):", stockErr);

      await Order.findByIdAndDelete(created._id);

      return res.status(400).json({
        error:
          stockErr?.message || "Stock not available / Inventory update failed",
      });
    }

    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Failed to create order:", err);

    let message = err?.message || "Order create করা যায়নি।";

    if (err?.code === 11000) {
      message =
        "এই Order Number-এ আগে থেকেই একটি অর্ডার আছে। পুরনো অর্ডারটি Delete করুন, অথবা Settings → Order Number-এ গিয়ে সঠিক Serial নাম্বার বসান — তারপর আবার Create Order করুন।";
    } else if (err?.name === "ValidationError") {
      const firstError = Object.values(err.errors || {})[0];
      message = firstError?.message
        ? `ডেটা ভ্যালিড না: ${firstError.message}`
        : "কিছু তথ্য সঠিকভাবে দেওয়া হয়নি। ফর্মটি আবার চেক করুন।";
    }

    res.status(400).json({ error: message });
  }
});


router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.saleChannel) filter.saleChannel = req.query.saleChannel;

    // ✅ SEARCH — সব পেজ মিলিয়ে (শুধু বর্তমান পেজের ২০টার মধ্যে না) খোঁজে,
    // Admin panel এর সার্চ বক্সের একই নিয়ম মেনে:
    //  - Order ID (orderNumber): exact match (নাহলে "4" দিলে 40/41/42... চলে আসত)
    //  - নাম: partial/substring match
    //  - ফোন: partial match, কমপক্ষে ৫ ডিজিট না দিলে ম্যাচ করবে না
    const rawSearch = String(req.query.search || "").trim();
    if (rawSearch) {
      const escaped = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const orConditions = [{ "billing.name": { $regex: escaped, $options: "i" } }];

      const asNumber = Number(rawSearch);
      if (Number.isFinite(asNumber)) {
        orConditions.push({ orderNumber: asNumber });
      }

      if (rawSearch.length >= 5) {
        orConditions.push({ "billing.phone": { $regex: escaped, $options: "i" } });
      }

      filter.$or = orConditions;
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 5000); // cap max page size (dashboard needs full data for accurate totals)
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: err.message,
    });
  }
});

/**
 * ================================
 * ORDER COUNTS (for tab badges — accurate totals across ALL pages,
 * not just the currently loaded page)
 * ================================
 * - total / bySaleChannel: always unfiltered (so the channel pills
 *   themselves stay accurate regardless of which one is active)
 * - filteredTotal / byStatus: scoped to ?saleChannel= if provided, so
 *   the status tabs reflect counts within the active channel filter
 */
router.get("/counts", async (req, res) => {
  try {
    const saleChannel = req.query.saleChannel || undefined;
    const channelFilter = saleChannel ? { saleChannel } : {};

    const [statusAgg, channelAgg, total, filteredTotal] = await Promise.all([
      Order.aggregate([
        { $match: channelFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: "$saleChannel", count: { $sum: 1 } } },
      ]),
      Order.countDocuments({}),
      Order.countDocuments(channelFilter),
    ]);

    const byStatus = {};
    statusAgg.forEach((row) => {
      if (row._id) byStatus[row._id] = row.count;
    });

    const bySaleChannel = { online: 0, offline: 0 };
    channelAgg.forEach((row) => {
      const key = row._id === "offline" ? "offline" : "online";
      bySaleChannel[key] += row.count;
    });

    res.json({ total, bySaleChannel, filteredTotal, byStatus });
  } catch (err) {
    console.error("❌ Failed to fetch order counts:", err);
    res.status(500).json({
      error: "Failed to fetch order counts",
      details: err.message,
    });
  }
});

/**
 * ================================
 * 🔥 BULK STATUS UPDATE (ADMIN)
 * ================================
 * body: { ids: [], status, cancelReason? }
 */
router.put("/bulk/status", async (req, res) => {
  try {
    const { ids, status, cancelReason } = req.body;

    if (!Array.isArray(ids) || !status) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const orders = await Order.find({ _id: { $in: ids } });

    const result = {
      updated: [],
      skipped: [],
      paymentHold: [],
      errors: [],
    };

    for (const o of orders) {
      try {
        if (["delivered", "cancelled"].includes(o.status)) {
          result.skipped.push(o._id);
          continue;
        }

        // 🔒 Payment not verified yet — hold, unless admin is cancelling
        if (needsPaymentVerification(o) && status !== "cancelled") {
          result.paymentHold.push(o._id);
          continue;
        }

        const allowedNext = STATUS_FLOW[o.status] || [];
        if (!allowedNext.includes(status)) {
          result.skipped.push(o._id);
          continue;
        }

        const update = { status };

        if (status === "cancelled") {
          update.cancelReason = cancelReason?.trim() || "Cancelled by admin";
        }

        const updated = await Order.findByIdAndUpdate(o._id, update, {
          new: true,
        });

        if (status === "cancelled" && o.promo?.promoId) {
          try {
            await releasePromoUsage({
              promoId: o.promo.promoId,
              orderId: o._id,
            });
          } catch (promoReleaseErr) {
            console.error(
              "❌ Failed to release promo usage on bulk cancel:",
              promoReleaseErr,
            );
          }
        }

        // ✅ Order cancelled -> restock
        if (status === "cancelled") {
          try {
            await updateInventoryForItems(o.items, "increase");
          } catch (restockErr) {
            console.error("❌ Restock Error (admin bulk cancel):", restockErr);
          }
        }

        result.updated.push(updated._id);
      } catch (e) {
        result.errors.push({ id: o._id, error: e.message });
      }
    }

    if (result.paymentHold.length && !result.updated.length) {
      return res.status(400).json({
        ...result,
        error: `${result.paymentHold.length} টি অর্ডারের Payment এখনো verify করা হয়নি। Payments > Pending Verification থেকে আগে Accept/Reject করুন।`,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Bulk status update failed:", err);
    res.status(500).json({
      error: "Bulk update failed",
      details: err.message,
    });
  }
});

/**
 * ================================
 * 🔥 BULK DELETE (ADMIN)
 * ================================
 * body: { ids: [] }
 */
router.post("/bulk/delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // ✅ hard-delete এর বদলে Trash এ move — 3 দিন পর auto-purge হবে
    const orders = await Order.find({ _id: { $in: ids } });
    for (const o of orders) {
      if (o.promo?.promoId) {
        try {
          await releasePromoUsage({
            promoId: o.promo.promoId,
            orderId: o._id,
          });
        } catch (promoReleaseErr) {
          console.error(
            "❌ Failed to release promo usage on delete:",
            promoReleaseErr,
          );
        }
      }
      await moveToTrash("Order", o);
    }

    res.json({ deletedCount: orders.length });
  } catch (err) {
    console.error("❌ Bulk delete failed:", err);
    res.status(500).json({
      error: "Bulk delete failed",
      details: err.message,
    });
  }
});

/**
 * ================================
 * GET single order
 * ================================
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({
      error: "Failed to fetch order",
      details: err.message,
    });
  }
});

/**
 * ================================
 * UPDATE order (ADMIN)
 * ================================
 */
router.put("/:id", async (req, res) => {
  try {
    const current = await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Order not found" });

    // 🔒 Locked order guard — এখানেই আগে চেক করা দরকার (নিচের items/stock
    // adjustment ব্লকের আগে), নাহলে delivered/cancelled অর্ডারে item qty
    // পাঠালে পুরো request পরে reject হলেও ততক্ষণে stock ইতিমধ্যে বদলে যেত।
    if (
      ["delivered", "cancelled"].includes(current.status) &&
      Object.keys(req.body).some((k) => k !== "status")
    ) {
      return res.status(400).json({
        error: "Delivered or cancelled order cannot be edited",
      });
    }

    const updateData = {};

    if (req.body.status !== undefined) updateData.status = req.body.status;

    if (req.body.trackingId !== undefined)
      updateData.trackingId = req.body.trackingId;

    if (req.body.paymentMethod !== undefined)
      updateData.paymentMethod = req.body.paymentMethod;

    if (
      req.body.paymentStatus !== undefined &&
      ["pending", "paid", "failed"].includes(req.body.paymentStatus)
    )
      updateData.paymentStatus = req.body.paymentStatus;

    if (req.body.cancelReason !== undefined)
      updateData.cancelReason = req.body.cancelReason;

    // ✅ ITEM QUANTITY EDIT — শুধু qty পরিবর্তনযোগ্য, item যোগ/বাদ বা
    // product/variant পরিবর্তন এই route সাপোর্ট করে না (সেটার জন্য
    // পুরনো order cancel করে নতুন order তৈরি করতে হবে)। qty বাড়লে stock
    // থেকে বাড়তি টুকু কাটা হয়, কমলে সেই টুকু restock হয় — একই
    // updateInventoryForItem যেটা create/cancel flow ব্যবহার করে।
    if (Array.isArray(req.body.items)) {
      if (req.body.items.length !== current.items.length) {
        return res.status(400).json({
          error: "Item সংখ্যা পরিবর্তন করা যাবে না — শুধু quantity এডিট করা যায়।",
        });
      }

      const invChanges = [];
      const newItems = [];

      for (let idx = 0; idx < current.items.length; idx++) {
        const curr = current.items[idx];
        const incoming = req.body.items[idx] || {};

        if (
          String(incoming.productId) !== String(curr.productId) ||
          String(incoming.color || "") !== String(curr.color || "")
        ) {
          return res.status(400).json({
            error: "Item এর product/variant পরিবর্তন করা যাবে না — শুধু quantity এডিট করা যায়।",
          });
        }

        const newQty = Math.floor(Number(incoming.qty));
        if (!Number.isFinite(newQty) || newQty < 1) {
          return res.status(400).json({ error: "Quantity কমপক্ষে ১ হতে হবে।" });
        }

        if (newQty !== curr.qty) {
          invChanges.push({
            productId: curr.productId,
            color: curr.color,
            delta: newQty - curr.qty,
          });
        }

        newItems.push({ ...curr.toObject(), qty: newQty });
      }

      // ✅ একটার stock adjust ব্যর্থ হলে আগেরগুলো revert করে দেওয়া হয়, যাতে
      // আংশিক-প্রয়োগ হওয়া অবস্থায় stock আটকে না থাকে
      const applied = [];
      for (const c of invChanges) {
        try {
          if (c.delta > 0) {
            await updateInventoryForItem(
              { productId: c.productId, qty: c.delta, color: c.color },
              "decrease",
            );
          } else {
            await updateInventoryForItem(
              { productId: c.productId, qty: -c.delta, color: c.color },
              "increase",
            );
          }
          applied.push(c);
        } catch (invErr) {
          for (const done of applied) {
            try {
              await updateInventoryForItem(
                { productId: done.productId, qty: Math.abs(done.delta), color: done.color },
                done.delta > 0 ? "increase" : "decrease",
              );
            } catch (revertErr) {
              console.error("❌ Inventory revert failed (admin order qty edit):", revertErr);
            }
          }
          return res.status(400).json({
            error: invErr?.message || "Quantity আপডেট করা যায়নি",
          });
        }
      }

      updateData.items = newItems;
      updateData.subtotal = newItems.reduce(
        (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
        0,
      );
    }

    // ✅ DELIVERY CHARGE + DISCOUNT UPDATE + TOTAL RECALC
    if (
      req.body.deliveryCharge !== undefined ||
      req.body.discount !== undefined ||
      updateData.subtotal !== undefined
    ) {
      let delivery = Number(current.deliveryCharge || 0);
      if (req.body.deliveryCharge !== undefined) {
        delivery = Number(req.body.deliveryCharge);
        if (isNaN(delivery) || delivery < 0) delivery = 0;
        updateData.deliveryCharge = delivery;
      }

      let discount = Number(
        req.body.discount !== undefined ? req.body.discount : current.discount,
      );
      if (isNaN(discount) || discount < 0) discount = 0;

      const subtotal = Number(updateData.subtotal ?? current.subtotal ?? 0);
      const maxAllowedDiscount = subtotal + delivery;
      if (discount > maxAllowedDiscount) discount = maxAllowedDiscount;

      updateData.discount = discount;
      updateData.total = subtotal + delivery - discount;
    }

    if (req.body.billing) {
      updateData.billing = {
        name: req.body.billing.name?.trim()
          ? req.body.billing.name
          : current.billing?.name,
        phone: req.body.billing.phone?.trim()
          ? req.body.billing.phone
          : current.billing?.phone,
        address: req.body.billing.address?.trim()
          ? req.body.billing.address
          : current.billing?.address,
        note: req.body.billing.note?.trim()
          ? req.body.billing.note
          : current.billing?.note,
      };
    }

    if (
      updateData.status !== undefined &&
      updateData.status !== current.status
    ) {
      // 🔒 Hold: payment not verified yet — block status advance
      // (cancelling is still allowed since it doesn't need payment to be confirmed)
      if (
        needsPaymentVerification(current) &&
        updateData.status !== "cancelled"
      ) {
        return res.status(400).json({
          error: PAYMENT_HOLD_MESSAGE,
          code: "PAYMENT_VERIFICATION_REQUIRED",
        });
      }

      const allowedNext = STATUS_FLOW[current.status] || [];
      if (!allowedNext.includes(updateData.status)) {
        return res.status(400).json({
          error: `Invalid status change: ${current.status} → ${updateData.status}`,
        });
      }
    }

    if (
      ["delivered", "cancelled"].includes(current.status) &&
      Object.keys(updateData).some((k) => k !== "status")
    ) {
      return res.status(400).json({
        error: "Delivered or cancelled order cannot be edited",
      });
    }

    if (updateData.status === "cancelled") {
      if (!updateData.cancelReason?.trim()) {
        updateData.cancelReason = "Cancelled by admin";
      }
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // ✅ Order cancelled -> free up the promo code's usage slot so
    // "Usage X/Y" on the Promo Codes page reflects only real, kept orders.
    if (
      updateData.status === "cancelled" &&
      current.status !== "cancelled" &&
      current.promo?.promoId
    ) {
      try {
        await releasePromoUsage({
          promoId: current.promo.promoId,
          orderId: current._id,
        });
      } catch (promoReleaseErr) {
        console.error(
          "❌ Failed to release promo usage on cancel:",
          promoReleaseErr,
        );
      }
    }

    // ✅ Order cancelled -> restock (mirrors the customer-side cancel flow)
    if (updateData.status === "cancelled" && current.status !== "cancelled") {
      try {
        await updateInventoryForItems(current.items, "increase");
      } catch (restockErr) {
        console.error("❌ Restock Error (admin cancel):", restockErr);
      }
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update order:", err);
    res.status(400).json({
      error: "Failed to update order",
      details: err.message,
    });
  }
});


/**
 * ================================
 * DELETE order (ADMIN)
 * ================================
 */
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // ✅ hard-delete এর বদলে Trash এ move — 3 দিন পর auto-purge হবে,
    // এর মাঝে Trash থেকে restore করা যাবে।
    await moveToTrash("Order", order);

    res.json({ message: "Order moved to Trash" });
  } catch (err) {
    console.error("❌ Failed to delete order:", err);
    res.status(500).json({
      error: "Failed to delete order",
      details: err.message,
    });
  }
});

export default router;
