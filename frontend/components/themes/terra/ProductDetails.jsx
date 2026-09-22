"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductDetailsSkeleton from "../../skeletons/ProductDetailsSkeleton";
import { useCartUtils } from "../../../hooks/useCartUtils";
import { useLiveStock } from "../../../hooks/useLiveStock";

import ProductBreadcrumb from "../../product-details/ProductBreadcrumb";
import ProductGallery from "../../product-details/ProductGallery";
import ProductInfo from "../../product-details/ProductInfo";
import PurchaseActions from "../../product-details/PurchaseActions";
import ProductTabs from "../../product-details/ProductTabs";
import RelatedProducts from "../../product-details/RelatedProducts";
import FacebookGroupLink from "../../product-details/FacebookGroupLink";
import ReviewVideoLink from "../../product-details/ReviewVideoLink";
import useShopPath from "../../../hooks/useShopPath";

// Shop Start: premium "sticky split-screen" product page — the gallery stays
// pinned to the viewport while the info column scrolls beside it, generous
// whitespace instead of card chrome, a large serif heading, and full-width
// stacked buy buttons. All business logic here is unchanged from
// ProductDetailsClient.jsx — only the markup/layout differs (same pattern as
// FirstCartProductDetails).
export default function TerraProductDetails({
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

  return (
    <main className="bg-[var(--theme-bg)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <ProductBreadcrumb product={product} categories={categories} />

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Gallery — sticky, no card chrome, floats on the page bg */}
          <div className="lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
            <ProductGallery
              images={images}
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx}
              productName={product.name}
              isOutOfStock={isOutOfStock}
            />
          </div>

          {/* Info — open whitespace, no surrounding card */}
          <div
            className="flex flex-col gap-6 lg:col-span-5 lg:py-4"
            style={{ fontFamily: "var(--theme-font-heading)" }}
          >
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

            <div className="border-t border-[var(--theme-text)]/10 pt-6">
              <PurchaseActions
                product={product}
                cartKey={cartKey}
                quantity={quantity}
                totalPrice={totalPrice}
                isOutOfStock={isOutOfStock}
                currentStock={currentStock}
                updateCart={updateCart}
                handleCheckout={handleCheckout}
                variant="stacked"
              />
            </div>

            <div className="space-y-2">
              <ReviewVideoLink product={product} />
              <FacebookGroupLink />
            </div>
          </div>
        </section>

        {/* Description / return policy / reviews — stacked one after another,
            no tab-click switching */}
        <div className="mt-16">
          <ProductTabs product={product} tab={tab} setTab={setTab} variant="stacked" />
        </div>

        {/* Related products */}
        {related?.length > 0 && (
          <div className="mt-8">
            <RelatedProducts related={related} ProductCard={ProductCard} />
          </div>
        )}
      </div>
    </main>
  );
}
