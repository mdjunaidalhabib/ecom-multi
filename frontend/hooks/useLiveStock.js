"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

/**
 * ✅ Micro-batches every productId requested within the same short
 * window into a single `/products/stock?ids=a,b,c` call, instead of one
 * request per mounted <ProductCard>. A product grid can mount 100+ cards
 * at once — one request per card flooded the backend's shared IP rate
 * limiter (server.js) within seconds and started 429-blocking unrelated
 * routes on the same IP, including admin login.
 */
const BATCH_DELAY_MS = 40;
const MAX_IDS_PER_REQUEST = 150;

let pendingIds = new Set();
let pendingListeners = new Map(); // id -> [callback, ...]
let pendingTimer = null;

function scheduleBatch() {
  if (pendingTimer) return;
  pendingTimer = setTimeout(runBatch, BATCH_DELAY_MS);
}

async function runBatch() {
  const ids = Array.from(pendingIds).slice(0, MAX_IDS_PER_REQUEST);
  const listeners = pendingListeners;

  // ✅ leave anything beyond the cap (and anything added mid-flight) for
  // the next batch instead of dropping it
  ids.forEach((id) => pendingIds.delete(id));
  pendingTimer = null;
  if (pendingIds.size) scheduleBatch();

  if (!ids.length) return;

  const resolve = (id, result) => {
    const cbs = listeners.get(id);
    if (!cbs) return;
    listeners.delete(id);
    cbs.forEach((cb) => cb(result));
  };

  try {
    const data = await apiFetch(
      `/products/stock?ids=${ids.map(encodeURIComponent).join(",")}`,
    );
    const byId = new Map(
      (Array.isArray(data) ? data : []).map((p) => [String(p._id), p]),
    );
    ids.forEach((id) => resolve(id, byId.get(id) || null));
  } catch {
    ids.forEach((id) => resolve(id, null));
  }
}

function requestLiveStock(id, callback) {
  pendingIds.add(id);
  if (!pendingListeners.has(id)) pendingListeners.set(id, []);
  pendingListeners.get(id).push(callback);
  scheduleBatch();
}

function cancelLiveStockRequest(id, callback) {
  const cbs = pendingListeners.get(id);
  if (!cbs) return;
  const next = cbs.filter((cb) => cb !== callback);
  if (next.length) pendingListeners.set(id, next);
  else pendingListeners.delete(id);
}

/**
 * Live (uncached) stock/sold for a single product — bypasses both the
 * backend's 30s micro-cache and Next.js's fetch cache (via apiFetch ->
 * /api proxy -> cache: "no-store"), so a page reload always shows the
 * true current stock even though the rest of the product data
 * (name/images/price/etc.) still comes from the cached server-rendered
 * fetch. Requests from many components mounted together are batched —
 * see above.
 */
export function useLiveStock(productId) {
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLive(null);
      return;
    }

    let alive = true;
    setLive(null);

    const callback = (result) => {
      if (alive) setLive(result);
    };

    requestLiveStock(productId, callback);

    return () => {
      alive = false;
      cancelLiveStockRequest(productId, callback);
    };
  }, [productId]);

  return live;
}
