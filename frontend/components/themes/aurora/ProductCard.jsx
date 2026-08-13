"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import { FaHeart, FaPlus, FaMinus } from "react-icons/fa";
import { useCartUtils } from "../../../hooks/useCartUtils";
import { useLiveStock } from "../../../hooks/useLiveStock";
import { useInView } from "../../../hooks/useInView";
import useShopPath from "../../../hooks/useShopPath";

// Aurora: clean/minimal card — white surface, thin border, single amber
// accent. Same data/cart/wishlist/live-stock logic as the classic card
// (frontend/components/home/ProductCard.jsx), just a different look.
const AuroraProductCard = memo(({ product, priority = false }) => {
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-sm"
    >
      <Link
        href={`${base}/products/${productId}`}
        className="relative block aspect-square w-full overflow-hidden bg-neutral-50"
      >
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
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
          className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            isInWishlist
              ? "bg-amber-600 text-white"
              : "bg-white/90 text-neutral-500 hover:text-amber-600"
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
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h4 className="truncate text-sm font-medium text-neutral-900">
          {product?.name}
        </h4>

        <p className={`text-[11px] ${isOutOfStock ? "text-red-500" : "text-neutral-400"}`}>
          {isOutOfStock ? "Out of stock" : `In stock · ${totalStock}`}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <p className="text-base font-semibold text-neutral-900">
            ৳{product?.price}
          </p>
          {product?.oldPrice && (
            <p className="text-xs text-neutral-400 line-through">
              ৳{product.oldPrice}
            </p>
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
            className={`mt-1 w-full rounded-xl py-2 text-xs font-semibold tracking-wide transition ${
              isOutOfStock
                ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                : "bg-neutral-900 text-white hover:bg-amber-600"
            }`}
          >
            {isOutOfStock ? "Out of stock" : "Add to bag"}
          </button>
        ) : (
          <div className="mt-1">
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-2 py-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateCart(cartKey, -1, totalStock);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <FaMinus className="text-[9px]" />
              </button>

              <span className="text-xs font-semibold text-neutral-900">
                {quantity}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateCart(cartKey, +1, totalStock);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <FaPlus className="text-[9px]" />
              </button>
            </div>

            <p className="mt-1 text-center text-[11px] font-medium text-amber-600">
              Total: ৳{totalPrice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

AuroraProductCard.displayName = "AuroraProductCard";

export default AuroraProductCard;
