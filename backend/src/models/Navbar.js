import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const NavbarSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true, // ✅ প্রতি শপের একটাই Navbar document (singleton per shop)
    index: true,
  },
  brand: {
    name: { type: String, default: "Brand Name" },
    logo: { type: String, default: "" }, // Cloudinary URL
    logoPublicId: { type: String, default: "" }, // ✅ Cloudinary public_id
  },
  updatedAt: { type: Date, default: Date.now },
});

NavbarSchema.plugin(tenantPlugin);

const Navbar = mongoose.models.Navbar || mongoose.model("Navbar", NavbarSchema);

export default Navbar;
