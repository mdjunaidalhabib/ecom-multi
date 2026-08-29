"use client";

export default function ProductCard({ product, onEdit, onDelete }) {
  const cats = Array.isArray(product?.categories) ? product.categories : [];
  const isHidden = product?.isActive === false;

  // ✅ Total Variants Count (colors)
  const totalVariants = Array.isArray(product?.colors)
    ? product.colors.length
    : 0;

  // ✅ Total Sold
  const totalSold =
    totalVariants > 0
      ? product.colors.reduce((sum, v) => sum + Number(v?.sold || 0), 0)
      : Number(product?.sold || 0);

  // ✅ Total Stock
  const totalStock =
    product?.stock !== undefined && product?.stock !== null
      ? Number(product.stock || 0)
      : totalVariants > 0
        ? product.colors.reduce((sum, v) => sum + Number(v?.stock || 0), 0)
        : 0;

  const displayImage = product?.image || "";

  // ✅ Multi-variant প্রোডাক্টে প্রতিটা variant-এর price ভিন্ন হতে পারে,
  // তাই একটামাত্র price না দেখিয়ে min-max রেঞ্জ দেখানো হয়
  const variantPrices =
    totalVariants > 0
      ? product.colors.map((v) => Number(v?.price || 0)).filter((p) => p > 0)
      : [];
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
  const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0;
  const hasPriceRange = variantPrices.length > 0 && minPrice !== maxPrice;

  const hasDiscount = !!product?.oldPrice;

  // ✅ Admin-only ক্রয় মূল্য ও profit margin — public API তে costPrice কখনো
  // আসে না, তাই এখানে undefined হলে ব্লক render করা হয় না।
  const hasCostPrice =
    product?.costPrice !== undefined &&
    product?.costPrice !== null &&
    product?.costPrice !== "";
  const costPrice = hasCostPrice ? Number(product.costPrice) : 0;
  const sellPrice = Number(product?.price || 0);
  const profit = sellPrice - costPrice;
  const profitPct = costPrice > 0 ? Math.round((profit / costPrice) * 100) : null;

  return (
    <div
      className={`group relative flex flex-col rounded-xl border overflow-hidden transition-all duration-200
        ${
          isHidden
            ? "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-75"
            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md"
        }
      `}
    >
      {/* 🖼️ Image */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-slate-800">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300
              ${isHidden ? "grayscale-[30%]" : "group-hover:scale-[1.03]"}
            `}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-600 text-xs font-medium">
            No Image
          </div>
        )}

        {/* Top-left: serial */}
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-[9px] font-medium">
          #{product.order || 0}
        </span>

        {/* Top-right: active / hidden status */}
        <span
          className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[9px] font-semibold tracking-wide ${
            product.isActive
              ? "bg-green-600/85 text-white"
              : "bg-gray-900/80 text-white"
          }`}
        >
          {product.isActive ? "Active" : "Hidden"}
        </span>

        {/* Bottom-left: color variant dots */}
        {totalVariants > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm px-1.5 py-1 rounded-full shadow-sm">
            {product.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800 ring-1 ring-gray-300 dark:ring-slate-600"
                style={{ backgroundColor: c.name?.toLowerCase() }}
                title={c.name}
              />
            ))}
            {totalVariants > 4 && (
              <span className="text-[9px] font-bold text-gray-600 dark:text-slate-400 pr-0.5">
                +{totalVariants - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 📋 Content */}
      <div className="flex flex-col gap-1 p-2 flex-1">
        {/* Name + Price — same line */}
        <div className="flex items-start justify-between gap-1.5">
          <h2
            className="font-semibold text-[13px] leading-snug text-gray-900 dark:text-slate-100 truncate"
            title={product.name}
          >
            {product.name}
          </h2>
          <div className="flex items-baseline gap-1 shrink-0">
            {hasPriceRange ? (
              <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                ৳{minPrice} - ৳{maxPrice}
              </span>
            ) : (
              <>
                <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                  ৳{product.price}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] line-through text-gray-400 dark:text-slate-500">
                    ৳{product.oldPrice}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stock + Total Sold */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
          <span>স্টক: {totalStock}</span>
          <span>Total Sold: {totalSold}</span>
        </div>

        {/* 🔒 Admin-only ক্রয় মূল্য / প্রফিট — কাস্টমার কখনো দেখতে পাবে না */}
        {hasCostPrice && (
          <div className="flex items-center justify-between gap-1 rounded-md border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-1">
            <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-700 dark:text-amber-400">
              🔒 ক্রয়: ৳{costPrice}
            </span>
            <span
              className={`text-[9px] font-bold ${
                profit >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              লাভ: ৳{profit}
              {profitPct !== null && <> ({profitPct}%)</>}
            </span>
          </div>
        )}

        {/* Variant wise Sold List */}
        {totalVariants > 0 && (
          <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-md p-1">
            <div className="flex flex-wrap gap-1">
              {product.colors.map((v, idx) => (
                <span
                  key={idx}
                  className="text-[9px] px-1 py-0.5 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300"
                  title={`${v.name} — ৳${Number(v?.price || 0)}`}
                >
                  {v.name}: ৳{Number(v?.price || 0)} · <b>{Number(v?.sold || 0)}</b> sold
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Variants count (only, since Serial/Active moved to image) */}
        {totalVariants > 0 && (
          <span className="self-start px-1.5 py-[1px] rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[9px] font-medium">
            {totalVariants} Variants
          </span>
        )}

        {/* Category + Rating */}
        <div className="flex items-center justify-between gap-1 text-[10px] text-gray-500 dark:text-slate-400">
          <span className="flex flex-wrap items-center gap-1 min-w-0">
            {cats.length > 0 ? (
              <>
                {cats.slice(0, 2).map((c) => (
                  <span
                    key={c._id}
                    className="font-medium text-gray-700 dark:text-slate-300 truncate max-w-[5.5rem]"
                  >
                    {c.name}
                  </span>
                ))}
                {cats.length > 2 && (
                  <span className="font-semibold text-gray-500 dark:text-slate-400">
                    +{cats.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 dark:text-slate-500">ক্যাটাগরি নেই</span>
            )}
          </span>
          <span className="flex items-center gap-0.5 shrink-0 text-gray-600 dark:text-slate-400 font-medium">
            ⭐ {product.rating || 0}
          </span>
        </div>

        {/* Actions — icon only on mobile, icon+text from sm up */}
        <div className="flex gap-1.5 mt-auto pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="সম্পাদনা"
            className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white py-1.5 rounded-md text-xs font-semibold transition"
          >
            <span>✏</span>
            <span className="hidden sm:inline">সম্পাদনা</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="মুছুন"
            className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white py-1.5 rounded-md text-xs font-semibold transition"
          >
            <span>🗑</span>
            <span className="hidden sm:inline">মুছুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
