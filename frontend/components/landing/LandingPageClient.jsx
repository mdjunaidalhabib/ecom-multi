"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import VariantSelector from "../product-details/VariantSelector";

const PHONE_RE = /^(01[3-9]\d{8})$/;
const SENDER_RE = /^(01[3-9]\d{8})$/;
const TRX_RE = /^[A-Za-z0-9]{6,20}$/;

function SectionBlock({ section }) {
  if (section.type === "testimonial") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <div className="flex items-center gap-1 text-amber-400 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill={i < (section.rating || 5) ? "currentColor" : "none"} />
          ))}
        </div>
        {section.heading && (
          <p className="font-semibold text-gray-800 mb-1">{section.heading}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
        {section.authorName && (
          <p className="mt-2 text-xs font-semibold text-gray-500">— {section.authorName}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {section.heading && (
        <h3 className="font-bold text-gray-900 mb-1.5">{section.heading}</h3>
      )}
      {section.content && (
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {section.content}
        </p>
      )}
    </div>
  );
}

export default function LandingPageClient({ page, product, paymentMethods, base }) {
  const heroImages = page.heroImages?.length
    ? page.heroImages
    : [product.image, ...(product.images || [])].filter(Boolean);

  const [activeHero, setActiveHero] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [qty, setQty] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentPrice = selectedColor?.price ?? product.price;
  const currentOldPrice = selectedColor?.oldPrice ?? product.oldPrice;
  const currentStock = selectedColor ? selectedColor.stock ?? 0 : product.stock ?? 0;
  const isOutOfStock = product.isSoldOut || currentStock <= 0;

  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m.name === paymentMethod) || null,
    [paymentMethods, paymentMethod],
  );
  const isManualPayment = paymentMethod !== "cod" && !!selectedMethod;

  const errors = {
    name: !name.trim(),
    phone: !PHONE_RE.test(phone),
    address: !address.trim(),
    senderNumber: isManualPayment && !SENDER_RE.test(senderNumber),
    transactionId: isManualPayment && !TRX_RE.test(transactionId.trim()),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const fieldClass = (bad) =>
    `mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors ${
      bad ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-pink-400"
    }`;

  const ctaText = page.orderForm?.ctaText || "অর্ডার করুন";
  const showQuantitySelector = page.orderForm?.showQuantitySelector !== false;
  const showNote = !!page.orderForm?.showNote;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMsg("");
    if (hasErrors || isOutOfStock) return;

    setSubmitting(true);
    try {
      const orderData = {
        items: [
          {
            productId: product._id,
            qty,
            ...(selectedColor?.name && { color: selectedColor.name }),
          },
        ],
        billing: { name, phone, address, note },
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        ...(isManualPayment && {
          paymentDetails: {
            senderNumber,
            transactionId: transactionId.trim().toUpperCase(),
          },
        }),
      };

      const res = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "অর্ডার সম্পন্ন হয়নি");

      const orderId = data._id || data.id;
      window.location.href = `${base}/order-summary/${orderId}`;
    } catch (err) {
      setErrorMsg(err?.message || "🚨 অর্ডার সম্পন্ন হয়নি! আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 pb-28">
      {/* Hero */}
      <div className="space-y-3">
        {heroImages.length > 0 && (
          <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-square">
            <img
              src={heroImages[activeHero] || heroImages[0]}
              alt={page.headline}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {heroImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {heroImages.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveHero(i)}
                className={`shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 ${
                  activeHero === i ? "border-pink-500" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
          {page.headline}
        </h1>
        {page.subheadline && (
          <p className="text-gray-500">{page.subheadline}</p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-pink-600">৳{currentPrice}</span>
          {currentOldPrice > currentPrice && (
            <span className="text-sm text-gray-400 line-through">৳{currentOldPrice}</span>
          )}
        </div>
      </div>

      {/* Sections */}
      {page.sections?.length > 0 && (
        <div className="space-y-5">
          {page.sections.map((section) => (
            <SectionBlock key={section._id || section.heading} section={section} />
          ))}
        </div>
      )}

      {/* Order form */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm"
      >
        <h2 className="font-bold text-gray-900">অর্ডার করুন</h2>

        {isOutOfStock ? (
          <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-xl px-3 py-2">
            😔 বর্তমানে স্টকে নেই
          </p>
        ) : (
          <>
            <VariantSelector
              colors={product.colors || []}
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />

            {showQuantitySelector && (
              <div>
                <span className="text-xs font-medium text-gray-600">পরিমাণ</span>
                <div className="mt-1 flex items-center gap-3 w-fit border border-gray-200 rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-gray-500 hover:text-pink-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(currentStock || 99, q + 1))}
                    className="p-1.5 text-gray-500 hover:text-pink-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-xs font-medium text-gray-600">নাম *</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass(submitted && errors.name)}
                placeholder="আপনার নাম"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-gray-600">ফোন নম্বর *</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass(submitted && errors.phone)}
                placeholder="01XXXXXXXXX"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-gray-600">ঠিকানা *</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={fieldClass(submitted && errors.address)}
                rows={2}
                placeholder="সম্পূর্ণ ঠিকানা লিখুন"
              />
            </label>

            {showNote && (
              <label className="block">
                <span className="text-xs font-medium text-gray-600">নোট (ঐচ্ছিক)</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={fieldClass(false)}
                  placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন"
                />
              </label>
            )}

            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-600">পেমেন্ট মেথড *</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`py-2.5 px-2 border rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === "cod"
                      ? "bg-pink-600 text-white border-pink-600 shadow"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Cash on Delivery
                </button>
                {paymentMethods.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => setPaymentMethod(m.name)}
                    className={`py-2.5 px-2 border rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === m.name
                        ? "bg-pink-600 text-white border-pink-600 shadow"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {isManualPayment && (
                <div className="p-3.5 bg-pink-50 border border-pink-100 rounded-xl space-y-3">
                  <p className="text-xs text-gray-700">
                    <b>{selectedMethod.number}</b> নম্বরে{" "}
                    <b>{selectedMethod.actionLabel || "Send Money"}</b> করে নিচে তথ্য দিন
                  </p>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">যে নম্বর থেকে পাঠিয়েছেন *</span>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className={fieldClass(submitted && errors.senderNumber)}
                      placeholder="01XXXXXXXXX"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Transaction ID *</span>
                    <input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      className={fieldClass(submitted && errors.transactionId)}
                      placeholder="যেমন: 8N7A9X2K1B"
                    />
                  </label>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-xl px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200 disabled:opacity-60"
            >
              {submitting ? "অপেক্ষা করুন..." : `${ctaText} — ৳${currentPrice * qty}`}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
