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
    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));

      if (body?.errorType === "SHOP_SUSPENDED") {
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
    }

    // ❌ Other API errors
    if (!res.ok) {
      let errorText = "";

      try {
        errorText = await res.text();
      } catch {
        errorText = "Unknown error";
      }

      throw new Error(
        `API error: ${res.status} ${res.statusText} → ${errorText}`,
      );
    }

    // ✅ Success
    return await res.json();
  } catch (err) {
    throw err;
  }
}
