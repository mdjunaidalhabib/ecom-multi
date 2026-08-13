import express from "express";
import {
  getProductsPublic,
  getProductByIdPublic,
  getProductsByCategoryPublic,
  getProductsStockPublic,
  addReviewToProduct,
  updateProductReview,
  deleteProductReview,
} from "../../../controllers/product/index.js";

import { userProtect } from "../../middlewares/userProtect.js";
import { cacheResponse } from "../../middlewares/cacheResponse.js";

const router = express.Router();

// ✅ NOT cached — always fresh, so stock can be instant while everything
// else stays on the 30s micro-cache below. Must be registered before
// "/:id" so it isn't captured as a product id.
router.get("/stock", getProductsStockPublic);

router.get("/", cacheResponse(), getProductsPublic);
router.get("/category/:categoryId", cacheResponse(), getProductsByCategoryPublic);
router.get("/:id", cacheResponse(), getProductByIdPublic);

router.post("/:id/review", userProtect, addReviewToProduct);
router.put("/:id/review/:reviewId", userProtect, updateProductReview);
router.delete("/:id/review/:reviewId", userProtect, deleteProductReview);

export default router;
