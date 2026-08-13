"use client";

import Link from "next/link";
import useShopPath from "../../hooks/useShopPath";

export default function ProductBreadcrumb({ product, categories = [] }) {
  const { base } = useShopPath();
  const category = Array.isArray(categories) ? categories[0] : null;
  return (
    <nav className="text-xs md:text-sm text-gray-500 mb-4">
      <Link href={base || "/"} className="hover:underline">
        Home
      </Link>
      <span className="mx-2">/</span>

      {category && (
        <>
          <Link
            href={`${base}/categories/${category._id}`}
            className="hover:underline"
          >
            {category.name}
          </Link>
          <span className="mx-2">/</span>
        </>
      )}

      <span className="text-gray-700">{product.name}</span>
    </nav>
  );
}
