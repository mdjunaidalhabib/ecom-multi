"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { LEAD_PLANS as PLANS, captureLeadAttribution } from "../../lib/leadGeneration";

const inputClass = "mt-1.5 min-h-12 w-full min-w-0 rounded-xl border px-3.5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:cursor-wait disabled:opacity-70";
const feedback = (message, type = "error") => toast[type](message, {
  id: "lead-feedback", toasterId: "lead-form", duration: 5000,
  ariaProps: { role: type === "error" ? "alert" : "status", "aria-live": type === "error" ? "assertive" : "polite" },
});
const RequiredStar = () => <span aria-hidden="true" className="ml-0.5 text-red-600">*</span>;
function FieldError({ field, errors }) {
  return errors[field] ? <p id={`lead-${field}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-red-600"><AlertCircle size={14} className="mt-0.5 shrink-0" />{errors[field]}</p> : null;
}

// One browser delivery path. GTM tags must respect browser_pixel_sent to avoid
// sending a second Pixel event when an existing fbq instance handled it.
export function trackSuccessfulLead(eventId, plan) {
  let browserPixelSent = false;
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", { content_name: plan }, { eventID: eventId });
      browserPixelSent = true;
    }
  } catch { /* Analytics must never turn a saved lead into a failed form. */ }
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "ecms_lead", event_name: "Lead", event_id: eventId, interested_plan: plan, browser_pixel_sent: browserPixelSent });
  } catch { /* GTM may be blocked by the browser. */ }
}

export default function LeadForm({ initialPlan = "" }) {
  const [plan, setPlan] = useState(PLANS.includes(initialPlan) ? initialPlan : "");
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [tokenAttempt, setTokenAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const attribution = useRef({});
  const request = useRef(null);
  const inFlight = useRef(false);
  const fieldClass = field => `${inputClass} ${fieldErrors[field] ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100" : "border-gray-200 bg-gray-50/60 hover:border-gray-300 focus:border-orange-400 focus:bg-white focus:ring-orange-100"}`;
  const clearFieldError = field => setFieldErrors(current => current[field] ? { ...current, [field]: "" } : current);

  useEffect(() => { attribution.current = captureLeadAttribution(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    setReady(false);
    fetch("/api/leads/form-token", { cache: "no-store", signal: controller.signal })
      .then(async res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        if (typeof data.token !== "string") throw new Error();
        setToken(data.token);
        timer = setTimeout(() => setReady(true), 2100);
      })
      .catch(() => { if (!controller.signal.aborted) setError("ফর্ম লোড করা যায়নি। আবার লোড করুন।"); });
    const refresh = setInterval(() => setTokenAttempt(value => value + 1), 90 * 60 * 1000);
    return () => { controller.abort(); clearTimeout(timer); clearInterval(refresh); };
  }, [tokenAttempt]);

  async function submit(event) {
    event.preventDefault();
    if (inFlight.current || success || !ready) return;
    const form = new FormData(event.currentTarget);
    const fields = { name: form.get("name").trim(), phone: form.get("phone").trim(), businessStatus: form.get("businessStatus"), interestedPlan: plan, message: form.get("message").trim(), attribution: attribution.current };
    const errors = {};
    if (!fields.name) errors.name = "আপনার নাম লিখুন।";
    else if (fields.name.length < 2) errors.name = "কমপক্ষে ২ অক্ষরে আপনার নাম লিখুন।";
    const phone = fields.phone.replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit))).replace(/[\s()-]/g, "").replace(/^(?:\+?88)/, "");
    if (!fields.phone) errors.phone = "আপনার মোবাইল নম্বর লিখুন।";
    else if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)।";
    if (!fields.businessStatus) errors.businessStatus = "ব্যবসার অবস্থা নির্বাচন করুন।";
    if (!PLANS.includes(fields.interestedPlan)) errors.interestedPlan = "পছন্দের প্ল্যান নির্বাচন করুন।";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      const missing = !fields.name || !fields.phone || !fields.businessStatus || !fields.interestedPlan;
      feedback(missing ? "অনুগ্রহ করে লাল চিহ্নিত প্রয়োজনীয় তথ্যগুলো পূরণ করুন।" : Object.values(errors)[0]);
      const fieldIds = { name: "lead-name", phone: "lead-phone", businessStatus: "lead-business", interestedPlan: "lead-plan" };
      document.getElementById(fieldIds[Object.keys(errors)[0]])?.focus();
      return;
    }
    const snapshot = JSON.stringify(fields);
    if (request.current?.snapshot !== snapshot) request.current = { snapshot, eventId: crypto.randomUUID() };
    inFlight.current = true;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, eventId: request.current.eventId, formToken: token, website: form.get("website") }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.eventId !== request.current.eventId) throw new Error(data.message || "অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন।");
      setSuccess(true);
      feedback("ধন্যবাদ! আপনার তথ্য সফলভাবে পাঠানো হয়েছে। আমাদের টিম যোগাযোগ করবে।", "success");
      trackSuccessfulLead(data.eventId, plan);
    } catch (err) {
      const message = err.name === "TimeoutError" || err.name === "TypeError" ? "সংযোগে সমস্যা হয়েছে। একই তথ্য দিয়ে আবার চেষ্টা করুন।" : err.message;
      setError(message);
      feedback(message);
      setTokenAttempt(value => value + 1);
    } finally { inFlight.current = false; setSaving(false); }
  }

  return (
    <section id="lead-form" aria-labelledby="lead-heading" className="bg-gradient-to-br from-orange-50/80 via-white to-teal-50/70 py-7 sm:py-12 lg:py-16">
      <Toaster toasterId="lead-form" position="top-right" containerStyle={{ top: 20, left: 16, right: 16 }} toastOptions={{ style: { maxWidth: "min(420px, calc(100vw - 32px))", fontFamily: "inherit", fontSize: "14px", lineHeight: "1.6", borderRadius: "14px" } }} />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">আপনার ব্যবসার পরবর্তী ধাপ</span>
          <h1 id="lead-heading" className="mt-3 max-w-md text-[22px] font-semibold leading-relaxed tracking-tight text-gray-900 sm:text-2xl lg:text-[28px]">সঠিক প্ল্যান বেছে নিতে<br className="hidden lg:block" /> আমরা আছি আপনার পাশে</h1>
          <p className="mt-3 max-w-md text-sm leading-7 text-gray-500">নতুন ব্যবসা শুরু করছেন বা বর্তমান ব্যবসা অনলাইনে আনতে চান? আপনার তথ্য দিন। আমাদের টিম আপনার প্রয়োজন অনুযায়ী সঠিক সমাধান বেছে নিতে সাহায্য করবে।</p>
          <div className="mt-5 hidden space-y-3 lg:block">
            <div className="flex items-start gap-2.5 text-sm text-gray-600"><Phone className="mt-0.5 shrink-0 text-orange-500" size={17} /><span>ফোন বা WhatsApp-এ সরাসরি পরামর্শ</span></div>
            <div className="flex items-start gap-2.5 text-sm text-gray-600"><ShieldCheck className="mt-0.5 shrink-0 text-teal-600" size={17} /><span>কোনো পেমেন্ট বা অগ্রিম খরচ নেই</span></div>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-gray-200/30 sm:rounded-3xl">
          {success ? (
            <div role="status" className="px-5 py-12 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={44} /><h2 className="mt-4 text-xl font-semibold">ধন্যবাদ! আপনার অনুরোধ পেয়েছি।</h2><p className="mt-3 text-sm leading-relaxed text-gray-600">আমাদের টিম আপনার সঙ্গে যোগাযোগ করবে।</p></div>
          ) : (
            <form onSubmit={submit} noValidate aria-labelledby="lead-form-title">
              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6 sm:py-5"><h2 id="lead-form-title" className="text-lg font-semibold text-gray-900">বিস্তারিত জানতে তথ্য দিন</h2><p className="mt-1 text-xs leading-relaxed text-gray-500">লাল তারকা (<span className="text-red-600">*</span>) চিহ্নিত তথ্যগুলো আবশ্যক।</p></div>
              <fieldset disabled={saving} aria-labelledby="lead-form-title" className="min-w-0 space-y-4 p-5 sm:p-6">
                <div><label htmlFor="lead-name" className="text-sm font-medium text-gray-700">আপনার নাম <RequiredStar /></label><input id="lead-name" name="name" autoComplete="name" minLength={2} maxLength={100} required className={fieldClass("name")} placeholder="আপনার সম্পূর্ণ নাম" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "lead-name-error" : undefined} onChange={() => clearFieldError("name")} /><FieldError field="name" errors={fieldErrors} /></div>
                <div><label htmlFor="lead-phone" className="text-sm font-medium text-gray-700">মোবাইল নম্বর <RequiredStar /></label><input id="lead-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required className={fieldClass("phone")} placeholder="01XXXXXXXXX" aria-invalid={!!fieldErrors.phone} aria-describedby={fieldErrors.phone ? "lead-phone-error" : "lead-phone-help"} onChange={() => clearFieldError("phone")} /><FieldError field="phone" errors={fieldErrors} />{!fieldErrors.phone && <p id="lead-phone-help" className="mt-1.5 text-xs text-gray-400">যোগাযোগের জন্য আপনার সচল মোবাইল নম্বর দিন।</p>}</div>
                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <div className="min-w-0"><label htmlFor="lead-business" className="text-sm font-medium text-gray-700">ব্যবসার অবস্থা <RequiredStar /></label><select id="lead-business" name="businessStatus" required defaultValue="" className={fieldClass("businessStatus")} aria-invalid={!!fieldErrors.businessStatus} aria-describedby={fieldErrors.businessStatus ? "lead-businessStatus-error" : undefined} onChange={() => clearFieldError("businessStatus")}><option value="" disabled>নির্বাচন করুন</option><option value="New Business">নতুন ব্যবসা</option><option value="Existing Business">চলমান ব্যবসা</option></select><FieldError field="businessStatus" errors={fieldErrors} /></div>
                  <div className="min-w-0"><label htmlFor="lead-plan" className="text-sm font-medium text-gray-700">পছন্দের প্ল্যান <RequiredStar /></label><select id="lead-plan" name="interestedPlan" required value={plan} onChange={e => { setPlan(e.target.value); clearFieldError("interestedPlan"); }} className={fieldClass("interestedPlan")} aria-invalid={!!fieldErrors.interestedPlan} aria-describedby={fieldErrors.interestedPlan ? "lead-interestedPlan-error" : undefined}><option value="" disabled>প্ল্যান নির্বাচন করুন</option>{PLANS.map(value => <option key={value}>{value}</option>)}</select><FieldError field="interestedPlan" errors={fieldErrors} /></div>
                </div>
                <div><label htmlFor="lead-message" className="text-sm font-medium text-gray-700">আপনার বার্তা <span className="text-xs font-normal text-gray-400">(ঐচ্ছিক)</span></label><textarea id="lead-message" name="message" rows={3} maxLength={2000} className={`${inputClass} resize-y border-gray-200 bg-gray-50/60 focus:border-orange-400 focus:bg-white focus:ring-orange-100`} placeholder="আপনার ব্যবসা বা প্রয়োজন সম্পর্কে লিখুন…" /></div>
                <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="lead-website">Website</label><input id="lead-website" name="website" tabIndex={-1} autoComplete="off" /></div>
                <button disabled={!ready || saving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60" type="submit">{saving ? <Loader2 className="animate-spin" size={17} /> : null}{saving ? "পাঠানো হচ্ছে…" : "বিস্তারিত জানতে চাই"}{!saving && <ArrowRight size={16} />}</button>
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-400"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-teal-600" /><span>তথ্য পাঠিয়ে আপনি এই অনুরোধ সম্পর্কে ফোন বা WhatsApp-এ যোগাযোগের সম্মতি দিচ্ছেন। কোনো পেমেন্ট প্রয়োজন নেই।</span></p>
              </fieldset>
              {error && <div role="alert" data-submit-error className="mx-5 mb-5 rounded-xl bg-red-50 p-3 text-sm leading-relaxed text-red-700 sm:mx-6">{error}<button type="button" disabled={saving} onClick={() => { setError(""); setTokenAttempt(value => value + 1); }} className="ml-2 underline">ফর্ম আবার লোড করুন</button></div>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
