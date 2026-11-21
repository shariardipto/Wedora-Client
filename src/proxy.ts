import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast, optimistic gate: no session cookie → straight to Sign In with a return
 * path. Real verification (valid session, role, block status) happens in the
 * server layouts and again in Express on every API call.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  // /services/:id (details are private) but NOT /services (public browse).
  matcher: ["/dashboard/:path*", "/services/:id", "/onboarding/:path*", "/payment/:path*"],
};
