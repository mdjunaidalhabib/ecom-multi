// ✅ ADMIN (READ + BULK)
export {
  getProductsAdmin,
  getProductByIdAdmin,
  bulkSetProductVisibility,
} from "./admin.product.controller.js";

export {
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.controller.js";

export * from "./public.product.controller.js";
export * from "./review.controller.js";
