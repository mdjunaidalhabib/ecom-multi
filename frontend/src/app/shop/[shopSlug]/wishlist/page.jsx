"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../../../../../context/CartContext";
import { apiFetch } from "../../../../../utils/api";
import ProductCard from "../../../../../components/home/ProductCard";
import CartSkeleton from "../../../../../components/skeletons/CartSkeleton"; // ✅ CartSkeleton import
import useShopPath from "../../../../../hooks/useShopPath";
import useRequireFullStorefront from "../../../../../hooks/useRequireFullStorefront";

export default function WishlistPage() {
  useRequireFullStorefront();
  const { wishlist } = useCart();
  const { base } = useShopPath();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load all products
  useEffect(() => {
    apiFetch("/products")
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  // 🔹 Filter wishlist products
  const wishlistProducts = useMemo(() => {
    return allProducts.filter((p) => wishlist.includes(String(p._id)));
  }, [allProducts, wishlist]);

  // 🌀 Skeleton loader (✅ container-এর মধ্যে)
  if (loading) {
    return (
      <div className="bg-[var(--page-bg,#fdf2f8)]">
        <div className="max-container py-3 sm:py-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // 🔹 Empty state
  if (wishlistProducts.length === 0) {
    return (
      <div className="bg-[var(--page-bg,#fdf2f8)] py-6">
        <div className="bg-[var(--page-card-bg,#fce7f3)] border border-[var(--page-card-border,transparent)] rounded-xl shadow p-6 text-center mx-3 sm:mx-auto sm:w-96">
          <p className="text-gray-500 text-lg">তোমার উইশলিস্ট খালি 😢</p>
          <Link
            href={`${base}/products`}
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            পণ্য দেখুন
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Wishlist view
  return (
    <div className="bg-[var(--page-bg,#fdf2f8)]">
      <div className="max-container py-3 md:py-6">
        <div className="text-xl sm:text-2xl font-semibold text-center relative inline-block w-full mb-8">
          <span
            className="p-4 text-transparent bg-clip-text"
            style={{ backgroundImage: "var(--page-heading-gradient, linear-gradient(to right, #ec4899, #a855f7, #2563eb))" }}
          >
            ❤️ আপনার উইশলিস্ট
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {wishlistProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
