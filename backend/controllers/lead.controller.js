import mongoose from "mongoose";
import Lead, { LEAD_PLANS, LEAD_STATUSES } from "../src/models/Lead.js";
import LeadRateLimit from "../src/models/LeadRateLimit.js";
import { createFormToken, validFormToken, validateLead, leadRateKey } from "../src/services/leadValidation.js";

export const formToken = (req, res) => res.set("Cache-Control", "no-store").json({ token: createFormToken() });
export async function leadSubmissionLimit(req, res, next) {
  try {
    const windowMs = 15 * 60 * 1000;
    const bucket = Math.floor(Date.now() / windowMs);
    const expiresAt = new Date((bucket + 1) * windowMs);
    const key = leadRateKey(req.ip || req.socket.remoteAddress || "unknown", bucket);
    let limit;
    try {
      limit = await LeadRateLimit.findOneAndUpdate({ _id: key }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true, new: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
      limit = await LeadRateLimit.findOneAndUpdate({ _id: key }, { $inc: { count: 1 } }, { new: true });
    }
    if (!limit || limit.count > 5) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))));
      return res.status(429).json({ message: "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পরে আবার চেষ্টা করুন।" });
    }
    next();
  } catch { res.status(503).json({ message: "এখন অনুরোধ নেওয়া যাচ্ছে না। পরে চেষ্টা করুন।" }); }
}
const sameSubmission = (lead, input) => ["name", "phone", "businessStatus", "interestedPlan", "message"].every(key => lead[key] === input[key]);
export async function submitLead(req, res) {
  res.set("Cache-Control", "no-store");
  if (!req.is("application/json")) return res.status(415).json({ message: "JSON তথ্য পাঠান।" });
  let input;
  try {
    if (req.body?.website || !validFormToken(req.body?.formToken)) throw new Error("পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
    input = validateLead(req.body);
  } catch (error) { return res.status(400).json({ message: error.message }); }
  try {
    const existing = await Lead.findOne({ eventId: input.eventId });
    if (existing) {
      if (!sameSubmission(existing, input)) return res.status(409).json({ message: "নতুন অনুরোধের জন্য পেজ রিফ্রেশ করুন।" });
      return res.json({ success: true, eventId: existing.eventId });
    }
    await Lead.create(input);
    return res.status(201).json({ success: true, eventId: input.eventId });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const existing = await Lead.findOne({ eventId: input.eventId });
        if (existing && sameSubmission(existing, input)) return res.json({ success: true, eventId: existing.eventId });
      } catch { /* Return generic failure without exposing stored data. */ }
    }
    return res.status(503).json({ message: "তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" });
  }
}
export async function summarizeLeads(req, res) {
  res.set("Cache-Control", "no-store");
  try {
    const groups = await Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byStatus = Object.fromEntries(LEAD_STATUSES.map(status => [status, 0]));
    let total = 0;
    for (const group of groups) {
      total += group.count;
      if (LEAD_STATUSES.includes(group._id)) byStatus[group._id] = group.count;
    }
    res.json({ total, byStatus });
  } catch { res.status(500).json({ message: "Lead summary could not be loaded" }); }
}
export async function listLeads(req, res) {
  res.set("Cache-Control", "no-store");
  const { status, plan, businessStatus, search = "", page = "1" } = req.query;
  if (typeof search !== "string" || search.length > 100 || typeof page !== "string" || !/^[1-9]\d{0,5}$/.test(page) ||
      (status !== undefined && !LEAD_STATUSES.includes(status)) || (plan !== undefined && !LEAD_PLANS.includes(plan)) ||
      (businessStatus !== undefined && !["New Business", "Existing Business"].includes(businessStatus))) {
    return res.status(400).json({ message: "Invalid filters" });
  }
  const filter = {};
  if (status) filter.status = status;
  if (plan) filter.interestedPlan = plan;
  if (businessStatus) filter.businessStatus = businessStatus;
  if (search.trim()) {
    const value = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ name: { $regex: value, $options: "i" } }, { phone: { $regex: value } }];
  }
  try {
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1, _id: -1 }).skip((Number(page) - 1) * 20).limit(20).lean(),
      Lead.countDocuments(filter),
    ]);
    res.json({ leads, total, page: Number(page), pages: Math.max(1, Math.ceil(total / 20)) });
  } catch { res.status(500).json({ message: "Leads could not be loaded" }); }
}
export async function updateLead(req, res) {
  res.set("Cache-Control", "no-store");
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ message: "Invalid lead ID" });
  const { status, note } = req.body || {};
  if ((status !== undefined && !LEAD_STATUSES.includes(status)) || (note !== undefined && (typeof note !== "string" || !note.trim() || note.length > 2000)) || (status === undefined && note === undefined)) return res.status(400).json({ message: "Valid status or note required (maximum 2000 characters)" });
  const update = {};
  if (status !== undefined) update.$set = { status };
  if (note !== undefined) update.$push = { notes: { text: note.trim(), author: req.admin._id, createdAt: new Date() } };
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ lead });
  } catch { res.status(500).json({ message: "Lead could not be updated" }); }
}
