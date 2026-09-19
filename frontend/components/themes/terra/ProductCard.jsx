"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import { FaHeart, FaPlus, FaMinus, FaShoppingBasket } from "react-icons/fa";
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
  const totalPrice = Number(product?.price || 0) * quantity;

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

  return (
    <div
      ref={cardRef}
      className="group flex flex-col overflow-hidden rounded-xl bg-[var(--theme-surface)] ring-1 ring-[var(--theme-text)]/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--theme-secondary)]/10 hover:ring-[var(--theme-accent)]/50"
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

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(productId);
          }}
          aria-label="Toggle wishlist"
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${
            isInWishlist
              ? "bg-[var(--theme-primary)] text-white"
              : "bg-white/95 text-stone-400 hover:text-[var(--theme-primary)]"
          }`}
        >
          <FaHeart className="h-3 w-3" />
        </button>

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

        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <p className="text-lg font-semibold tabular-nums text-[var(--theme-primary)]">
            ৳{product?.price}
          </p>
          {product?.oldPrice && (
            <p className="text-xs tabular-nums text-stone-400 line-through">৳{product.oldPrice}</p>
          )}
        </div>

        {!quantity ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateCart(cartKey, +1, totalStock);
            }}
            disabled={isOutOfStock}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
              isOutOfStock
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-secondary)]"
            }`}
          >
            <FaShoppingBasket className="h-3 w-3" />
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </button>
        ) : (
          <div className="mt-2">
            <div className="flex items-center justify-between rounded-lg border border-[var(--theme-primary)]/25 bg-[var(--theme-primary)]/5 px-2 py-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateCart(cartKey, -1, totalStock);
                }}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[var(--theme-primary)] shadow-sm ring-1 ring-[var(--theme-text)]/10"
              >
                <FaMinus className="text-[9px]" />
              </button>

              <span className="text-xs font-semibold tabular-nums text-[var(--theme-text)]">{quantity}</span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateCart(cartKey, +1, totalStock);
                }}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[var(--theme-primary)] shadow-sm ring-1 ring-[var(--theme-text)]/10"
              >
                <FaPlus className="text-[9px]" />
              </button>
            </div>

            <p className="mt-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-accent)]">
              Total: ৳{totalPrice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

TerraProductCard.displayName = "TerraProductCard";

export default TerraProductCard;
