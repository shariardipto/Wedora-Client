import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(async (request: Request) => {
  try {
    return await getAuth().handler(request);
  } catch (error) {
    console.error("Auth handler failed:", error instanceof Error ? error.name : "unknown");
    return Response.json(
      {
        code: "AUTH_UNAVAILABLE",
        message: "Sign-in is temporarily unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
});
