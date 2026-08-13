"use client";
import React from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import useShopPath from "../../hooks/useShopPath";

export default function WishlistIcon({ wishlistCount, mobile }) {
  const { base } = useShopPath();
  return (
    <Link
      href={`${base}/wishlist`}
      className={`relative flex flex-col items-center ${mobile ? "" : ""}`}
    >
      <FaHeart className="w-6 h-6" />
      {wishlistCount > 0 && (
        <span
          className={`absolute ${
            mobile ? "-top-1 right-1 text-xs px-1.5" : "-top-2 -right-3 text-xs px-2 py-0.5"
          } bg-red-500 text-white rounded-full`}
        >
          {wishlistCount}
        </span>
      )}
      {mobile && <span>Wishlist</span>}
    </Link>
  );
}
