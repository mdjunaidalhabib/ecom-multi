# ─────────────────────────────────────────────────────────────
# Next.js standalone multi-stage build (Coolify → Build Pack: Dockerfile)
# Stage ১: deps    → শুধু dependencies ইনস্টল (layer cache হয়, পরের build দ্রুত)
# Stage ২: builder → next build (NEXT_PUBLIC_* এখানেই কোডে বসে যায়)
# Stage ৩: runner  → শুধু .next/standalone + static + public — ছোট image
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
# কিছু native package (যেমন sharp) alpine-এ glibc compat চায়
RUN apk add --no-cache libc6-compat

# ---------- deps ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ⚠️ Build-time variables — Coolify-তে এগুলোতে "Is Build Variable?" টিক দিতে হবে।
# NEXT_PUBLIC_* ব্রাউজার কোডে inline হয়; BACKEND_API_URL/R2_PUBLIC_URL দিয়ে
# next.config-এর image remotePatterns তৈরি হয়; PLATFORM_DOMAIN edge middleware-এ লাগে।
ARG BACKEND_API_URL
ARG R2_PUBLIC_URL
ARG NEXT_PUBLIC_GOOGLE_IMAGE_HOST
ARG PLATFORM_DOMAIN
ENV BACKEND_API_URL=$BACKEND_API_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV NEXT_PUBLIC_GOOGLE_IMAGE_HOST=$NEXT_PUBLIC_GOOGLE_IMAGE_HOST
ENV PLATFORM_DOMAIN=$PLATFORM_DOMAIN
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- runner ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# root হিসেবে না চালিয়ে আলাদা user — নিরাপত্তার জন্য
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
