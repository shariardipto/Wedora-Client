import "server-only";
import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getAuthDatabase, getAuthMongoClient } from "@/lib/database";
import { getAuthEnv } from "./env";
import { profileUpdateSchema, signUpSchema } from "./validation";

const BLOCKED_MESSAGE = "Your account has been blocked. Please contact Wedora support.";

function createAuth() {
  const env = getAuthEnv();

  return betterAuth({
    appName: "Wedora",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(getAuthDatabase(), { client: getAuthMongoClient() }),
    trustedOrigins: [env.BETTER_AUTH_URL],

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      maxPasswordLength: 128,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    socialProviders:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
              prompt: "select_account",
            },
          }
        : {},

    user: {
      additionalFields: {
        // Protected: never accepted from sign-up/update requests (BR-01, BR-12).
        role: { type: "string", required: false, input: false },
        isBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
        subscriptionPlan: { type: "string", required: false, defaultValue: "free", input: false },
        subscriptionExpiresAt: { type: "date", required: false, input: false },
        subscriptionCancelAtPeriodEnd: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        stripeCustomerId: { type: "string", required: false, input: false, returned: false },
        stripeSubscriptionId: { type: "string", required: false, input: false, returned: false },
        // Editable profile details.
        businessName: { type: "string", required: false, input: true },
        phone: { type: "string", required: false, input: true },
      },
    },

    // Fresh session reads on every request: role/block changes apply immediately.
    session: { cookieCache: { enabled: false } },

    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            const base = { isBlocked: false, subscriptionPlan: "free" };
            if (ctx?.path === "/sign-up/email") {
              // `accountType` is not a user field, so Better Auth ignores it; we map it to
              // the protected `role`. Only customer/vendor are possible — never admin.
              const parsed = signUpSchema.shape.accountType.safeParse(ctx.body?.accountType);
              if (!parsed.success) {
                throw new APIError("BAD_REQUEST", { message: "Choose Customer or Vendor." });
              }
              const businessName =
                parsed.data === "vendor" && typeof ctx.body?.businessName === "string"
                  ? ctx.body.businessName.trim() || null
                  : null;
              // Profile photos are set only from Profile Settings (D019). Better Auth's email sign-up
              // would otherwise store any `image` URL sent with the request, unchecked. (It has to be
              // cleared here: a before-hook can't remove a body key, Better Auth deep-merges it back.)
              return { data: { ...user, ...base, role: parsed.data, businessName, image: null } };
            }
            // Social sign-ups choose their account type on /onboarding/role (BR-02).
            return { data: { ...user, ...base, role: null } };
          },
        },
      },
      session: {
        create: {
          // Blocked users cannot start new sessions (email or Google).
          before: async (session, ctx) => {
            const user = await ctx?.context.internalAdapter.findUserById(session.userId);
            if ((user as { isBlocked?: boolean } | null)?.isBlocked) {
              throw new APIError("FORBIDDEN", { code: "ACCOUNT_BLOCKED", message: BLOCKED_MESSAGE });
            }
          },
        },
      },
    },

    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-up/email") {
          const result = signUpSchema.safeParse(ctx.body);
          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_REGISTRATION",
              message: result.error.issues[0]?.message ?? "Please check your details.",
            });
          }
          return { context: { body: { ...ctx.body, ...result.data } } };
        }

        if (ctx.path === "/update-user") {
          const result = profileUpdateSchema.safeParse(ctx.body ?? {});
          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_PROFILE",
              message: result.error.issues[0]?.message ?? "Please check your profile details.",
            });
          }
          const data = { ...result.data };
          if (data.phone === "") data.phone = null;
          if (data.businessName === "") data.businessName = null;
          return { context: { body: data } };
        }
      }),
    },

    plugins: [
      jwt({
        // Must match the Express verifier: issuer/audience = this origin, EdDSA keys.
        jwt: {
          issuer: env.BETTER_AUTH_URL,
          audience: env.BETTER_AUTH_URL,
          expirationTime: "15m",
          definePayload: ({ user }) => ({ email: user.email }),
        },
        disableSettingJwtHeader: true,
      }),
      nextCookies(),
    ],

    // Provider/driver errors can contain private connection details.
    logger: { disabled: process.env.NODE_ENV === "production" },
    onAPIError: { throw: true },
    disabledPaths: [
      "/request-password-reset",
      "/reset-password",
      "/send-verification-email",
      "/verify-email",
      "/change-email",
      "/delete-user",
    ],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Created lazily so builds do not need runtime secrets. */
export function getAuth() {
  return (instance ??= createAuth());
}

export type Auth = ReturnType<typeof getAuth>;
export type AuthSession = Auth["$Infer"]["Session"];
export type SessionUser = AuthSession["user"];
