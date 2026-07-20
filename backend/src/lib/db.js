import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    // 🔥 FIX: pool size আগে explicit ছিল না (mongoose default maxPoolSize=100)।
    // PM2 cluster mode-এ একাধিক worker চললে প্রতিটা worker-এর নিজস্ব pool
    // থাকে — worker সংখ্যা × maxPoolSize যেন MongoDB/Atlas-এর connection
    // limit না ছাড়িয়ে যায় সেটা এখন explicit ভাবে কনফিগারযোগ্য।
    // ছোট VPS/shared MongoDB-তে যদি worker সংখ্যা বেশি হয়, .env-এ
    // DB_MAX_POOL_SIZE কমিয়ে দিন (যেমন 10-20)।
    await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE) || 50,
      minPoolSize: Number(process.env.DB_MIN_POOL_SIZE) || 5,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log(
      `   pool size: min=${Number(process.env.DB_MIN_POOL_SIZE) || 5}, max=${
        Number(process.env.DB_MAX_POOL_SIZE) || 50
      }`
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error("🔥 MongoDB Connection Error:", err.message);
      console.error(err);
    } else {
      console.error("🔥 MongoDB Unknown Error:", err);
    }

    process.exit(1);
  }
};

export default connectDB;