"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { Auth } from "./server";

/**
 * Same-origin client: cookies stay on the Next.js domain. API calls to Express
 * obtain a short-lived JWT via `authClient.token()` (see lib/api-client.ts).
 */
export const authClient = createAuthClient({
  plugins: [jwtClient(), inferAdditionalFields<Auth>()],
});

export type ClientSession = typeof authClient.$Infer.Session;
