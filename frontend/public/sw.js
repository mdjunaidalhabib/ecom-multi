const CACHE_NAME = "openup-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // পুরনো cache version (যেমন "openup-v1", RSC payload-সহ) মুছে ফেলা — নাহলে
  // ব্যবহারকারীর ডিভাইসে সেই ভাঙা cache চিরদিন পড়ে থাকতো।
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // শুধু same-origin GET request handle করবে
  if (req.method !== "GET" || url.origin !== location.origin) return;

  // Next.js App Router-এর নিজস্ব client-side navigation (Link ক্লিক/prefetch)
  // এই একই URL-এ একটা আলাদা "RSC" fetch পাঠায় (header: RSC/Next-Router-Prefetch,
  // অথবা "_rsc" query param) — পেজের আসল HTML নয়, শুধু ছোট একটা flight payload।
  // এটা cache-এ ধরে রাখলে বা network first-এর মধ্যে ফেলে দিলে পরের নেভিগেশনে
  // পুরনো/ভাঙা payload ফেরত যেতে পারে, ফলে ক্লিক করার পর পেজ পাল্টায় না — ম্যানুয়াল
  // রিফ্রেশ (আসল document request, RSC নয়) দিলেই তখন ঠিকমতো লোড হয়। তাই এই
  // request গুলো সম্পূর্ণ untouched রেখে ব্রাউজারকে সরাসরি নেটওয়ার্কে যেতে দেওয়া হলো।
  const isRscRequest =
    req.headers.has("RSC") ||
    req.headers.has("Next-Router-Prefetch") ||
    req.headers.has("Next-Router-State-Tree") ||
    url.searchParams.has("_rsc");
  if (isRscRequest) return;

  // Static assets cache
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        const res = await fetch(req);
        cache.put(req, res.clone()).catch(() => {});
        return res;
      }),
    );
    return;
  }

  // Network first — redirect/opaque response cache-এ put করলে Cache API throw
  // করে (unhandled rejection), তাই সেগুলো put না করে শুধু network থেকে ফেরত দেওয়া হয়।
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.type === "opaqueredirect" || res.redirected || !res.ok) return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
