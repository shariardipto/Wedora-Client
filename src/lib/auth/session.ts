import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, type AuthSession } from "./server";
import { dashboardPath, signInUrl } from "./redirect";
import { isUserRole, type UserRole } from "./validation";

/** Cookie-backed session for this request (deduplicated per render). */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
});

/** Signed in and not blocked — otherwise redirect. */
export async function requireUser(callbackUrl = "/dashboard") {
  const session = await getSession();
  if (!session) redirect(signInUrl(callbackUrl));
  if (session.user.isBlocked) redirect("/blocked");
  return session;
}

/**
 * Role gate for server layouts/pages. A user who edits the URL to another
 * role's dashboard is sent back to their own (frontend layer; Express enforces
 * the same rule on every API call).
 */
export async function requireRole(role: UserRole, callbackUrl = `/dashboard/${role}`) {
  const session = await requireUser(callbackUrl);
  const current = session.user.role;
  if (!isUserRole(current)) redirect("/onboarding/role");
  if (current !== role) redirect(dashboardPath(current));
  return session;
}
