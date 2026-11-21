import { z } from "zod";

/** Shared by the browser forms and the Better Auth server hooks. */

export const USER_ROLES = ["customer", "vendor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SELF_SERVICE_ROLES = ["customer", "vendor"] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

export const nameSchema = z
  .string({ error: "Please enter your full name." })
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(60, "Name must be 60 characters or fewer.");

export const emailSchema = z
  .string({ error: "Please enter your email address." })
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address.").max(254));

/** Assignment rule: 6+ characters, at least one uppercase and one lowercase letter. */
export const passwordSchema = z
  .string({ error: "Please enter a password." })
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.");

export const businessNameSchema = z
  .string()
  .trim()
  .max(80, "Business name must be 80 characters or fewer.");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9()\s.-]{7,20}$/, "Enter a valid phone number, e.g. +1 (512) 555-0147.")
  .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter a valid phone number, e.g. +1 (512) 555-0147.");

/** Images we accept as profile pictures: ImgBB uploads or Google account photos. */
export function isTrustedImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "i.ibb.co" || url.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
}

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  accountType: z.enum(SELF_SERVICE_ROLES, { error: "Choose Customer or Vendor." }),
  businessName: businessNameSchema.optional(),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password.").max(128),
});
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Only these keys may be sent to /update-user. Role, block status and
 * subscription fields are never accepted (BR-12).
 */
export const profileUpdateSchema = z.strictObject({
  name: nameSchema.optional(),
  image: z
    .string()
    .refine(isTrustedImageUrl, "Profile images must be uploaded through Wedora.")
    .nullable()
    .optional(),
  businessName: businessNameSchema.nullable().optional(),
  phone: z.union([phoneSchema, z.literal("")]).nullable().optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
