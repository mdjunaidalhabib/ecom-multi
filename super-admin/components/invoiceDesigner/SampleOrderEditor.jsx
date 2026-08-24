"use client";

const SALE_CHANNELS = [
  { value: "online", label: "অনলাইন" },
  { value: "offline", label: "অফলাইন" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "পেন্ডিং" },
  { value: "paid", label: "পেইড" },
  { value: "failed", label: "ব্যর্থ" },
];

const fieldClass =
  "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition";

const labelClass = "block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5">
      <span className="text-sm leading-none">{icon}</span>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
        {title}
      </h4>
    </div>
  );
}

// ✅ InvoiceTemplateDefault.sampleOrder এডিট করার ফর্ম — সরু সাইড প্যানেলের
// (w-80) জন্য বানানো, তাই সব কিছু এক কলামে স্ট্যাক করা। এই একই ডেটা
// এডিটরের নিজের প্রিভিউ আর admin panel-এর ইনভয়েস ডিজাইনার প্রিভিউতে
// ব্যবহার হয় (দেখুন admin/components/invoiceDesigner/InvoiceDesignerPanel.jsx)।
// আসল অর্ডার ডাউনলোড করার সময় এই ডেটা কোনো প্রভাব ফেলে না — সেটা সবসময়
// আসল order থেকেই আসে।
export default function SampleOrderEditor({ sample, onChange, shop, onChangeShop }) {
  const set = (patch) => onChange({ ...sample, ...patch });
  const setBilling = (patch) => onChange({ ...sample, billing: { ...sample.billing, ...patch } });
  const setShop = (patch) => onChangeShop({ ...shop, ...patch });

  const updateItem = (index, patch) => {
    onChange({
      ...sample,
      items: sample.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });
  };
  const addItem = () =>
    onChange({ ...sample, items: [...sample.items, { name: "", price: 0, qty: 1 }] });
  const removeItem = (index) => {
    if (sample.items.length <= 1) return;
    onChange({ ...sample, items: sample.items.filter((_, i) => i !== index) });
  };

  const subtotal = sample.items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1),
    0,
  );
  const deliveryCharge = Number(sample.deliveryCharge || 0);
  const discount = Number(sample.discount || 0);
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  return (
    <div className="flex flex-col gap-5 text-sm">
      <p className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/60 border dark:border-slate-700 rounded-lg px-3 py-2">
        এই ডেটা দিয়ে ডিজাইনারের প্রিভিউ (এখানে ও admin panel-এ) দেখানো হয়। আসল অর্ডারের ইনভয়েস
        ডাউনলোড করার সময় এটা প্রভাব ফেলে না — তখন সবসময় আসল অর্ডারের ডেটাই ব্যবহার হয়।
      </p>

      {/* Shop */}
      <section>
        <SectionHeading icon="🏬" title="ডেমো শপ তথ্য" />
        <p className="text-[11px] text-gray-400 dark:text-slate-500 -mt-1.5 mb-2.5">
          শুধু এই প্রিভিউয়ের জন্য — admin panel সবসময় নিজের real শপের নাম/ফোন/ইমেইল দেখায়, এটা না।
        </p>
        <div className="flex flex-col gap-2.5">
          <Field label="শপের নাম">
            <input
              type="text"
              value={shop.name}
              onChange={(e) => setShop({ name: e.target.value })}
              className={fieldClass}
            />
          </Field>
          <Field label="ফোন">
            <input
              type="text"
              value={shop.contactPhone}
              onChange={(e) => setShop({ contactPhone: e.target.value })}
              className={fieldClass}
            />
          </Field>
          <Field label="ইমেইল">
            <input
              type="text"
              value={shop.contactEmail}
              onChange={(e) => setShop({ contactEmail: e.target.value })}
              className={fieldClass}
            />
          </Field>
        </div>
      </section>

      {/* Order info */}
      <section className="pt-4 border-t dark:border-slate-800">
        <SectionHeading icon="🧾" title="অর্ডার তথ্য" />
        <div className="flex flex-col gap-2.5">
          <Field label="অর্ডার টাইপ">
            <select
              value={sample.saleChannel}
              onChange={(e) => set({ saleChannel: e.target.value })}
              className={fieldClass}
            >
              {SALE_CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="পেমেন্ট মেথড">
            <input
              type="text"
              value={sample.paymentMethod}
              onChange={(e) => set({ paymentMethod: e.target.value })}
              placeholder="cod / bKash / Nagad"
              className={fieldClass}
            />
          </Field>
          <Field label="পেমেন্ট স্ট্যাটাস">
            <select
              value={sample.paymentStatus}
              onChange={(e) => set({ paymentStatus: e.target.value })}
              className={fieldClass}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Customer */}
      <section className="pt-4 border-t dark:border-slate-800">
        <SectionHeading icon="🙍" title="কাস্টমার তথ্য" />
        <div className="flex flex-col gap-2.5">
          <Field label="নাম">
            <input
              type="text"
              value={sample.billing.name}
              onChange={(e) => setBilling({ name: e.target.value })}
              className={fieldClass}
            />
          </Field>
          <Field label="ফোন">
            <input
              type="text"
              value={sample.billing.phone}
              onChange={(e) => setBilling({ phone: e.target.value })}
              className={fieldClass}
            />
          </Field>
          <Field label="ঠিকানা">
            <input
              type="text"
              value={sample.billing.address}
              onChange={(e) => setBilling({ address: e.target.value })}
              className={fieldClass}
            />
          </Field>
          <Field label="নোট (ডেলিভারি নির্দেশনা ইত্যাদি)">
            <textarea
              rows={2}
              value={sample.billing.note}
              onChange={(e) => setBilling({ note: e.target.value })}
              className={fieldClass}
            />
          </Field>
        </div>
      </section>

      {/* Items */}
      <section className="pt-4 border-t dark:border-slate-800">
        <SectionHeading icon="🛒" title="আইটেমসমূহ" />
        <div className="flex flex-col gap-2">
          {sample.items.map((it, i) => (
            <div
              key={i}
              className="border dark:border-slate-700 rounded-lg p-2.5 flex flex-col gap-2 bg-gray-50/60 dark:bg-slate-800/40"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="আইটেমের নাম"
                  className={`${fieldClass} flex-1 min-w-0`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={sample.items.length <= 1}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="আইটেম মুছে ফেলো"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="দাম">
                  <input
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Qty">
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          + আইটেম যোগ করো
        </button>
      </section>

      {/* Charges + live totals preview */}
      <section className="pt-4 border-t dark:border-slate-800">
        <SectionHeading icon="💰" title="চার্জ ও সারসংক্ষেপ" />
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <Field label="ডেলিভারি চার্জ">
            <input
              type="number"
              value={sample.deliveryCharge}
              onChange={(e) => set({ deliveryCharge: Number(e.target.value) })}
              className={fieldClass}
            />
          </Field>
          <Field label="ডিসকাউন্ট">
            <input
              type="number"
              value={sample.discount}
              onChange={(e) => set({ discount: Number(e.target.value) })}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="rounded-lg border dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 px-3 py-2.5 text-xs flex flex-col gap-1">
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{subtotal.toLocaleString("en-BD")} tk</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Delivery</span>
            <span>{deliveryCharge.toLocaleString("en-BD")} tk</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Discount</span>
            <span>-{discount.toLocaleString("en-BD")} tk</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-slate-100 pt-1.5 mt-1 border-t dark:border-slate-700">
            <span>Total</span>
            <span>{total.toLocaleString("en-BD")} tk</span>
          </div>
        </div>
      </section>
    </div>
  );
}
