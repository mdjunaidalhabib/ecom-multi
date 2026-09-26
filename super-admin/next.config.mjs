import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Docker-এর জন্য: শুধু চালাতে যা লাগে সেটুকু .next/standalone-এ কপি হয় — image অনেক ছোট হয়
  output: "standalone",
  // রুটেও package-lock আছে, তাই tracing root এই অ্যাপের ফোল্ডারে আটকে রাখা হলো
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
