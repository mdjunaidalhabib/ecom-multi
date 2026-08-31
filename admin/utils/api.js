// frontend/utils/api.js

const NOTICE_STORAGE_KEY = "shop_access_notice";

export async function apiFetch(path, options = {}) {
  const baseUrl = "/api";
  const url = `${baseUrl}${path}`;

  try {
    const res = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    // 🔒 Unauthorized / token expired
    if (res.status === 401) {
      try {
        // backend logout → cookie clear
        await fetch(`${baseUrl}/admin/logout`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        // ignore
      }

      // ✅ client-side full cleanup
      if (typeof window !== "undefined") {
        document.cookie =
          "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "active_shop_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {}

        try {
          if ("caches" in window) {
            const cacheNames = await caches.keys();

            await Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName)),
            );
          }
        } catch {}

        // ✅ hard redirect
        window.location.replace("/login");
      }

      throw new Error("Session expired");
    }

    // 🔒 Shop suspended mid-session — same cleanup as 401, plus a notice for
    // the login page (backend/src/utils/adminShopAccess.js buildSuspendedShopResponse).
    // ✅ Non-2xx body is parsed ONCE here (a Response body can only be read
    // once) and reused below for both the SHOP_SUSPENDED check and the
    // generic error-message extraction — previously a second res.text()
    // call after this res.json() always failed on the already-consumed
    // stream and silently swallowed the real backend message.
    let errorBody = null;
    if (!res.ok && res.status !== 401) {
      errorBody = await res.json().catch(() => null);
    }

    if (res.status === 403 && errorBody?.errorType === "SHOP_SUSPENDED") {
      const body = errorBody;
      try {
        await fetch(`${baseUrl}/admin/logout`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        // ignore
      }

      if (typeof window !== "undefined") {
        document.cookie =
          "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "active_shop_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        try {
          localStorage.clear();
          sessionStorage.setItem(
            NOTICE_STORAGE_KEY,
            JSON.stringify({
              errorType: body.errorType,
              message: body.message,
              contactMessage: body.contactMessage,
              suspension: body.suspension,
            }),
          );
        } catch {}

        window.location.replace("/login?shopAccess=blocked");
      }

      throw new Error("Shop suspended");
    }

    // ❌ Other API errors — backend routes use either `message` or `error`
    // as the field name (both are common across this codebase), so check
    // both. Falls back to statusText if the body wasn't JSON at all (e.g.
    // a proxy/network-level error page).
    if (!res.ok) {
      const message =
        errorBody?.message ||
        errorBody?.error ||
        res.statusText ||
        "Unknown error";

      const apiError = new Error(message);
      // ✅ so callers (e.g. showToast(err.message)) show the actual
      // backend reason instead of a generic string
      apiError.status = res.status;
      apiError.data = errorBody;
      throw apiError;
    }

    // ✅ Success
    return await res.json();
  } catch (err) {
    throw err;
  }
}
