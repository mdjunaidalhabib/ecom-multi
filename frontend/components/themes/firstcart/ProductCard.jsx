"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import {
  FaHeart,
  FaRegHeart,
  FaCheck,
  FaShoppingBag,
  FaStar,
} from "react-icons/fa";
import { useCartUtils } from "../../../hooks/useCartUtils";
import { useLiveStock } from "../../../hooks/useLiveStock";
import { useInView } from "../../../hooks/useInView";
import useShopPath from "../../../hooks/useShopPath";

// FirstCart: soft modern card — square image with rounded-2xl corners, pill
// discount badge (top-left), floating heart (top-right), full-width "Add to cart"
// pill that slides up over the image on hover (desktop) / compact buttons below
// on touch. Same data/cart/wishlist/live-stock logic as the other themes.
const FirstCartProductCard = memo(({ product, priority = false }) => {
  const { cart, updateCart, wishlist, toggleWishlist } = useCartUtils();
  const { base } = useShopPath();
  const router = useRouter();

  const productId = product?._id;

  const [cardRef, inView] = useInView({ enabled: !priority });
  const live = useLiveStock(inView ? productId : null);

  if (!productId) return null;

  const colors = useMemo(() => {
    const base = Array.isArray(product?.colors) ? product.colors : [];
    if (!live?.colors) return base;
    return base.map((c) => {
      const match = live.colors.find((lc) => lc.name === c.name);
      return match ? { ...c, stock: match.stock, sold: match.sold } : c;
    });
  }, [product, live]);

  const defaultColor = colors.length > 0 ? colors[0] : null;

  const cartKey = defaultColor
    ? `${productId}|${defaultColor.name}`
    : String(productId);

  const quantity = cart[String(cartKey)] || 0;

  const discount = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isInWishlist = wishlist.includes(String(productId));
  const inCart = quantity > 0;

  const rawIsSoldOut = live?.isSoldOut ?? product?.isSoldOut;
  const isSoldOut = rawIsSoldOut === true || rawIsSoldOut === "true";

  const totalStock = useMemo(() => {
    if (colors.length > 0) {
      return colors.reduce((sum, v) => sum + Number(v?.stock || 0), 0);
    }
    return Number(live?.stock ?? product?.stock ?? 0);
  }, [colors, product, live]);

  const isOutOfStock = totalStock <= 0 || isSoldOut;

  const mainImage = useMemo(() => {
    if (defaultColor?.images?.length > 0) return defaultColor.images[0];
    if (product?.image && product.image.startsWith("http"))
      return product.image;
    if (product?.images?.length > 0) return product.images[0];
    return "/no-image.png";
  }, [product, defaultColor]);

  // Buy now: কার্টে না থাকলে ১টা যোগ করে সরাসরি checkout এ (product details পেজের মতোই)
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!inCart) updateCart(cartKey, +1, totalStock);
    router.push(
      `${base}/checkout?productId=${productId}&qty=${quantity || 1}${
        defaultColor ? `&color=${encodeURIComponent(defaultColor.name)}` : ""
      }&stock=${totalStock}`,
    );
  };

  const onAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) updateCart(cartKey, +1, totalStock);
  };

  const rating = Number(product?.rating || 0);
  const reviewCount = Array.isArray(product?.reviews)
    ? product.reviews.length
    : 0;

  const addLabel = isOutOfStock ? "Sold out" : inCart ? "In cart" : "Add to cart";
  const AddIcon = inCart ? FaCheck : FaShoppingBag;

  const addBtnState = isOutOfStock
    ? "cursor-not-allowed bg-slate-200 text-slate-400"
    : inCart
      ? "cursor-default bg-white text-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]/30"
      : "bg-[var(--theme-primary)] text-white hover:brightness-110 active:scale-[0.98]";

  return (
    <div ref={cardRef} className="group flex flex-col">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
        <Link
          href={`${base}/products/${productId}`}
          aria-label={product?.name || "Product"}
          className="absolute inset-0 block"
        >
          <Image
            loader={cloudinaryLoader}
            src={mainImage}
            alt={product?.name || "Product"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
        </Link>

        {discount > 0 && !isOutOfStock && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[var(--theme-secondary,var(--theme-primary))] px-2.5 py-1 text-[10px] font-bold leading-none text-white shadow-sm">
            -{discount}%
          </span>
        )}

        {isOutOfStock && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold leading-none text-white">
            Sold out
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(productId);
          }}
          aria-label="Toggle wishlist"
          aria-pressed={isInWishlist}
          className={`absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur transition active:scale-90 ${
            isInWishlist
              ? "bg-[var(--theme-primary)] text-white"
              : "bg-white/90 text-slate-500 hover:text-[var(--theme-primary)]"
          }`}
        >
          {isInWishlist ? (
            <FaHeart className="h-4 w-4" />
          ) : (
            <FaRegHeart className="h-4 w-4" />
          )}
        </button>

        {/* Desktop: slide-up quick add over the image */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 hidden translate-y-[140%] opacity-0 transition duration-300 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStock || inCart}
            className={`pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold shadow-lg transition ${addBtnState}`}
          >
            <AddIcon className="h-3 w-3" />
            {addLabel}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 px-1 pb-1 pt-3">
        <Link href={`${base}/products/${productId}`} className="block">
          <h4
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-[var(--theme-text)] transition-colors group-hover:text-[var(--theme-primary)]"
            style={{ fontFamily: "var(--theme-font-heading, inherit)" }}
          >
            {product?.name}
          </h4>
        </Link>

        {rating > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-[var(--theme-text)]/60">
            <FaStar className="h-3 w-3 text-amber-400" />
            <span className="font-semibold text-[var(--theme-text)]/80">
              {rating.toFixed(1)}
            </span>
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold tabular-nums text-[var(--theme-primary)]">
            ৳{product?.price}
          </span>
          {product?.oldPrice && (
            <span className="text-xs tabular-nums text-slate-400 line-through">
              ৳{product.oldPrice}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-md bg-[var(--theme-secondary,var(--theme-primary))]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--theme-secondary,var(--theme-primary))]">
              {discount}% OFF
            </span>
          )}
        </div>

        <p
          className={`flex items-center gap-1.5 text-[11px] font-medium ${
            isOutOfStock ? "text-red-500" : "text-[var(--theme-text)]/55"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOutOfStock ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          {isOutOfStock ? "Out of stock" : `In stock · ${totalStock}`}
        </p>

        {/* Buy now: subtle text link on desktop */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`hidden items-center justify-center self-start text-xs font-semibold underline-offset-4 transition md:inline-flex ${
            isOutOfStock
              ? "cursor-not-allowed text-slate-400"
              : "text-[var(--theme-text)] hover:text-[var(--theme-primary)] hover:underline"
          }`}
        >
          Buy now &rarr;
        </button>

        {/* Mobile / touch: compact buttons below the info */}
        <div className="mt-1 flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStock || inCart}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-semibold transition ${addBtnState}`}
          >
            <AddIcon className="h-3 w-3" />
            {addLabel}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex-none rounded-full border px-3 py-2 text-[11px] font-semibold transition ${
              isOutOfStock
                ? "cursor-not-allowed border-slate-200 text-slate-400"
                : "border-[var(--theme-primary)] text-[var(--theme-primary)] active:bg-[var(--theme-primary)] active:text-white"
            }`}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
});

FirstCartProductCard.displayName = "FirstCartProductCard";

export default FirstCartProductCard;
