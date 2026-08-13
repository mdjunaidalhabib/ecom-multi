import express from "express";
import { getMyFeatures } from "../../../controllers/shop/myFeatures.admin.controller.js";

const router = express.Router();

router.get("/", getMyFeatures);

export default router;
