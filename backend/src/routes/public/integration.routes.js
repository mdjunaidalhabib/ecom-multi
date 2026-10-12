import express from "express";
import { requireIntegrationKey } from "../../middlewares/integrationAuth.js";
import { provisionShopController, revokeShopController } from "../../../controllers/shop/integration.provision.controller.js";

const router = express.Router();

// শুধু সার্ভার-টু-সার্ভার (Hikmah IT backend) — ব্রাউজার থেকে কল করার জন্য না
router.post("/provision-shop", requireIntegrationKey, provisionShopController);
router.post("/revoke-shop", requireIntegrationKey, revokeShopController);

export default router;
