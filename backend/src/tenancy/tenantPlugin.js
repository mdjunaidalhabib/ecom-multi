import { getCurrentShopId } from "./shopContext.js";

/**
 * ✅ tenantPlugin
 * যেকোনো tenant-scoped schema-তে `schema.plugin(tenantPlugin)` বসালে:
 *  - find/findOne/findOneAndUpdate/findOneAndDelete/updateMany/countDocuments/deleteMany
 *    ইত্যাদি সব query-তে automatically `shopId` filter যোগ হবে
 *    (request context-এ shopId থাকলে — দেখুন shopContext.js)
 *  - নতুন document save করার সময় shopId না থাকলে ও context-এ shopId
 *    থাকলে সেটা বসিয়ে দেবে
 *  - aggregate() pipeline-এর একদম শুরুতে $match: { shopId } বসিয়ে দেবে
 *
 * ইচ্ছাকৃতভাবে scope skip করতে চাইলে (যেমন: superadmin cross-shop রিপোর্ট):
 *   Model.find(filter).setOptions({ skipTenantScope: true })
 *   Model.aggregate(pipeline, { skipTenantScope: true })
 *
 * ⚠️ এটা controller-এ shopId filter করার প্রয়োজনীয়তা দূর করে না —
 * এটা একটা সেফটি নেট, প্রধান লজিক না।
 */
const QUERY_HOOKS = [
  "find",
  "findOne",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndRemove",
  "count",
  "countDocuments",
  "updateOne",
  "updateMany",
  "deleteOne",
  "deleteMany",
];

export default function tenantPlugin(schema, options = {}) {
  const { pathName = "shopId" } = options;

  QUERY_HOOKS.forEach((hook) => {
    schema.pre(hook, function () {
      if (this.getOptions().skipTenantScope) return;

      const existing = this.getQuery()[pathName];
      const contextShopId = getCurrentShopId();

      // Query-তে explicit shopId দেওয়া থাকলে সেটাই থাকুক (override করব না),
      // না থাকলে context থেকে বসিয়ে দেব।
      if (!existing && contextShopId) {
        this.where({ [pathName]: contextShopId });
      }
    });
  });

  const applyTenantIdToDocument = function (next) {
    if (!this[pathName]) {
      const contextShopId = getCurrentShopId();
      if (contextShopId) this[pathName] = contextShopId;
    }
    next();
  };

  // Mongoose validation runs before normal pre("save") hooks. Because shopId is
  // required on tenant models, it must be injected during pre("validate") or a
  // newly created document fails with: "Path `shopId` is required".
  schema.pre("validate", applyTenantIdToDocument);
  schema.pre("save", applyTenantIdToDocument);

  schema.pre("aggregate", function () {
    if (this.options.skipTenantScope) return;

    const contextShopId = getCurrentShopId();
    if (!contextShopId) return;

    const pipeline = this.pipeline();
    const alreadyScoped = pipeline.some(
      (stage) => stage.$match && Object.prototype.hasOwnProperty.call(stage.$match, pathName),
    );
    if (!alreadyScoped) {
      pipeline.unshift({ $match: { [pathName]: contextShopId } });
    }
  });
}
