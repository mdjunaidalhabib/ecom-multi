import { NextResponse } from "next/server";

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

function clearCookie(response, name) {
  response.cookies.set(name, "", {
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });
  return response;
}

function redirectWithClearedCookie(url) {
  return clearCookie(NextResponse.redirect(url), "super_admin_token");
}

// Before this app got its own cookie name, a superadmin session lived under
// "admin_token" (shared with the shop-admin app). Only a superadmin-role JWT
// under that old name is a leftover worth wiping — a shop admin/staff logged
// in on the same browser also carries a valid "admin_token", and that one
// must be left alone or browsing this app would silently log them out.
function clearLegacyCookie(response, req) {
  const legacyToken = req.cookies.get("admin_token")?.value;
  const legacySession = getSession(legacyToken);

  if (legacySession?.role === "superadmin") {
    clearCookie(response, "admin_token");
  }

  return response;
}

export function proxy(req) {
  const token = req.cookies.get("super_admin_token")?.value || "";
  const session = getSession(token);
  const { pathname, origin } = req.nextUrl;

  const isLogin = pathname === "/login";

  // Logged-in super admins should not remain on the login page.
  if (isLogin) {
    if (session?.role === "superadmin") {
      return clearLegacyCookie(NextResponse.redirect(`${origin}/dashboard`), req);
    }
    return clearLegacyCookie(NextResponse.next(), req);
  }

  // Everything else in this app is the super admin panel — only a
  // superadmin session may pass. Any other (or missing) session gets
  // bounced to login, clearing a stale/wrong-role cookie on the way out.
  if (!session || session.role !== "superadmin") {
    return clearLegacyCookie(redirectWithClearedCookie(`${origin}/login`), req);
  }

  return clearLegacyCookie(NextResponse.next(), req);
}

// (panel) is a route group — it's stripped from the actual URL, so
// "/dashboard", "/shops", "/trash", "/profile" all resolve at the root.
// Match everything except the API proxy and Next's own static assets.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
