import "server-only";
import { z } from "zod";

/** Treat template placeholders as "not configured". */
function providerValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return !normalized || /^(?:your[-_ ]|replace|placeholder|example)/i.test(normalized)
    ? undefined
    : normalized;
}

const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().refine((value) => {
    const url = new URL(value);
    return (
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      (url.protocol === "https:" ||
        (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    );
  }),
  GOOGLE_CLIENT_ID: z.preprocess(providerValue, z.string().optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(providerValue, z.string().optional()),
});

export function getAuthEnv(env: Record<string, string | undefined> = process.env) {
  const parsed = authEnvSchema.safeParse(env);
  if (!parsed.success) {
    // Name the variables only — never their values.
    const fields = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    throw new Error(`Invalid private auth configuration: ${fields.join(", ")}.`);
  }
  const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = parsed.data;
  if (Boolean(id) !== Boolean(secret)) {
    throw new Error("Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither.");
  }
  return {
    ...parsed.data,
    BETTER_AUTH_URL: new URL(parsed.data.BETTER_AUTH_URL).origin,
  };
}
