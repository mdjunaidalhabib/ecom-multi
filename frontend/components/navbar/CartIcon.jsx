"use client";
import React from "react";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import useShopPath from "../../hooks/useShopPath";

export default function CartIcon({ cartCount, mobile }) {
  const { base } = useShopPath();
  return (
    <Link
      href={`${base}/cart`}
      className={`relative flex flex-col items-center ${mobile ? "" : ""}`}
    >
      <FaShoppingCart className="w-6 h-6" />
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
