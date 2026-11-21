/**
 * Creates (or repairs) the Wedora admin account from ADMIN_* env variables.
 * Admins can never be created through public sign-up (BR-03).
 *
 *   npm run seed:admin
 *
 * Idempotent: if the email exists it is promoted to admin, unblocked and its
 * password is reset to ADMIN_PASSWORD so the submitted credentials always work.
 */
import { getAuth } from "@/lib/auth/server";
import { closeAuthDatabase, getAuthDatabase } from "@/lib/database";
import { emailSchema, nameSchema, passwordSchema } from "@/lib/auth/validation";

async function main() {
  const name = nameSchema.parse(process.env.ADMIN_NAME || "Wedora Admin");
  const email = emailSchema.parse(process.env.ADMIN_EMAIL);
  const passwordCheck = passwordSchema.safeParse(process.env.ADMIN_PASSWORD);
  if (!passwordCheck.success) {
    throw new Error(`ADMIN_PASSWORD: ${passwordCheck.error.issues[0]?.message}`);
  }
  const password = passwordCheck.data;

  const auth = getAuth();
  const ctx = await auth.$context;
  const users = getAuthDatabase().collection("user");

  const existing = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true });
  let userId: string;

  if (!existing) {
    const result = await auth.api.signUpEmail({
      body: { name, email, password, accountType: "customer" } as never,
    });
    userId = result.user.id;
    console.info("Created admin account.");
  } else {
    userId = existing.user.id;
    const hash = await ctx.password.hash(password);
    const hasCredential = existing.accounts.some((account) => account.providerId === "credential");
    if (hasCredential) {
      await ctx.internalAdapter.updatePassword(userId, hash);
    } else {
      await ctx.internalAdapter.linkAccount({
        userId,
        providerId: "credential",
        accountId: userId,
        password: hash,
      });
    }
    console.info("Admin account already existed — password reset to ADMIN_PASSWORD.");
  }

  // Role is a protected field: set it directly in the database, never via the API.
  const update = await users.updateOne(
    { email },
    { $set: { role: "admin", isBlocked: false, emailVerified: true, name, updatedAt: new Date() } },
  );
  if (update.matchedCount !== 1) throw new Error("Admin user not found after creation.");

  // Drop any session created during sign-up; the admin signs in normally.
  await ctx.internalAdapter.deleteUserSessions(userId);
  console.info(`Admin ready: ${email.replace(/(^.).*(@.*$)/, "$1***$2")} (role: admin)`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeAuthDatabase());
