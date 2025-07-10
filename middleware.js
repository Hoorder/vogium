import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JW_SECRET_KEY);

const protectedRoutes = ["/dashboard"];
const publicOnlyRoutes = ["/", "/auth", "/auth/login", "/dashboard"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.account_role;

      if (publicOnlyRoutes.includes(pathname)) {
        if (role === "customer" || role === "admin") {
          return NextResponse.redirect(
            new URL(`/dashboard/${role}`, request.url)
          );
        }
      }

      if (
        (pathname.startsWith("/dashboard/customer") && role !== "customer") ||
        (pathname.startsWith("/dashboard/admin") && role !== "admin")
      ) {
        return NextResponse.redirect(
          new URL(`/dashboard/${role}`, request.url)
        );
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname === "/" || pathname === "/auth") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth", "/auth/login", "/dashboard/:path*"],
};
