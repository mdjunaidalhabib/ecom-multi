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

  const isLogin = pathname === "/login";

  // Logged-in super admins should not remain on the login page.
  if (isLogin) {
    if (session?.role === "superadmin") {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    return NextResponse.next();
  }

  // Everything else in this app is the super admin panel — only a
  // superadmin session may pass. Any other (or missing) session gets
  // bounced to login, clearing a stale/wrong-role cookie on the way out.
  if (!session || session.role !== "superadmin") {
    return redirectWithClearedCookie(`${origin}/login`);
  }

  return NextResponse.next();
}

// (panel) is a route group — it's stripped from the actual URL, so
// "/dashboard", "/shops", "/trash", "/profile" all resolve at the root.
// Match everything except the API proxy and Next's own static assets.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
