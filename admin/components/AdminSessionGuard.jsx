"use client";

import { useEffect, useRef } from "react";

const SESSION_CHECK_INTERVAL_MS = 10_000;
const NOTICE_STORAGE_KEY = "shop_access_notice";

function clearClientSession(suspensionNotice = null) {
  try {
    localStorage.clear();
    sessionStorage.clear();

    if (suspensionNotice) {
      sessionStorage.setItem(
        NOTICE_STORAGE_KEY,
        JSON.stringify(suspensionNotice),
      );
    }
  } catch {
    // Storage may be unavailable in private/restricted browser modes.
  }

  document.cookie =
    "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export default function AdminSessionGuard() {
  const checkingRef = useRef(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    const checkSession = async () => {
      if (
        disposed ||
        redirectedRef.current ||
        checkingRef.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      checkingRef.current = true;

      try {
        const response = await fetch("/api/admin/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.ok || disposed) return;
        if (![401, 403].includes(response.status)) return;

        const data = await response.json().catch(() => ({}));
        const suspensionNotice =
          data?.errorType === "SHOP_SUSPENDED"
            ? {
                errorType: data.errorType,
                message: data.message,
                contactMessage: data.contactMessage,
                suspension: data.suspension,
              }
            : null;

        redirectedRef.current = true;
        clearClientSession(suspensionNotice);
        window.location.replace("/login?shopAccess=blocked");
      } catch {
        // A temporary network failure must not log the admin out.
      } finally {
        checkingRef.current = false;
      }
    };

    checkSession();
    const intervalId = window.setInterval(
      checkSession,
      SESSION_CHECK_INTERVAL_MS,
    );

    const handleFocus = () => checkSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkSession();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
