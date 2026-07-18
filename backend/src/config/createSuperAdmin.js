import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const createSuperAdmin = async () => {
  try {
    const name = process.env.SUPER_ADMIN_NAME?.trim();
    const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      console.warn(
        "⚠️ SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required",
      );
      return;
    }

    let admin = await Admin.findOne({ email });

    if (!admin) {
      admin = await Admin.create({
        name,
        email,
        password,
        role: "superadmin",
        shops: [],
      });

      console.log(`🟢 Super Admin created: ${admin.email}`);
      return;
    }

    let updated = false;

    if (admin.name !== name) {
      admin.name = name;
      updated = true;
    }

    if (admin.role !== "superadmin") {
      admin.role = "superadmin";
      updated = true;
    }

    // A platform Super Admin is never a tenant/shop member.
    if (admin.shops?.length) {
      admin.shops = [];
      updated = true;
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      admin.password = password;
      updated = true;
    }

    if (updated) {
      await admin.save();
      console.log(`🟢 Super Admin synchronized: ${admin.email}`);
    } else {
      console.log(`🟡 Super Admin is up to date: ${admin.email}`);
    }
  } catch (err) {
    console.error("❌ Super Admin setup failed:", err);
  }
};

export default createSuperAdmin;
