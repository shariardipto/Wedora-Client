import { describe, expect, it } from "vitest";
import { formatEventDate } from "@/lib/format";
import { countByStatus, type Booking } from "./types";
import { bookingFormSchema, maxEventDate, minEventDate } from "./validation";

const now = new Date(2026, 10, 22, 21, 30); // 22 Nov 2026, 9:30pm local

describe("booking form dates", () => {
  it("allows tomorrow through just under two years ahead", () => {
    expect(minEventDate(now)).toBe("2026-11-23");
    expect(maxEventDate(now)).toBe("2028-11-21");
    const schema = bookingFormSchema(now);
    const base = { eventLocation: "Napa, CA", message: "" };
    expect(schema.safeParse({ ...base, eventDate: "2026-11-23" }).success).toBe(true);
    expect(schema.safeParse({ ...base, eventDate: "2026-11-22" }).success).toBe(false);
    expect(schema.safeParse({ ...base, eventDate: "2028-11-22" }).success).toBe(false);
    expect(schema.safeParse({ ...base, eventDate: "" }).success).toBe(false);
  });

  it("requires a location and limits the message", () => {
    const schema = bookingFormSchema(now);
    expect(schema.safeParse({ eventDate: "2027-01-10", eventLocation: "NY", message: "" }).success).toBe(false);
    expect(schema.safeParse({ eventDate: "2027-01-10", eventLocation: "Napa", message: "x".repeat(1001) }).success).toBe(false);
  });
});

describe("formatEventDate", () => {
  it("formats calendar dates without timezone drift", () => {
    expect(formatEventDate("2027-03-15")).toBe("Mon, Mar 15, 2027");
    expect(formatEventDate("2027-01-01")).toBe("Fri, Jan 1, 2027");
  });
});

describe("countByStatus", () => {
  it("counts each status", () => {
    const b = (status: Booking["status"]) => ({ status }) as Booking;
    expect(countByStatus([b("pending"), b("pending"), b("accepted"), b("cancelled")])).toEqual({
      all: 4,
      pending: 2,
      accepted: 1,
      rejected: 0,
      cancelled: 1,
    });
  });
});
