import Order from "../models/Order.js";
import { updateInventoryForItems } from "./inventoryService.js";
import { releasePromoUsage, reclaimPromoUsage } from "./promoService.js";

/**
 * ================================
 * ✅ ORDER STATUS SERVICE (SINGLE SOURCE)
 * ================================
 * অর্ডারের status যেখান থেকেই বদলাক (admin dropdown, bulk, customer cancel,
 * payment reject/accept, courier send/sync, undo/reopen, return) — সব এই
 * ফাইলের ভেতর দিয়ে যায়, যাতে প্রতিবার একই নিয়মে:
 *  1. stock কাটা/ফেরত হয় (+ stock ledger এন্ট্রি)
 *  2. promo usage ছাড়া/আবার গোনা হয়
 *  3. statusHistory-তে কে/কখন/কেন লেখা থাকে
 *  4. একসাথে দুইজন বদলালে (race) একটাই সফল হয় — conditional update
 *
 * মূল নিয়ম: final অর্ডার "edit" হয় না, "reverse" হয় — আগের রেকর্ড মোছা হয়
 * না, উল্টো এন্ট্রি পড়ে।
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

// ✅ সাধারণ সামনের দিকের flow (dropdown / bulk / courier / payment)।
// delivered → returned এই flow-তে নেই — সেটা returnOrder() দিয়ে হয়
// (কারণ + refund লাগে)। পেছনে যাওয়া শুধু revertOrderStatus() দিয়ে।
export const STATUS_FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  returned: [],
};

export const LOCKED_STATUSES = ["delivered", "cancelled", "returned"];

// ✅ এই status-গুলোতে অর্ডারের item-এর stock অর্ডারে আটকে নেই (ফেরত গেছে)
export const STOCK_RELEASED_STATUSES = ["cancelled", "returned"];

// ✅ Staff নিজের করা পরিবর্তন এই সময়ের মধ্যে নিজেই Undo করতে পারবে।
// এর পরে শুধু শপ owner (role: admin/superadmin) কারণ লিখে Reopen/Revert করতে পারবে।
export const UNDO_WINDOW_MS = 10 * 60 * 1000;

// ✅ পুরনো অর্ডার (statusHistory চালুর আগের) — history না থাকলে আগের status অনুমান
const FALLBACK_PREVIOUS_STATUS = {
  confirmed: "pending",
  shipped: "confirmed",
  delivered: "shipped",
  cancelled: "pending",
  returned: "delivered",
};

export class OrderStatusError extends Error {
  constructor(message, statusCode = 400, code = "ORDER_STATUS_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const actorFromAdmin = (admin) => ({
  type: admin?.role || "admin",
  id: admin?._id ? String(admin._id) : null,
  name: admin?.name || "Admin",
});

// ✅ শপ owner বা superadmin — staff না
export const isOwnerAdmin = (admin) => Boolean(admin) && admin.role !== "staff";

export const buildHistoryEntry = ({ from, to, action, reason, actor }) => ({
  from: from ?? null,
  to,
  action: action || "status_change",
  reason: String(reason || "").trim(),
  byType: actor?.type || "system",
  byId: actor?.id ? String(actor.id) : null,
  byName: actor?.name || null,
  at: new Date(),
});

// ✅ Locked (Delivered/Cancelled/Returned) অর্ডারে owner/admin এডিট করলে
// History-তে "edit" এন্ট্রি পড়ে — status বদলায় না, তাই from = to।
export const buildEditHistoryEntry = ({ status, summary, actor }) =>
  buildHistoryEntry({
    from: status,
    to: status,
    action: "edit",
    reason: summary,
    actor,
  });

export function assertTransitionAllowed(from, to) {
  if (from === to) return;
  if (!ORDER_STATUSES.includes(to)) {
    throw new OrderStatusError(`Invalid status: ${to}`);
  }
  if (!(STATUS_FLOW[from] || []).includes(to)) {
    throw new OrderStatusError(`Invalid status change: ${from} → ${to}`);
  }
}

const releaseReasonFor = (status) =>
  status === "returned" ? "return" : "cancel";

/**
 * ✅ আসল transition — side effect সহ।
 * ক্রম গুরুত্বপূর্ণ:
 *  - stock আবার কাটতে হলে (reopen) সেটা আগে, কারণ stock না থাকলে পুরো
 *    কাজটাই বাতিল হওয়া উচিত (status বদলানোর আগেই)
 *  - তারপর conditional status update ({ _id, status: from }) — মাঝে অন্য
 *    কেউ বদলে ফেললে null আসে, তখন কাটা stock ফেরত দিয়ে 409
 *  - stock ফেরত (cancel/return) আর promo — status বদলের পরে
 */
