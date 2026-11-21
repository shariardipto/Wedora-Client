import { isUserRole, type UserRole } from "./validation";

/**
 * Only same-site paths may survive an auth round trip (prevents open redirects).
 * Anything suspicious falls back to `fallback`.
 */
export function safeCallbackUrl(value: unknown, fallback = ""): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  // Reject control chars, backslashes and encoded separators that proxies may normalize.
  if (/[\\\u0000- \u007f]/.test(value) || /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f|25)/i.test(value)) {
    return fallback;
  }
  try {
    const url = new URL(value, "https://wedora.invalid");
    if (
      url.origin !== "https://wedora.invalid" ||
      /^\/(?:api|signin|signup)(?:\/|$)/.test(url.pathname)
    ) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function signInUrl(callbackUrl?: string) {
  const safe = safeCallbackUrl(callbackUrl);
  return safe ? `/signin?callbackUrl=${encodeURIComponent(safe)}` : "/signin";
}

/** Accepts any value (session fields are plain strings) and validates it. */
export function dashboardPath(role: UserRole | string | null | undefined): string {
  return isUserRole(role) ? `/dashboard/${role}` : "/onboarding/role";
}

/** Where to go after a successful sign-in/sign-up. */
export function postAuthDestination(role: unknown, callbackUrl?: string): string {
  if (!isUserRole(role)) return "/onboarding/role";
  return safeCallbackUrl(callbackUrl) || dashboardPath(role);
}
