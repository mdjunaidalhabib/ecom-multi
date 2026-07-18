import Admin from "../../src/models/Admin.js";
import About from "../../src/models/About.js";
import Analytics from "../../src/models/Analytics.js";
import Category from "../../src/models/Category.js";
import CourierSetting from "../../src/models/CourierSetting.js";
import DeliveryCharge from "../../src/models/DeliveryCharge.js";
import FacebookGroup from "../../src/models/FacebookGroup.js";
import FloatingActionButton from "../../src/models/FloatingActionButton.js";
import Footer from "../../src/models/Footer.js";
import HomeBadge from "../../src/models/HomeBadge.js";
import Navbar from "../../src/models/Navbar.js";
import Order from "../../src/models/Order.js";
import OrderMailSend from "../../src/models/order-mail-send.js";
import PaymentMethod from "../../src/models/PaymentMethod.js";
import Product from "../../src/models/Product.js";
import Slider from "../../src/models/Slider.js";
import Trash from "../../src/models/Trash.js";
import User from "../../src/models/User.js";
import {
  deleteFromCloudinary,
  deleteByPublicId,
} from "../cloudinary/cloudinaryHelpers.js";

async function cleanupAssetGroup(collectionName, data) {
  try {
    if (collectionName === "Product") {
      if (data.image) await deleteFromCloudinary(data.image);
      for (const url of data.images || []) await deleteFromCloudinary(url);
      for (const color of data.colors || []) {
        for (const url of color.images || []) await deleteFromCloudinary(url);
      }
    } else if (collectionName === "Category") {
      if (data.imagePublicId) await deleteByPublicId(data.imagePublicId);
      else if (data.image) await deleteFromCloudinary(data.image);
    } else if (collectionName === "Slider") {
      if (data.srcPublicId) await deleteByPublicId(data.srcPublicId);
    }
  } catch (err) {
    console.error("⚠️ Shop permanent-delete asset cleanup failed:", err);
  }
}

const TENANT_MODELS = [
  About,
  Analytics,
  Category,
  CourierSetting,
  DeliveryCharge,
  FacebookGroup,
  FloatingActionButton,
  Footer,
  HomeBadge,
  Navbar,
  Order,
  OrderMailSend,
  PaymentMethod,
  Product,
  Slider,
  User,
];

/**
 * Permanently removes every record and external asset that belongs to a shop.
 * This is only called when a Shop trash entry is manually deleted forever or
 * reaches its 3-day expiry time.
 */
export async function permanentlyDeleteShopData(shopId) {
  const id = String(shopId);

  // Active assets must be removed before their database records disappear.
  const [products, categories, sliders] = await Promise.all([
    Product.find({ shopId: id }).setOptions({ skipTenantScope: true }).lean(),
    Category.find({ shopId: id }).setOptions({ skipTenantScope: true }).lean(),
    Slider.find({ shopId: id }).setOptions({ skipTenantScope: true }).lean(),
  ]);

  for (const product of products) {
    await cleanupAssetGroup("Product", product);
  }
  for (const category of categories) {
    await cleanupAssetGroup("Category", category);
  }
  for (const slider of sliders) {
    await cleanupAssetGroup("Slider", slider);
  }

  // Items already inside this shop's recycle bin may also own assets.
  const tenantTrashEntries = await Trash.find({
    shopId: id,
    collectionName: { $ne: "Shop" },
  }).setOptions({ skipTenantScope: true });

  for (const entry of tenantTrashEntries) {
    await cleanupAssetGroup(entry.collectionName, entry.data);
  }

  await Promise.all(
    TENANT_MODELS.map((Model) =>
      Model.deleteMany({ shopId: id }).setOptions({ skipTenantScope: true }),
    ),
  );

  await Trash.deleteMany({
    shopId: id,
    collectionName: { $ne: "Shop" },
  }).setOptions({ skipTenantScope: true });

  // Remove stale shop assignments from every non-platform account.
  await Admin.updateMany({ shops: id }, { $pull: { shops: id } });
}
