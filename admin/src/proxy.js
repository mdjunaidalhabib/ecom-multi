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

function superAdminLegacyTarget(pathname) {
  if (pathname === "/admin/shops") return "/super-admin/shops";
  if (pathname === "/admin/profile") return "/super-admin/profile";
  return "/super-admin/dashboard";
}

export function proxy(req) {
  const token = req.cookies.get("admin_token")?.value || "";
  const session = getSession(token);
  const { pathname, origin } = req.nextUrl;

  const isAdminLogin = pathname === "/login";
  const isSuperAdminLogin = pathname === "/super-admin/login";

  // Logged-in users should not remain on either login page.
  if (isAdminLogin || isSuperAdminLogin) {
    if (!session) return NextResponse.next();

    const home =
      session.role === "superadmin"
        ? "/super-admin/dashboard"
        : "/admin/dashboard";

    return NextResponse.redirect(`${origin}${home}`);
  }

  // Dedicated super admin portal.
  if (pathname.startsWith("/super-admin")) {
    if (!session) {
      return redirectWithClearedCookie(`${origin}/super-admin/login`);
    }

    if (session.role !== "superadmin") {
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    }

    return NextResponse.next();
  }

  // Shop admin/staff portal. Super admins are moved to their own namespace.
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return redirectWithClearedCookie(`${origin}/login`);
    }

    if (session.role === "superadmin") {
      return NextResponse.redirect(
        `${origin}${superAdminLegacyTarget(pathname)}`,
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/login"],
};
