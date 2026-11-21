import "server-only";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth/server";

/** Error from the Express API, raised in Server Components. */
export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

type ServerFetchOptions = {
  /** Attach the signed-in user's JWT (minted server-side from the session cookie). */
  auth?: boolean;
  searchParams?: URLSearchParams;
};

export type ApiResult<T, M = undefined> = { data: T; meta: M };

/**
 * Server-side call to the Wedora API. Data is always fresh (`no-store`) so
 * approvals, edits and bookings show up immediately and reloads never 404.
 */
export async function serverApi<T, M = undefined>(
  path: string,
  { auth = false, searchParams }: ServerFetchOptions = {},
): Promise<ApiResult<T, M>> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || !path.startsWith("/api/")) {
    throw new ServerApiError(500, "API_CONFIGURATION", "The Wedora service is not configured correctly.");
  }
  const url = new URL(path, base);
  if (searchParams) url.search = searchParams.toString();

  const requestHeaders = new Headers({ Accept: "application/json" });
  if (auth) {
    const { token } = await getAuth().api.getToken({ headers: await headers() });
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { headers: requestHeaders, cache: "no-store" });
  } catch {
    throw new ServerApiError(503, "API_UNREACHABLE", "Wedora’s service is temporarily unreachable.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    throw new ServerApiError(
      response.status,
      typeof payload?.error?.code === "string" ? payload.error.code : "API_ERROR",
      typeof payload?.message === "string" ? payload.message : "Something went wrong.",
    );
  }
  return { data: payload.data as T, meta: payload.meta as M };
}
