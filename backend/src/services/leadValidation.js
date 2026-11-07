import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { LEAD_PLANS } from "../models/Lead.js";

const text = (v, max, required = false) => {
  if (typeof v !== "string" || v.length > max) throw new Error("সঠিক তথ্য দিন।");
  const result = v.trim();
  if (required && !result) throw new Error("প্রয়োজনীয় তথ্য পূরণ করুন।");
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/u.test(result)) throw new Error("সাধারণ টেক্সট ব্যবহার করুন।");
  return result;
};
export function normalizeLeadPhone(value) {
  const phone = text(value, 30, true).replace(/[০-৯]/g, d => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[\s()-]/g, "");
  const local = phone.replace(/^(?:\+?88)/, "");
  if (!/^01[3-9]\d{8}$/.test(local)) throw new Error("সঠিক বাংলাদেশি মোবাইল নম্বর দিন।");
  return `+88${local}`;
}
export function validateLead(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("সঠিক তথ্য দিন।");
  const name = text(body.name, 100, true);
  if (name.length < 2) throw new Error("আপনার সম্পূর্ণ নাম দিন।");
  const phone = normalizeLeadPhone(body.phone);
  if (!["New Business", "Existing Business"].includes(body.businessStatus)) throw new Error("ব্যবসার অবস্থা নির্বাচন করুন।");
  if (!LEAD_PLANS.includes(body.interestedPlan)) throw new Error("প্ল্যান নির্বাচন করুন।");
  if (typeof body.eventId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.eventId)) throw new Error("পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
  const attribution = {};
  if (body.attribution !== undefined && (!body.attribution || typeof body.attribution !== "object" || Array.isArray(body.attribution))) throw new Error("সঠিক campaign তথ্য দিন।");
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid"]) {
    if (body.attribution?.[key] !== undefined) attribution[key] = text(body.attribution[key], 500);
  }
  return { name, phone, businessStatus: body.businessStatus, interestedPlan: body.interestedPlan, message: text(body.message ?? "", 2000), eventId: body.eventId, attribution };
}
const sign = value => createHmac("sha256", process.env.JWT_SECRET).update(`lead:${value}`).digest("hex");
export function createFormToken(now = Date.now()) {
  const value = `${now}.${randomBytes(16).toString("hex")}`;
  return `${value}.${sign(value)}`;
}
export function validFormToken(token, now = Date.now()) {
  if (typeof token !== "string" || !/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return false;
  const [time, nonce, signature] = token.split(".");
  const age = now - Number(time);
  return age >= 2000 && age <= 2 * 60 * 60 * 1000 && timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(`${time}.${nonce}`), "hex"));
}
export function leadRateKey(value, bucket) { return createHmac("sha256", process.env.JWT_SECRET).update(`lead-limit:${value}:${bucket}`).digest("hex"); }
