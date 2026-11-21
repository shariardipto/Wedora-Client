import { z } from "zod";
import { CATEGORY_SLUGS, type ServiceCategorySlug } from "@/lib/categories";

/** Mirrors the API's serviceInputSchema (the server re-validates everything). */
export const MAX_SERVICE_IMAGES = 5;

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

/** Form values (images are handled separately because new files need uploading first). */
export const serviceFormSchema = z.object({
  serviceName: text("Service name", 3, 100),
  category: z.enum(CATEGORY_SLUGS as [ServiceCategorySlug, ...ServiceCategorySlug[]], {
    error: "Choose a category.",
  }),
  description: text("Description", 30, 2000),
  price: z
    .number({ error: "Enter a price in US dollars." })
    .int("Use a whole number of dollars.")
    .min(10, "Price must be at least $10.")
    .max(1_000_000, "Price must be $1,000,000 or less."),
  location: text("Location", 2, 100),
});
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
