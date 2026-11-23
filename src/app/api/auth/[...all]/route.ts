import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";

/** The shared database client was closed under this request: a fresh one is created on the next call. */
function isClosedClientError(error: unknown) {
  return error instanceof Error && (error.name === "MongoTopologyClosedError" || error.name === "MongoNotConnectedError");
}

export const { GET, POST } = toNextJsHandler(async (request: Request) => {
  // Kept for one retry: the body can only be read once.
  const retry = request.clone();
  try {
    try {
      return await getAuth().handler(request);
    } catch (error) {
      if (!isClosedClientError(error)) throw error;
      return await getAuth().handler(retry);
    }
  } catch (error) {
    // The error's name and code only (never its message: it can contain connection details).
    const code = error && typeof error === "object" && "code" in error ? ` (code ${String(error.code)})` : "";
    console.error("Auth handler failed:", error instanceof Error ? error.name + code : "unknown");
    return Response.json(
      {
        code: "AUTH_UNAVAILABLE",
        message: "Sign-in is temporarily unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
});
