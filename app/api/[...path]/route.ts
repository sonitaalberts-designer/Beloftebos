import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  list,
  get,
  put,
  remove,
  reserve,
  audit,
  config,
  rateLimit,
  bucket,
  saveFunction,
  consumeResetToken,
} from "@/db/repository";
import { requireAdmin, login, logout, hash, passwordHash } from "@/lib/auth";
import {
  searchSchema,
  guestSchema,
  enquirySchema,
  functionSchema,
  activeStatuses,
  statuses,
  sources,
  date,
  overlaps,
} from "@/lib/validation";
import { sendMail, deliverMail, flushOutbox } from "@/lib/mail";
import { syncChannel, exportICS, syncDue } from "@/lib/integrations";
import { settings } from "@/lib/public-data";
import { defaults, postSeeds, initialFaqs, type Entry } from "@/lib/content";
import { gallerySeeds } from "@/lib/gallery-data";
export const dynamic = "force-dynamic";
const editable = [
  "rooms",
  "room_images",
  "amenities",
  "functions",
  "function_enquiries",
  "blog_posts",
  "blog_categories",
  "gallery_images",
  "testimonials",
  "faqs",
  "website_settings",
  "seo_metadata",
  "integration_settings",
  "menu_items",
];
function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
async function key(req: NextRequest) {
  return hash(req.headers.get("cf-connecting-ip") ?? "local");
}
async function body(req: NextRequest) {
  const t = await req.text();
  if (t.length > 100000) throw new Error("Request too large");
  return JSON.parse(t);
}
function origin(req: NextRequest) {
  const o = req.headers.get("origin");
  if (o && o !== req.nextUrl.origin) throw new Error("Invalid request origin");
  if (req.headers.get("sec-fetch-site") === "cross-site")
    throw new Error("Invalid request origin");
}
function safeEntry(value: unknown): Entry {
  const v = z.record(z.unknown()).parse(value);
  if (JSON.stringify(v).length > 80000) throw new Error("Content too long");
  for (const [k, x] of Object.entries(v)) {
    if (
      /url|image|social_/.test(k) &&
      typeof x === "string" &&
      x &&
      !x.startsWith("/images/") &&
      !x.startsWith("/api/media/")
    ) {
      const u = new URL(x);
      if (u.protocol !== "https:") throw new Error("Use an HTTPS URL");
    }
    if (/password_hash|salt|secret|api_key|token_hash/i.test(k))
      throw new Error("Secrets belong in environment settings");
  }
  return {
    ...v,
    id: typeof v.id === "string" ? v.id : crypto.randomUUID(),
  } as Entry;
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const p = (await params).path;
    if (p[0] === "media") {
      const b = bucket();
      if (!b) return json({ error: "Storage unavailable" }, 503);
      const file = await b.get(p.slice(1).join("/"));
      if (!file) return json({ error: "Not found" }, 404);
      return new NextResponse(file.body as unknown as ReadableStream, {
        headers: {
          "Content-Type": file.httpMetadata?.contentType ?? "image/jpeg",
          "Cache-Control": "public,max-age=31536000,immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (p[0] === "availability") {
      const input = searchSchema.parse(
        Object.fromEntries(req.nextUrl.searchParams),
      );
      const s = await settings();
      const [rooms, bookings, blocks, channels] = await Promise.all([
        list("rooms"),
        list("bookings"),
        list("availability_blocks"),
        list("integration_settings"),
      ]);
      const safeRooms = rooms.filter(
        (r) =>
          r.published === true &&
          r.price != null &&
          Number(r.capacity) >= input.guests,
      );
      const stale = new Set(
        channels
          .filter(
            (c) =>
              c.enabled &&
              (!c.last_sync ||
                c.status === "ERROR" ||
                Date.now() - Date.parse(String(c.last_sync)) >
                  Number(c.frequency_minutes ?? 60) * 120000),
          )
          .map((c) => c.room_id),
      );
      const available = safeRooms.filter(
        (r) =>
          !stale.has(r.id) &&
          ![
            ...bookings.filter((b) =>
              activeStatuses.includes(String(b.status)),
            ),
            ...blocks,
          ].some(
            (b) =>
              b.room_id === r.id &&
              overlaps(
                String(b.checkin),
                String(b.checkout),
                input.checkin,
                input.checkout,
              ),
          ),
      );
      return json({
        rooms: s.direct_booking_enabled ? available : [],
        directEnabled: s.direct_booking_enabled,
        nights:
          (Date.parse(input.checkout) - Date.parse(input.checkin)) / 86400000,
        message: !s.direct_booking_enabled
          ? "Please contact Heidi or use a booking partner while direct online reservations are being prepared."
          : available.length
            ? ""
            : "No rooms are available for these dates and group size. Try different dates or contact Heidi.",
      });
    }
    if (p[0] === "calendar") {
      const token = req.nextUrl.searchParams.get("token");
      if (!config("ICAL_EXPORT_TOKEN") || token !== config("ICAL_EXPORT_TOKEN"))
        return json({ error: "Invalid feed token" }, 401);
      return new NextResponse(
        exportICS(
          p[1],
          await list("bookings"),
          await list("availability_blocks"),
        ),
        {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "private,no-store",
          },
        },
      );
    }
    if (p[0] === "admin") {
      const u = await requireAdmin();
      if (p[1] === "data") {
        const names = [
          "rooms",
          "bookings",
          "guests",
          "functions",
          "function_enquiries",
          "availability_blocks",
          "blog_posts",
          "gallery_images",
          "faqs",
          "testimonials",
          "website_settings",
          "integration_settings",
          "contact_enquiries",
          "menu_items",
          "audit_logs",
          "email_outbox",
          "users",
          "seo_metadata",
        ];
        const values = await Promise.all(names.map((n) => list(n)));
        return json({
          user: { name: u.name, email: u.email },
          data: Object.fromEntries(
            names.map((n, i) => [
              n,
              n === "users"
                ? values[i].map((v) => ({
                    id: v.id,
                    name: v.name,
                    email: v.email,
                    disabled: v.disabled,
                  }))
                : values[i],
            ]),
          ),
          services: {
            database: config("SUPABASE_URL")
              ? "Supabase PostgreSQL"
              : "Private review database",
            email: !!config("RESEND_API_KEY") && !!config("EMAIL_FROM"),
            calendar: !!config("ICAL_EXPORT_TOKEN"),
          },
        });
      }
    }
    return json({ error: "Not found" }, 404);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    origin(req);
    const p = (await params).path;
    if (p[0] === "cron") {
      if (
        !config("CRON_SECRET") ||
        req.headers.get("authorization") !== "Bearer " + config("CRON_SECRET")
      )
        return json({ error: "Unauthorized" }, 401);
      return json({ sync: await syncDue(), email: await flushOutbox() });
    }
    if (p[0] === "admin" && p[1] === "upload") {
      await requireAdmin();
      const b = bucket();
      if (!b) throw new Error("Image storage is not configured");
      if (Number(req.headers.get("content-length") ?? 0) > 12000000)
        throw new Error("Maximum upload is 10 MB");
      const fd = await req.formData(),
        f = fd.get("file");
      if (
        !(f instanceof File) ||
        f.size > 10000000 ||
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          f.type,
        )
      )
        throw new Error("Choose a JPG, PNG, WebP or AVIF image under 10 MB");
      const bytes = new Uint8Array(await f.arrayBuffer());
      const valid =
        (f.type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216) ||
        (f.type === "image/png" && bytes[0] === 137 && bytes[1] === 80) ||
        (f.type === "image/webp" &&
          new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") ||
        (f.type === "image/avif" &&
          new TextDecoder().decode(bytes.slice(4, 12)).includes("ftyp"));
      if (!valid) throw new Error("File contents do not match the image type");
      const id =
        crypto.randomUUID() +
        "." +
        {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/avif": "avif",
        }[f.type];
      await b.put(id, bytes, { httpMetadata: { contentType: f.type } });
      return json({ url: "/api/media/" + id });
    }
    const v = await body(req);
    if (p[0] === "auth") {
      await rateLimit("auth:" + (await key(req)), 10);
      if (p[1] === "login") {
        const input = z
          .object({
            email: z.string().email(),
            password: z.string().min(1).max(200),
          })
          .parse(v);
        return json(await login(input.email, input.password));
      }
      if (p[1] === "logout") {
        await logout();
        return json({ ok: true });
      }
      if (p[1] === "setup") {
        if (
          !config("ADMIN_SETUP_TOKEN") ||
          v.setup_token !== config("ADMIN_SETUP_TOKEN")
        )
          throw new Error("Administrator setup is not available");
        if ((await list("users")).length)
          throw new Error("Administrator already exists");
        const input = z
          .object({
            email: z.string().email(),
            password: z.string().min(14).max(200),
            name: z.string().min(2).max(100),
          })
          .parse(v);
        const salt = crypto.randomUUID();
        await put("users", {
          id: crypto.randomUUID(),
          name: input.name,
          email: input.email.toLowerCase(),
          salt,
          password_hash: await passwordHash(input.password, salt),
          role: "ADMIN",
        });
        await seed();
        return json({ ok: true });
      }
      if (p[1] === "forgot") {
        const email = z.string().email().parse(v.email);
        const u = (await list("users")).find(
          (u) => u.email === email.toLowerCase(),
        );
        if (u && config("RESEND_API_KEY") && config("SITE_URL")) {
          const token = crypto.randomUUID() + crypto.randomUUID();
          await put("reset_tokens", {
            id: crypto.randomUUID(),
            user_id: u.id,
            token_hash: await hash(token),
            expires_at: new Date(Date.now() + 1800000).toISOString(),
          });
          await sendMail(
            "password_reset",
            email,
            String(u.name),
            `Use this link within 30 minutes to reset your password:\n${config("SITE_URL")}/admin?reset=${token}`,
          );
        }
        return json({
          message:
            "If an account exists and email delivery is configured, a reset link will be sent.",
        });
      }
      if (p[1] === "reset") {
        const token = z.string().min(30).parse(v.token),
          password = z.string().min(14).max(200).parse(v.password);
        const digest = await hash(token);
        const match = await consumeResetToken(digest);
        if (!match) throw new Error("Reset link is invalid or expired");
        const u = await get("users", String(match.user_id));
        if (!u) throw new Error("Invalid account");
        const salt = crypto.randomUUID();
        await put("users", {
          ...u,
          salt,
          password_hash: await passwordHash(password, salt),
        });
        for (const s of await list("sessions"))
          if (s.user_id === u.id) await remove("sessions", s.id);
        return json({ ok: true });
      }
    }
    if (p[0] === "bookings") {
      await rateLimit("booking:" + (await key(req)), 6);
      const input = searchSchema.parse(v),
        guest = guestSchema.parse(v);
      if (guest.adults + guest.children !== input.guests)
        throw new Error("Guest total must match the search");
      const s = await settings();
      if (!s.direct_booking_enabled)
        throw new Error("Please contact Heidi to arrange a direct booking");
      if (v.website) throw new Error("Unable to submit");
      const room = await get("rooms", z.string().parse(v.room_id));
      if (
        !room ||
        !room.published ||
        room.price == null ||
        Number(room.capacity) < input.guests
      )
        throw new Error("This room is not available for your group");
      const channels = (await list("integration_settings")).filter(
        (c) => c.enabled && c.room_id === room.id,
      );
      if (
        channels.some(
          (c) =>
            !c.last_sync ||
            c.status === "ERROR" ||
            Date.now() - Date.parse(String(c.last_sync)) >
              Number(c.frequency_minutes ?? 60) * 120000,
        )
      )
        throw new Error(
          "Online availability needs reconfirmation. Please contact Heidi",
        );
      const idem = z.string().uuid().parse(v.idempotency_key);
      const prior = (await list("bookings")).find(
        (b) => b.idempotency_key === idem,
      );
      if (prior) {
        if (prior.email !== guest.email)
          throw new Error("Invalid booking reference");
        return json({ reference: prior.reference, status: prior.status });
      }
      const id = crypto.randomUUID(),
        gid = crypto.randomUUID(),
        reference = "BB-" + id.slice(0, 8).toUpperCase(),
        nights =
          (Date.parse(input.checkout) - Date.parse(input.checkin)) / 86400000;
      const entry = {
        ...guest,
        ...input,
        id,
        room_id: room.id,
        room_name: room.name,
        guest_id: gid,
        reference,
        status: "PENDING",
        source: "DIRECT",
        payment_status: "UNPAID",
        total: Number(room.price) * nights,
        idempotency_key: idem,
      };
      await reserve(entry, {
        ...guest,
        id: gid,
        email: guest.email.toLowerCase(),
        name: guest.first_name + " " + guest.last_name,
      });
      const email = await sendMail(
        "new_booking",
        guest.email,
        guest.first_name,
        `Your request ${reference} has been received for ${input.checkin} to ${input.checkout}. Total: R ${entry.total}. Your booking is pending confirmation by the property; no payment has been taken.`,
      );
      await sendMail(
        "admin_notification",
        String(s.email),
        "Heidi",
        `New booking ${reference}. Review it in the admin dashboard.`,
      );
      return json({ reference, status: "PENDING", email });
    }
    if (p[0] === "contact" || p[0] === "functions") {
      await rateLimit("enquiry:" + (await key(req)), 5);
      const value =
        p[0] === "contact" ? enquirySchema.parse(v) : functionSchema.parse(v);
      const id = crypto.randomUUID();
      await put(
        p[0] === "contact" ? "contact_enquiries" : "function_enquiries",
        { ...value, id, status: "NEW" },
      );
      const s = await settings();
      await sendMail(
        p[0] === "contact" ? "contact_enquiry" : "function_enquiry",
        value.email,
        value.name,
        "Your enquiry has been received. Heidi will be in touch to discuss the details. This is not a booking confirmation.",
      );
      const email = await sendMail(
        "admin_notification",
        String(s.email),
        "Heidi",
        `${value.name} (${value.email}, ${value.phone ?? ""})\n${value.subject}\n${value.message}`,
      );
      return json({ ok: true, reference: id.slice(0, 8), email });
    }
    if (p[0] === "admin") {
      const u = await requireAdmin();
      if (p[1] === "seed") {
        await seed();
        return json({ ok: true });
      }
      if (p[1] === "save") {
        const collection = z
          .enum(editable as [string, ...string[]])
          .parse(v.collection);
        const entry = safeEntry(v.entry);
        if (collection === "rooms") {
          if (entry.published) {
            z.object({
              name: z.string().min(2),
              description: z.string().min(10),
              capacity: z.coerce.number().int().positive(),
              beds: z.string().min(2),
              bathroom: z.string().min(2),
              price: z.coerce.number().min(0),
              image: z.string().min(1),
            }).parse(entry);
          }
          if (entry.price !== "" && entry.price != null)
            entry.price = Number(entry.price);
          else entry.price = null;
        }
        if (collection === "blog_posts" && entry.published)
          z.object({
            title: z.string().min(4),
            slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            body: z.string().min(100),
            description: z.string().min(20),
            image: z.string().min(1),
          }).parse(entry);
        if (collection === "testimonials" && entry.published && !entry.verified)
          throw new Error("Verify the review source before publishing");
        if (collection === "functions") {
          date.parse(entry.checkin);
          date.parse(entry.checkout);
          if (String(entry.checkout) <= String(entry.checkin))
            throw new Error("End date must follow the function start date");
          const roomIds = z
            .array(z.string())
            .parse(entry.affected_room_ids ?? []);
          await saveFunction(entry, roomIds);
          return json({ ok: true, entry });
        }
        if (
          collection === "website_settings" &&
          /url|social_/.test(entry.id) &&
          entry.value
        ) {
          const url = new URL(String(entry.value));
          if (url.protocol !== "https:") throw new Error("Use HTTPS links");
        }
        if (collection === "integration_settings") {
          entry.frequency_minutes = Math.max(
            15,
            Number(entry.frequency_minutes ?? 60),
          );
          entry.status = entry.status ?? "NOT CONNECTED";
        }
        await put(collection, entry);
        await audit(u.id, collection + ".saved", { id: entry.id });
        return json({ ok: true, entry });
      }
      if (p[1] === "delete") {
        const c = z.enum(editable as [string, ...string[]]).parse(v.collection);
        const id = z.string().parse(v.id);
        await remove(c, id);
        await audit(u.id, c + ".deleted", { id });
        return json({ ok: true });
      }
      if (p[1] === "booking") {
        const entry = safeEntry(v.entry);
        const existing = entry.id ? await get("bookings", entry.id) : null;
        date.parse(entry.checkin);
        date.parse(entry.checkout);
        if (String(entry.checkout) <= String(entry.checkin))
          throw new Error("Check-out must follow check-in");
        z.enum(statuses as [string, ...string[]]).parse(entry.status);
        z.enum(sources as [string, ...string[]]).parse(entry.source);
        const room = await get("rooms", String(entry.room_id));
        if (!room) throw new Error("Choose a room");
        if (existing) {
          await put("bookings", { ...existing, ...entry });
          if (
            entry.status !== existing.status &&
            ["CONFIRMED", "CANCELLED"].includes(String(entry.status))
          )
            await sendMail(
              entry.status === "CONFIRMED" ? "confirmation" : "cancellation",
              String(existing.email),
              String(existing.first_name),
              `Booking ${existing.reference}: ${entry.status}. Dates: ${entry.checkin} to ${entry.checkout}. Contact Heidi with any questions.`,
            );
        } else {
          const g = guestSchema.parse(entry);
          const guest = {
            ...g,
            id: crypto.randomUUID(),
            name: g.first_name + " " + g.last_name,
          };
          await reserve(
            {
              ...entry,
              id: entry.id || crypto.randomUUID(),
              guest_id: guest.id,
              reference: "BB-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
              idempotency_key: crypto.randomUUID(),
              room_name: room.name,
            },
            guest,
          );
        }
        await audit(u.id, "booking.updated", {
          id: entry.id,
          reason: entry.notes,
        });
        return json({ ok: true });
      }
      if (p[1] === "block") {
        const e = safeEntry(v.entry);
        date.parse(e.checkin);
        date.parse(e.checkout);
        if (String(e.checkout) <= String(e.checkin))
          throw new Error("End date must follow start");
        const room = await get("rooms", String(e.room_id));
        if (!room) throw new Error("Choose a room");
        await put("availability_blocks", {
          ...e,
          source: "ADMIN",
          integration_id: null,
        });
        await audit(u.id, "dates.blocked", e);
        return json({ ok: true });
      }
      if (p[1] === "unblock") {
        const e = await get("availability_blocks", String(v.id));
        if (!e) throw new Error("Block not found");
        if (e.integration_id)
          throw new Error("Remove channel blocks through the integration");
        if (!v.reason) throw new Error("An override reason is required");
        await remove("availability_blocks", e.id);
        await audit(u.id, "block.override", { ...e, reason: v.reason });
        return json({ ok: true });
      }
      if (p[1] === "sync") {
        const s = await get("integration_settings", String(v.id));
        if (!s) throw new Error("Integration not found");
        try {
          return json({
            count: await syncChannel(
              s,
              typeof v.ics === "string" ? v.ics : undefined,
            ),
          });
        } catch (e) {
          await put("integration_settings", {
            ...s,
            status: "ERROR",
            last_error: String(e),
          });
          throw e;
        }
      }
      if (p[1] === "user") {
        if (v.action === "disable") {
          if (v.id === u.id)
            throw new Error("You cannot disable your own account");
          const target = await get("users", String(v.id));
          if (!target) throw new Error("User not found");
          await put("users", { ...target, disabled: !!v.disabled });
        } else {
          const input = z
            .object({
              name: z.string().min(2),
              email: z.string().email(),
              password: z.string().min(14).max(200),
            })
            .parse(v);
          const salt = crypto.randomUUID();
          await put("users", {
            id: crypto.randomUUID(),
            ...input,
            password: undefined,
            email: input.email.toLowerCase(),
            password_hash: await passwordHash(input.password, salt),
            salt,
            role: "ADMIN",
          });
        }
        await audit(u.id, "user.changed", { email: v.email, id: v.id });
        return json({ ok: true });
      }
      if (p[1] === "retry-email") {
        const e = await get("email_outbox", String(v.id));
        if (!e) throw new Error("Message not found");
        if (e.status === "SENT") throw new Error("Already sent");
        const sent = await deliverMail(e.id);
        return json(sent);
      }
    }
    return json({ error: "Not found" }, 404);
  } catch (e) {
    return fail(e);
  }
}
function fail(e: unknown) {
  if (e instanceof z.ZodError)
    return json(
      {
        error: e.issues
          .map((i) => `${i.path.join(" ")}: ${i.message}`)
          .join("; "),
      },
      400,
    );
  const msg = e instanceof Error ? e.message : "Request failed";
  if (msg === "Sign in required") return json({ error: msg }, 401);
  if (/D1_|SQLITE|constraint|FOREIGN KEY/i.test(msg))
    return json(
      {
        error: /conflict/i.test(msg)
          ? "This change conflicts with an existing booking. Choose different dates."
          : "This record could not be saved. Check required fields and linked records.",
      },
      409,
    );
  return json({ error: msg }, 400);
}
async function seed() {
  for (const [t, entries] of [
    ["blog_posts", postSeeds],
    ["faqs", initialFaqs],
    ["gallery_images", gallerySeeds],
  ] as [string, Entry[]][]) {
    if (!(await list(t)).length) for (const e of entries) await put(t, e);
  }
  for (const [id, value] of Object.entries(defaults))
    if (!(await get("website_settings", id)))
      await put("website_settings", { id, value });
}
