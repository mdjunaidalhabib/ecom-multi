import { NextResponse } from "next/server";

const SUPER_ADMIN_URL = process.env.SUPER_ADMIN_URL || "http://localhost:3002";

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getSession(token) {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp || !payload?.role) return null;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now ? payload : null;
}

function redirectWithClearedCookie(url) {
  const response = NextResponse.redirect(url);
  response.cookies.set("admin_token", "", {
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });
  return response;
}

export function proxy(req) {
  const token = req.cookies.get("admin_token")?.value || "";
  const session = getSession(token);
  const { pathname, origin } = req.nextUrl;

  const isAdminLogin = pathname === "/login";
  const isForcedShopAccessLogin =
    isAdminLogin && req.nextUrl.searchParams.get("shopAccess") === "blocked";

  // A logged-in shop admin/staff shouldn't remain on the login page.
  if (isAdminLogin) {
    // A shop can be deleted/suspended while its old JWT is still present in
    // the browser. Let the session guard force-open the login page and clear
    // that stale cookie instead of bouncing back to /admin/dashboard.
    if (isForcedShopAccessLogin) {
      const response = NextResponse.next();
      response.cookies.set("admin_token", "", {
        path: "/",
        expires: new Date(0),
        sameSite: "lax",
      });
      return response;
    }

    if (!session) return NextResponse.next();

    // A superadmin cookie can still be present here on shared-`localhost`
    // dev setups (cookies aren't port-scoped), so send it to its own app
    // instead of looping it into the shop-admin dashboard.
    if (session.role === "superadmin") {
      return NextResponse.redirect(`${SUPER_ADMIN_URL}/dashboard`);
    }

    return NextResponse.redirect(`${origin}/admin/dashboard`);
  }

  // Shop admin/staff portal.
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return redirectWithClearedCookie(`${origin}/login`);
    }

    if (session.role === "superadmin") {
      return NextResponse.redirect(`${SUPER_ADMIN_URL}/dashboard`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
