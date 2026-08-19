/** @type {import('next').NextConfig} */

const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
const parsedBackendApiUrl = new URL(backendApiUrl);

// ✅ R2 public bucket URL (custom domain বা r2.dev) — নতুন সব image upload এখন এখানে যায়
const r2PublicUrl = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_GOOGLE_IMAGE_HOST || "lh3.googleusercontent.com",
      },
      {
        protocol: parsedBackendApiUrl.protocol.replace(":", ""),
        hostname: parsedBackendApiUrl.hostname,
        port: parsedBackendApiUrl.port || undefined,
        pathname: "/uploads/**",
      },
      // ⚠️ পুরনো (migrate না করা) image URL গুলো এখনো res.cloudinary.com থেকে সার্ভ হয় —
      // Cloudinary অ্যাকাউন্ট চালু থাকা পর্যন্ত এই pattern রাখা দরকার।
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      ...(r2PublicUrl
        ? [
            {
              protocol: r2PublicUrl.protocol.replace(":", ""),
              hostname: r2PublicUrl.hostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

module.exports = nextConfig;
