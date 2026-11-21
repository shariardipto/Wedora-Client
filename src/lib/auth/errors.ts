type AuthErrorLike = { code?: string; message?: string; status?: number } | null | undefined;

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don’t match. Please try again.",
  USER_ALREADY_EXISTS: "An account with this email already exists. Try signing in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "An account with this email already exists. Try signing in instead.",
  ACCOUNT_BLOCKED: "Your account has been blocked. Please contact Wedora support.",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters.",
  INVALID_EMAIL: "Please enter a valid email address.",
  FIELD_NOT_ALLOWED: "Some of those details can’t be changed here.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a minute and try again.",
  AUTH_UNAVAILABLE: "Sign-in is temporarily unavailable. Please try again shortly.",
  // Better Auth OAuth error redirect codes (lower-case, from ?error=)
  access_denied: "Google sign-in was cancelled.",
  account_not_linked:
    "This email is already registered with a password. Sign in with your password instead.",
  unable_to_create_session: "We couldn’t sign you in. Your account may be blocked.",
  unable_to_create_user: "We couldn’t create your account. Please try again.",
};

/** Turns Better Auth / API errors into short, friendly sentences for toasts. */
export function authErrorMessage(error: AuthErrorLike, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  if (error.status === 429) return MESSAGES.TOO_MANY_REQUESTS!;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]!;
  // Our own hook messages are already user-facing.
  if (error.code === "INVALID_REGISTRATION" || error.code === "INVALID_PROFILE") {
    return error.message ?? fallback;
  }
  if (error.message && /blocked/i.test(error.message)) return MESSAGES.ACCOUNT_BLOCKED!;
  return fallback;
}

export function oauthErrorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return MESSAGES[code] ?? MESSAGES[code.toUpperCase()] ?? "Google sign-in didn’t complete. Please try again.";
}
