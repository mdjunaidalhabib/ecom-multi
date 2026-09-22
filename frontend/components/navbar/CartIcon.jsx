"use client";
import React from "react";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import useShopPath from "../../hooks/useShopPath";

// `outline` (opt-in, used by the Shop Start navbar): stroke-only cart that
// fills in on hover — or stays filled when `filled` is set (e.g. active tab on
// touch screens, where there is no hover).
export default function CartIcon({ cartCount, mobile, outline, filled }) {
  const { base } = useShopPath();
  return (
    <Link
      href={`${base}/cart`}
      className={`group relative flex flex-col items-center ${mobile ? "" : ""}`}
    >
      {outline ? (
        <ShoppingCart
          className={`w-6 h-6 transition-colors duration-200 group-hover:fill-current ${filled ? "fill-current" : ""}`}
        />
      ) : (
        <FaShoppingCart className="w-6 h-6" />
      )}
      {cartCount > 0 && (
        <span
          className={`absolute ${
            mobile
              ? "-top-1 -right-2 text-xs px-1.5"
              : "-top-2 -right-3 text-xs px-2 py-0.5"
          } bg-red-500 text-white rounded-full`}
        >
          {cartCount}
        </span>
      )}
      {mobile && <span>Cart</span>}
    </Link>
  );
}
