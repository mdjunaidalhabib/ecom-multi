import express from "express";
import { productUpload } from "../../../utils/r2/upload.js";
import {
  createProduct,
  getProductsAdmin,
  getProductByIdAdmin,
  updateProduct,
  deleteProduct,
  bulkSetProductVisibility,
} from "../../../controllers/product/index.js";

const router = express.Router();

router.post("/", productUpload.any(), createProduct);
router.get("/", getProductsAdmin);
router.patch("/bulk-visibility", bulkSetProductVisibility);
router.get("/:id", getProductByIdAdmin);
router.put("/:id", productUpload.any(), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