async function transition(order, to, { action, reason, actor, extraSet = {} }) {
  const from = order.status;
  const wasReleased = STOCK_RELEASED_STATUSES.includes(from);
  const willRelease = STOCK_RELEASED_STATUSES.includes(to);
  const ledgerBase = { order, actor, note: String(reason || "").trim() };
  const warnings = [];

  if (wasReleased && !willRelease) {
    try {
      await updateInventoryForItems(order.items, "decrease", {
        ...ledgerBase,
        reason: "reopen",
      });
    } catch (err) {
      throw new OrderStatusError(
        `পর্যাপ্ত stock নেই, তাই অর্ডারটি আবার চালু করা যাচ্ছে না — ${err.message}`,
        409,
        "STOCK_NOT_AVAILABLE",
      );
    }
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: from },
    {
      $set: { status: to, ...extraSet },
      $push: {
        statusHistory: buildHistoryEntry({ from, to, action, reason, actor }),
      },
    },
    { new: true, runValidators: true },
  );

  if (!updated) {
    if (wasReleased && !willRelease) {
      await updateInventoryForItems(order.items, "increase", {
        ...ledgerBase,
        reason: releaseReasonFor(from),
        note: "Rollback — status update ব্যর্থ",
      }).catch((err) =>
        console.error("❌ Reopen stock rollback failed:", err),
      );
    }
    throw new OrderStatusError(
      "অর্ডারটি এইমাত্র অন্য কেউ পরিবর্তন করেছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।",
      409,
      "ORDER_CHANGED",
    );
  }

  if (!wasReleased && willRelease) {
    try {
      await updateInventoryForItems(order.items, "increase", {
        ...ledgerBase,
        reason: releaseReasonFor(to),
      });
    } catch (err) {
      console.error("❌ Restock failed:", err);
      warnings.push(
        "কিছু item-এর stock ফেরত দেওয়া যায়নি (product হয়তো delete হয়ে গেছে)।",
      );
    }
  }

  const promoId = order.promo?.promoId;
  if (promoId && to === "cancelled" && from !== "cancelled") {
    try {
      await releasePromoUsage({ promoId, orderId: order._id });
    } catch (err) {
      console.error("❌ Failed to release promo usage:", err);
    }
  }
  if (promoId && from === "cancelled" && to !== "cancelled") {
    try {
      const { overLimit } = await reclaimPromoUsage({ order });
      if (overLimit) {
        warnings.push(
          `Promo code "${order.promo.code}" এর usage limit পার হয়ে গেছে (এই অর্ডারটা আগেই ওই discount নিয়ে তৈরি হয়েছিল)।`,
        );
      }
    } catch (err) {
      console.error("❌ Failed to reclaim promo usage:", err);
    }
  }

  return { order: updated, warnings };
}

const loadOrder = async (orderOrId) => {
  const order =
    orderOrId && typeof orderOrId === "object" && orderOrId.status
      ? orderOrId
      : await Order.findById(orderOrId);
  if (!order) throw new OrderStatusError("Order not found", 404, "NOT_FOUND");
  return order;
};

/**
 * ✅ সাধারণ status পরিবর্তন (সামনের দিকে)।
 * options:
 *  - actor: { type, id, name }
 *  - reason: cancel হলে cancelReason হিসেবেও বসে
 *  - extraSet: একই atomic update-এ আর যা $set করতে হবে (যেমন courier info)
 */
