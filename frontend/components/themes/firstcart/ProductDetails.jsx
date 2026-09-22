"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductDetailsSkeleton from "../../skeletons/ProductDetailsSkeleton";
import { useCartUtils } from "../../../hooks/useCartUtils";
import { useLiveStock } from "../../../hooks/useLiveStock";
import { ShieldCheck, Truck, Banknote } from "lucide-react";

import ProductBreadcrumb from "../../product-details/ProductBreadcrumb";
import ProductGallery from "../../product-details/ProductGallery";
import ProductInfo from "../../product-details/ProductInfo";
import PurchaseActions from "../../product-details/PurchaseActions";
import ProductTabs from "../../product-details/ProductTabs";
import RelatedProducts from "../../product-details/RelatedProducts";
import FacebookGroupLink from "../../product-details/FacebookGroupLink";
import ReviewVideoLink from "../../product-details/ReviewVideoLink";
import useShopPath from "../../../hooks/useShopPath";

// FirstCart: marketplace-style product page — slim rounded breadcrumb bar, a
// sticky gallery column beside a white "buy box" card (info + purchase
// actions) on the page's --theme-bg background, a trust-badge row echoing the
// footer's "Secure checkout • Cash on delivery • Fast delivery" copy, and the
// tabs/reviews/related sections in their own rounded white cards below. All
// business logic here is unchanged from ProductDetailsClient.jsx — only the
// markup/layout differs.
export default function FirstCartProductDetails({
  product,
  categories = [],
  related = [],
  loading = false,
  ProductCard,
}) {
  const { cart, wishlist, toggleWishlist, updateCart } = useCartUtils();
  const router = useRouter();
  const { base } = useShopPath();
  const liveStock = useLiveStock(product?._id);

  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.length > 0 ? product.colors[0] : null
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState("desc");

  useEffect(() => {
    if (product?.colors?.length > 0) setSelectedColor(product.colors[0]);
    else setSelectedColor(null);
    setActiveIdx(0);
  }, [product]);

  if (loading || !product?._id) return <ProductDetailsSkeleton />;

  // ✅ live variant match (by color name) — instant stock, no cache
  const liveColorStock = selectedColor?.name
    ? liveStock?.colors?.find((c) => c.name === selectedColor.name)
    : null;

  // ✅ normalize isSoldOut (live value wins when available)
  const rawIsSoldOut = liveStock?.isSoldOut ?? product?.isSoldOut;
  const isSoldOut = rawIsSoldOut === true || rawIsSoldOut === "true";

  // ✅ stock normalize (variant stock first, live value wins)
  const currentStockRaw = selectedColor
    ? liveColorStock?.stock ?? selectedColor?.stock ?? 0
    : liveStock?.stock ?? product?.stock ?? 0;
  const currentStock = Number(currentStockRaw) || 0;

  // ✅ final out of stock
  const isOutOfStock = currentStock <= 0 || isSoldOut;

  // ✅ variant aware cart key
  const cartKey = selectedColor?.name
    ? `${product._id}|${selectedColor.name}`
    : String(product._id);

  // ✅ quantity by cartKey
  const quantity = cart[String(cartKey)] || 0;

  // ✅ selected variant price is the source of truth for the UI
  const currentPrice = Number(selectedColor?.price ?? product?.price ?? 0) || 0;
  const currentOldPriceRaw = selectedColor?.oldPrice ?? product?.oldPrice ?? null;
  const currentOldPrice =
    currentOldPriceRaw === null || currentOldPriceRaw === undefined
      ? null
      : Number(currentOldPriceRaw);

  // ✅ numeric total price (variant aware)
  const totalPrice = currentPrice * Number(quantity || 0);

  // ✅ images choose from variant or fallback
  const images = useMemo(() => {
    if (selectedColor && selectedColor.images?.length > 0)
      return selectedColor.images;

    const gallery = Array.isArray(product.images) ? product.images : [];
    const main =
      product.image && product.image.startsWith("http") ? product.image : null;

    if (main && !gallery.includes(main)) return [main, ...gallery];
    if (gallery.length > 0) return gallery;

    return ["/no-image.png"];
  }, [product, selectedColor]);

  // ✅ safety reset idx if invalid
  useEffect(() => {
    if (!images?.length) return;
    if (activeIdx >= images.length) setActiveIdx(0);
  }, [images, activeIdx]);

  // ✅ autoplay slider
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  // ✅ oldPrice discount logic (variant aware)
  const hasOldPrice =
    Number.isFinite(currentOldPrice) && currentOldPrice > currentPrice;

  const discountPct = hasOldPrice
    ? (((currentOldPrice - currentPrice) / currentOldPrice) * 100).toFixed(1)
    : null;

  // ✅ wishlist normalize
  const isInWishlist = wishlist.includes(String(product._id));

  // ✅ sold count variant aware (live value wins)
  const soldCountRaw = selectedColor
    ? liveColorStock?.sold ?? selectedColor?.sold ?? 0
    : liveStock?.sold ?? product?.sold ?? 0;
  const soldCount = Number(soldCountRaw) || 0;

  // ✅ checkout pass color + stock + cartKey qty
  const handleCheckout = async () => {
    if (isOutOfStock) return;

    // If qty is 0 add 1 first
    if (!quantity || quantity === 0) {
      await updateCart(cartKey, +1, currentStock);
    }

    const finalQty = quantity || 1;

    router.push(
      `${base}/checkout?productId=${product._id}&qty=${finalQty}${
        selectedColor ? `&color=${encodeURIComponent(selectedColor.name)}` : ""
      }&stock=${currentStock}`
    );
  };

  const trustBadges = [
    { icon: ShieldCheck, label: "Secure checkout" },
    { icon: Banknote, label: "Cash on delivery" },
    { icon: Truck, label: "Fast delivery" },
  ];

  return (
    <main className="bg-[var(--theme-bg)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 py-4 md:py-8">
        {/* Breadcrumb — no background, just the trail */}
        <div className="mb-4 px-1 md:mb-6">
          <ProductBreadcrumb product={product} categories={categories} />
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Gallery column — sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:col-span-6 lg:self-start">
            <ProductGallery
              images={images}
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx}
              productName={product.name}
              isOutOfStock={isOutOfStock}
            />
          </div>

          {/* Buy box column */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[var(--theme-surface)] p-4 shadow-sm ring-1 ring-[var(--theme-text)]/5 md:p-6">
              {/* font-heading cascades down to ProductInfo's <h1> via inheritance */}
              <div style={{ fontFamily: "var(--theme-font-heading)" }}>
                <ProductInfo
                  product={product}
                  categories={categories}
                  isOutOfStock={isOutOfStock}
                  currentStock={currentStock}
                  soldCount={soldCount}
                  currentPrice={currentPrice}
                  currentOldPrice={currentOldPrice}
                  hasOldPrice={hasOldPrice}
                  discountPct={discountPct}
                  isInWishlist={isInWishlist}
                  toggleWishlist={toggleWishlist}
                  selectedColor={selectedColor}
                  setSelectedColor={(c) => {
                    setSelectedColor(c);
                    setActiveIdx(0);
                  }}
                />
              </div>

              {/* Hidden on mobile — the same PurchaseActions is pinned to a
                  sticky bottom bar there instead, so actions aren't shown twice. */}
              <div className="mt-4 hidden border-t border-[var(--theme-text)]/10 pt-4 md:block">
                <PurchaseActions
                  product={product}
                  cartKey={cartKey}
                  quantity={quantity}
                  totalPrice={totalPrice}
                  isOutOfStock={isOutOfStock}
                  currentStock={currentStock}
                  updateCart={updateCart}
                  handleCheckout={handleCheckout}
                />
              </div>
            </div>

            {/* Trust badges — same copy as FirstCart's footer */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl bg-[var(--theme-surface)] px-4 py-3 text-[11px] font-medium text-[var(--theme-text)]/70 shadow-sm ring-1 ring-[var(--theme-text)]/5 sm:justify-start md:text-xs">
              {trustBadges.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-2 px-1">
              <ReviewVideoLink product={product} />
              <FacebookGroupLink />
            </div>
          </div>
        </section>

        {/* Tabs / reviews */}
        <div className="mt-8 rounded-2xl bg-[var(--theme-surface)] px-4 py-2 shadow-sm ring-1 ring-[var(--theme-text)]/5 md:px-6">
          <ProductTabs product={product} tab={tab} setTab={setTab} variant="underline" />
        </div>

        {/* Related products */}
        {related?.length > 0 && (
          <div className="mt-8 rounded-2xl bg-[var(--theme-surface)] p-4 shadow-sm ring-1 ring-[var(--theme-text)]/5 md:p-6">
            <RelatedProducts related={related} ProductCard={ProductCard} />
          </div>
        )}
      </div>

      {/* Mobile sticky bottom action bar — reuses PurchaseActions as-is, no
          duplicated cart logic. Sits above FirstCart's mobile bottom tab bar. */}
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-[var(--theme-text)]/10 bg-[var(--theme-surface)] px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
        <PurchaseActions
          product={product}
          cartKey={cartKey}
          quantity={quantity}
          totalPrice={totalPrice}
          isOutOfStock={isOutOfStock}
          currentStock={currentStock}
          updateCart={updateCart}
          handleCheckout={handleCheckout}
        />
      </div>

      {/* Spacer so the fixed mobile bar + FirstCart's bottom tab bar never
          cover the tabs/reviews content underneath */}
      <div className="h-24 md:hidden" />
    </main>
  );
}
