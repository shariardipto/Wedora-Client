"use client";

import { authClient } from "@/lib/auth/client";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Defaults to true. Public endpoints pass false and send no token. */
  authenticated?: boolean;
  signal?: AbortSignal;
};

// ---------------------------------------------------------------------------
// Short-lived JWT cache (Better Auth issues 15-minute tokens)
// ---------------------------------------------------------------------------
let cachedToken: { value: string; expiresAt: number } | null = null;

function tokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Forget the cached token (call on sign-out or after a 401). */
export function clearApiToken() {
  cachedToken = null;
}

async function getToken(forceRefresh = false): Promise<string> {
  // Refresh a minute early to avoid using a token that expires mid-request.
  if (!forceRefresh && cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.value;
  }
  let result: Awaited<ReturnType<typeof authClient.token>>;
  try {
    result = await authClient.token();
  } catch {
    throw new ApiError(503, "AUTH_UNAVAILABLE", "Sign-in verification is temporarily unavailable.");
  }
  if (result.error || !result.data?.token) {
    clearApiToken();
    throw new ApiError(401, "AUTH_REQUIRED", "Please sign in to continue.");
  }
  cachedToken = { value: result.data.token, expiresAt: tokenExpiry(result.data.token) };
  return cachedToken.value;
}

function endpoint(path: string): URL {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || !path.startsWith("/api/") || path.includes("//") || path.includes("\\")) {
    throw new ApiError(0, "API_CONFIGURATION", "The Wedora service is not configured correctly.");
  }
  return new URL(path, base);
}

async function send(url: URL, options: RequestOptions, token?: string) {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try {
    return await fetch(url, {
      method: options.method ?? "GET",
      headers,
      credentials: "omit",
      cache: "no-store",
      signal: options.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR", "Couldn’t reach Wedora. Check your connection and try again.");
  }
}

/**
 * Calls the Express API. Authenticated calls attach a Bearer JWT; a 401 means
 * the request was rejected before any work happened, so it is retried once
 * with a fresh token.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint(path);
  const authenticated = options.authenticated ?? true;

  let response = await send(url, options, authenticated ? await getToken() : undefined);
  if (response.status === 401 && authenticated) {
    clearApiToken();
    response = await send(url, options, await getToken(true));
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    throw new ApiError(
      response.status,
      typeof payload?.error?.code === "string" ? payload.error.code : "API_ERROR",
      typeof payload?.message === "string" ? payload.message : "Something went wrong. Please try again.",
      Array.isArray(payload?.error?.details) ? payload.error.details : undefined,
    );
  }
  return payload.data as T;
}