export async function changeOrderStatus(
  orderOrId,
  to,
  { actor, reason = "", extraSet = {} } = {},
) {
  const order = await loadOrder(orderOrId);

  if (order.status === to) return { order, warnings: [], unchanged: true };

  assertTransitionAllowed(order.status, to);

  const set = { ...extraSet };
  if (to === "cancelled") {
    set.cancelReason =
      String(reason || "").trim() || set.cancelReason || "Cancelled";
  }

  return transition(order, to, {
    action: "status_change",
    reason,
    actor,
    extraSet: set,
  });
}

/**
 * ✅ অর্ডার কোন status থেকে বর্তমান status-এ এসেছিল (Undo/Reopen এর target)।
 *
 * History-কে stack হিসেবে পড়া হয়: সাধারণ পরিবর্তন push, "revert" pop
 * (কারণ revert আগের ধাপটাকেই বাতিল করে)। তাই পরপর দুইবার Undo করলে দুই ধাপ
 * পেছনে যায় — Undo-কে আবার উল্টে দেয় না।
 * উদাহরণ: shipped → delivered → returned → (Undo) delivered → (Undo) shipped
 *
 * `lastEntry` = সর্বশেষ এন্ট্রি (Undo/Reopen নিজেও) — staff-এর ১০ মিনিটের
 * Undo window আর "নিজের পরিবর্তন কিনা" এটা দিয়েই যাচাই হয়।
 */
export function getRevertTarget(order) {
  // ✅ "edit" এন্ট্রি status বদলায় না — Undo/Reopen-এর target ও staff-এর
  // Undo window হিসাবে ধরা হয় না, তাই এখানে বাদ দেওয়া হলো।
  const history = (
    Array.isArray(order?.statusHistory) ? order.statusHistory : []
  ).filter((e) => e?.action !== "edit");
  const lastEntry = history.length ? history[history.length - 1] : null;

  const stack = [];
  for (const entry of history) {
    if (entry?.action === "revert") stack.pop();
    else stack.push(entry);
  }
  const top = stack[stack.length - 1];

  if (top && top.to === order?.status) {
    return { target: top.from || null, lastEntry };
  }

  // History নেই, বা পুরনো কোড history ছাড়া status বদলেছিল — অনুমান।
  // কে বদলেছিল জানা নেই, তাই lastEntry null (শুধু owner revert করতে পারবে)।
  return {
    target: FALLBACK_PREVIOUS_STATUS[order?.status] || null,
    lastEntry: null,
  };
}

/**
 * ✅ এই admin এখন এই অর্ডারের শেষ পরিবর্তন উল্টাতে পারবে কিনা।
 * Owner: যেকোনো সময়। Staff: শুধু নিজের করা পরিবর্তন, UNDO_WINDOW_MS এর মধ্যে।
 */
export function canRevert(order, admin) {
  const { target, lastEntry } = getRevertTarget(order);
  if (!target) return { allowed: false, target: null, lastEntry };
  if (isOwnerAdmin(admin)) return { allowed: true, target, lastEntry };

  const withinWindow =
    lastEntry?.at &&
    Date.now() - new Date(lastEntry.at).getTime() <= UNDO_WINDOW_MS;
  const ownChange =
    lastEntry?.byId && admin?._id && String(lastEntry.byId) === String(admin._id);

  return { allowed: Boolean(withinWindow && ownChange), target, lastEntry };
}

/**
 * ✅ UNDO / REOPEN / REVERT — অর্ডারকে আগের status-এ ফেরত নেওয়া।
 * stock, promo সব আপনা-আপনি উল্টে যায়; কারণ বাধ্যতামূলক, history-তে থাকে।
 */
