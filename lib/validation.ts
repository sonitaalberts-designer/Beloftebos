import { z } from "zod";
export const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
    "Choose a valid date",
  );
export const searchSchema = z
  .object({
    checkin: date,
    checkout: date,
    guests: z.coerce.number().int().min(1).max(30),
  })
  .refine((v) => v.checkout > v.checkin, "Check-out must be after check-in")
  .refine(
    (v) =>
      v.checkin >=
      new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Johannesburg",
      }),
    "Check-in cannot be in the past",
  )
  .refine(
    (v) => (Date.parse(v.checkout) - Date.parse(v.checkin)) / 86400000 <= 90,
    "For stays over 90 nights, contact us",
  );
export const guestSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().email().max(254),
  phone: z.string().trim().min(7).max(30),
  adults: z.coerce.number().int().min(1).max(30),
  children: z.coerce.number().int().min(0).max(20),
  arrival_time: z.string().max(20).optional(),
  special_requests: z.string().max(3000).optional(),
});
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional(),
});
export const functionSchema = enquirySchema
  .extend({
    preferred_date: date,
    guests: z.coerce.number().int().min(1).max(1000),
    event_type: z.string().min(2).max(100),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    catering: z.string().max(1000),
    accommodation: z.string().max(100),
  })
  .refine(
    (v) => v.end_time > v.start_time,
    "End time must be after start time",
  );
export const activeStatuses = ["PENDING", "CONFIRMED", "PAID", "CHECKED-IN"];
export const statuses = [
  "ENQUIRY",
  ...activeStatuses,
  "CHECKED-OUT",
  "CANCELLED",
  "NO-SHOW",
];
export const sources = [
  "DIRECT",
  "LEKKESLAAP",
  "BOOKING.COM",
  "ADMIN",
  "OTHER",
];
export function overlaps(a: string, b: string, c: string, d: string) {
  return a < d && b > c;
}
