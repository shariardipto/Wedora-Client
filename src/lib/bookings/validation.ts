import { z } from "zod";

/** Local calendar date as YYYY-MM-DD (what an <input type="date"> uses). */
export function localDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Earliest selectable event date: tomorrow (local). */
export function minEventDate(now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  return localDateString(d);
}

/** Latest selectable event date: just under two years ahead (the server allows 2 years from UTC today). */
export function maxEventDate(now = new Date()): string {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() + 2);
  d.setDate(d.getDate() - 1);
  return localDateString(d);
}

/** Mirrors the API's createBookingSchema (the server re-validates everything). */
export function bookingFormSchema(now = new Date()) {
  const min = minEventDate(now);
  const max = maxEventDate(now);
  return z.object({
    eventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your event date.")
      .refine((value) => value >= min, "Choose a future date (tomorrow or later).")
      .refine((value) => value <= max, "Event dates can be at most 2 years ahead."),
    eventLocation: z
      .string()
      .trim()
      .min(3, "Enter where the event will take place.")
      .max(200, "Event location must be 200 characters or fewer."),
    message: z.string().trim().max(1000, "Your message must be 1,000 characters or fewer."),
  });
}
export type BookingFormValues = z.infer<ReturnType<typeof bookingFormSchema>>;