export async function revertOrderStatus(orderId, { admin, reason }) {
  const cleanReason = String(reason || "").trim();
  if (!cleanReason) {
    throw new OrderStatusError("কেন ফেরত নিচ্ছেন তার কারণ লিখুন।", 400, "REASON_REQUIRED");
  }

  const order = await loadOrder(orderId);
  const { allowed, target, lastEntry } = canRevert(order, admin);

  if (!target) {
    throw new OrderStatusError(
      lastEntry
        ? "অর্ডারটি এই status দিয়েই তৈরি হয়েছিল, ফেরত নেওয়ার মতো আগের কোনো status নেই।"
        : "এই অর্ডারের আগের কোনো status নেই।",
      400,
      "NO_PREVIOUS_STATUS",
    );
  }

  if (!allowed) {
    throw new OrderStatusError(
      `শুধু নিজের করা পরিবর্তন ${UNDO_WINDOW_MS / 60000} মিনিটের মধ্যে Undo করা যায়। এর পরে শপ Admin (owner) Reopen করতে পারবেন।`,
      403,
      "REVERT_NOT_ALLOWED",
    );
  }

  // 🚚 কুরিয়ারে পাঠানো অর্ডার confirmed-এ ফেরালে কুরিয়ারের সাথে গরমিল হবে
  if (order.status === "shipped" && order.courier?.consignmentId) {
    throw new OrderStatusError(
      "অর্ডারটি কুরিয়ারে পাঠানো হয়ে গেছে, তাই Confirmed-এ ফেরত নেওয়া যাবে না। কুরিয়ার থেকে ফেরত এলে অর্ডারটি Cancel করুন।",
      400,
      "COURIER_ALREADY_SENT",
    );
  }

  // 💳 Payment reject হয়ে cancel হওয়া অর্ডার আবার চালু করা যাবে না
  if (order.status === "cancelled" && order.paymentStatus === "failed") {
    throw new OrderStatusError(
      "এই অর্ডারের Payment reject হয়েছিল বলে cancel হয়েছে — আবার চালু করা যাবে না। প্রয়োজনে নতুন অর্ডার তৈরি করুন।",
      400,
      "PAYMENT_REJECTED",
    );
  }

  const extraSet = {};
  if (order.status === "cancelled") extraSet.cancelReason = null;
  if (target === "cancelled") extraSet.cancelReason = cleanReason;
  if (order.status === "returned") {
    extraSet.returnInfo = {
      reason: null,
      refundAmount: null,
      returnedAt: null,
      returnedByName: null,
    };
  }

  return transition(order, target, {
    action: "revert",
    reason: cleanReason,
    actor: actorFromAdmin(admin),
    extraSet,
  });
}

/**
 * ✅ RETURN — delivered অর্ডারের পণ্য ফেরত এসেছে।
 * stock ফেরত যায়, refund রেকর্ড হয়; delivered থাকার ইতিহাস history-তে থেকে যায়।
 */
export async function returnOrder(orderId, { admin, reason, refundAmount }) {
  const cleanReason = String(reason || "").trim();
  if (!cleanReason) {
    throw new OrderStatusError("Return এর কারণ লিখুন।", 400, "REASON_REQUIRED");
  }

  const order = await loadOrder(orderId);
  if (order.status !== "delivered") {
    throw new OrderStatusError(
      "শুধু Delivered অর্ডার Return করা যায়।",
      400,
      "NOT_DELIVERED",
    );
  }

  const total = Number(order.total || 0);
  let refund =
    refundAmount === undefined || refundAmount === null || refundAmount === ""
      ? total
      : Number(refundAmount);
  if (!Number.isFinite(refund) || refund < 0) refund = 0;
  if (refund > total) refund = total;

  const actor = actorFromAdmin(admin);

  return transition(order, "returned", {
    action: "return",
    reason: cleanReason,
    actor,
    extraSet: {
      returnInfo: {
        reason: cleanReason,
        refundAmount: refund,
        returnedAt: new Date(),
        returnedByName: actor.name,
      },
    },
  });
}

/**
 * ✅ Route-এ OrderStatusError কে HTTP response-এ রূপান্তর
 */
export function sendOrderStatusError(res, err, fallback = "Status update failed") {
  if (err instanceof OrderStatusError) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, code: err.code });
  }
  console.error("❌", fallback, err);
  return res.status(500).json({ error: fallback, details: err?.message });
}
