"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import { FaHeart, FaCheck, FaShoppingBasket } from "react-icons/fa";
import { useCartUtils } from "../../../hooks/useCartUtils";
import { useLiveStock } from "../../../hooks/useLiveStock";
import { useInView } from "../../../hooks/useInView";
import useShopPath from "../../../hooks/useShopPath";

// Terra Prestige: refined card — portrait image, hairline ring that turns gold
// on hover, ribbon discount tag, uppercase tracked "Add to cart" button. Same
// data/cart/wishlist/live-stock logic as classic.
const TerraProductCard = memo(({ product, priority = false }) => {
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

  // ✅ Buy now: কার্টে না থাকলে ১টা যোগ করে সরাসরি checkout এ (product details পেজের মতোই)
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

  return (
    <div
      ref={cardRef}
      className="group flex flex-col overflow-hidden rounded-xl bg-[var(--theme-surface)] ring-1 ring-[var(--theme-primary)]/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--theme-primary)]/15 hover:ring-[var(--theme-primary)]/60"
    >
      <Link
        href={`${base}/products/${productId}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-stone-100"
      >
        {discount > 0 && (
          <span className="absolute left-0 top-3 z-10 bg-[var(--theme-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            -{discount}%
          </span>
        )}

        <Image
          loader={cloudinaryLoader}
          src={mainImage}
          alt={product?.name || "Product"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h4 className="truncate text-sm font-semibold tracking-tight text-[var(--theme-text)]">
          {product?.name}
        </h4>

        <p
          className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${
            isOutOfStock ? "text-red-500" : "text-[var(--theme-text)]/60"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOutOfStock ? "bg-red-500" : "bg-[var(--theme-primary)]"
            }`}
          />
          {isOutOfStock ? "Out of stock" : `In stock · ${totalStock}`}
        </p>

        {/* ✅ Wishlist (favourite) আইকন এখন দামের ডান পাশে */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="text-lg font-semibold tabular-nums text-[var(--theme-primary)]">
              ৳{product?.price}
            </p>
            {product?.oldPrice && (
              <p className="text-xs tabular-nums text-stone-400 line-through">৳{product.oldPrice}</p>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(productId);
            }}
            aria-label="Toggle wishlist"
            aria-pressed={isInWishlist}
            className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ring-1 transition-colors ${
              isInWishlist
                ? "bg-[var(--theme-primary)] text-white ring-[var(--theme-primary)]"
                : "bg-white text-[var(--theme-primary)]/60 ring-[var(--theme-primary)]/25 hover:bg-[var(--theme-primary)] hover:text-white"
            }`}
          >
            <FaHeart className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ✅ ২টা বাটন: Add to cart (১টা সরাসরি কার্টে, এখান থেকে quantity বাড়ানো/কমানো যাবে না)
            আর Buy now (সরাসরি checkout এ) */}
        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!inCart) updateCart(cartKey, +1, totalStock);
            }}
            disabled={isOutOfStock || inCart}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              isOutOfStock
                ? "cursor-not-allowed border-transparent bg-stone-100 text-stone-400"
                : inCart
                  ? "cursor-default border-[var(--theme-primary)]/25 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"
                  : "border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white"
            }`}
          >
            {inCart ? <FaCheck className="h-3 w-3" /> : <FaShoppingBasket className="h-3 w-3" />}
            {isOutOfStock ? "Sold out" : inCart ? "In cart" : "Add to cart"}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex w-full items-center justify-center rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              isOutOfStock
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-dark)]"
            }`}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
});

TerraProductCard.displayName = "TerraProductCard";

export default TerraProductCard;
