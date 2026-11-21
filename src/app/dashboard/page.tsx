import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/auth/redirect";
import { requireUser } from "@/lib/auth/session";

/** /dashboard → the signed-in user's own role dashboard. */
export default async function DashboardIndex() {
  const session = await requireUser("/dashboard");
  redirect(dashboardPath(session.user.role));
}
