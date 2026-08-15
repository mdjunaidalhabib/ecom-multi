import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  STAFF_PERMISSION_MODULES,
  STAFF_PERMISSION_ACTIONS,
} from "../constants/staffPermissions.js";

// ✅ প্রতিটা module (orders, products, ...) এর জন্য view/add/edit/delete —
// এই ৪টা আলাদা boolean flag থাকে।
const actionFlags = Object.fromEntries(
  STAFF_PERMISSION_ACTIONS.map((action) => [action, { type: Boolean, default: false }]),
);

const staffPermissionsSchema = new mongoose.Schema(
  Object.fromEntries(STAFF_PERMISSION_MODULES.map((moduleKey) => [moduleKey, actionFlags])),
  { _id: false },
);

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String },

    // ✅ Cloudinary avatar fields (Navbar style)
    avatar: { type: String }, // secure_url
    avatarPublicId: { type: String }, // public_id

    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "staff"],
      default: "admin",
    },

    // ✅ Multi-tenant: superadmin এর জন্য খালি থাকবে (ও সব শপ দেখে)।
    // admin/staff এর জন্য এক বা একাধিক শপ assign করা যাবে।
    shops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
      },
    ],

    status: { type: String, enum: ["active", "suspended"], default: "active" },

    // ✅ শুধু role: "staff" এর জন্য প্রযোজ্য — শপ owner (role: "admin") ঠিক
    // করে দেয় staff কোন কোন সেকশনে (orders, products, ...) view/add/edit/
    // delete করতে পারবে। owner/superadmin এর ক্ষেত্রে এই ফিল্ড ignore করা
    // হয় (তারা সব সেকশনে সবসময় সব কাজ করতে পারে) — দেখুন
    // STAFF_PERMISSION_MODULES এবং requirePermission middleware।
    permissions: {
      type: staffPermissionsSchema,
      default: () => ({}),
    },

    // ✅ Last login info
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },

    // ✅ Device / Browser / OS info
    lastLoginDevice: { type: String }, // PC / Mobile / Tablet
    lastLoginOS: { type: String }, // Windows 10 / Android 14
    lastLoginBrowser: { type: String }, // Chrome 142
    lastLoginUA: { type: String }, // full user-agent backup

    // ✅ Approx location from IP
    lastLoginLocation: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
      lat: { type: Number },
      lon: { type: Number },
    },
  },
  { timestamps: true }
);

// Hash password before save
adminSchema.pre("save", async function (next) {
  // Platform-level Super Admin must never be attached to an individual shop.
  if (this.role === "superadmin" && this.shops?.length) {
    this.shops = [];
  }

  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
