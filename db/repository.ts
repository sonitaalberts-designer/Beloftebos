import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { env } from "cloudflare:workers";
import type { Entry } from "@/lib/content";
export const tables = [
  "users",
  "rooms",
  "room_images",
  "amenities",
  "bookings",
  "booking_guests",
  "booking_sources",
  "availability_blocks",
  "functions",
  "function_enquiries",
  "guests",
  "blog_posts",
  "blog_categories",
  "gallery_images",
  "testimonials",
  "faqs",
  "website_settings",
  "seo_metadata",
  "integration_settings",
  "audit_logs",
  "sessions",
  "reset_tokens",
  "rate_limits",
  "email_outbox",
  "contact_enquiries",
  "menu_items",
];
type Bindings = { DB?: D1Database; BUCKET?: R2Bucket; [key: string]: unknown };
export function config(key: string) {
  return String((env as unknown as Bindings)[key] ?? process.env[key] ?? "");
}
function db() {
  const d = (env as unknown as Bindings).DB;
  if (!d) throw new Error("Database not configured");
  return d;
}
export function bucket() {
  return (env as unknown as Bindings).BUCKET;
}
const pg = () =>
  !!config("SUPABASE_URL") && !!config("SUPABASE_SERVICE_ROLE_KEY");
async function rest(path: string, init: RequestInit = {}) {
  const r = await fetch(config("SUPABASE_URL") + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: config("SUPABASE_SERVICE_ROLE_KEY"),
      Authorization: "Bearer " + config("SUPABASE_SERVICE_ROLE_KEY"),
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });
  if (!r.ok) {
    const e = await r.text();
    if (e.includes("conflict") || e.includes("overlap"))
      throw new Error(
        "Those dates are no longer available. Please choose another room or dates.",
      );
    throw new Error("Database operation failed");
  }
  return r.status === 204 ? [] : r.json();
}
function check(table: string) {
  if (!tables.includes(table)) throw new Error("Unknown collection");
}
export async function list(table: string): Promise<Entry[]> {
  check(table);
  if (pg()) {
    const rows = await rest(
      table + "?select=*&order=created_at.desc&limit=5000",
    );
    return rows.map(unpack);
  }
  const rows = await db()
    .prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 5000`)
    .all();
  return rows.results.map(unpack);
}
function unpack(r: Record<string, unknown>): Entry {
  const data = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
  return {
    ...(data as object),
    ...Object.fromEntries(Object.entries(r).filter(([k]) => k !== "data")),
  } as Entry;
}
const cols: Record<string, string[]> = {
  bookings: [
    "room_id",
    "checkin",
    "checkout",
    "status",
    "source",
    "guest_id",
    "idempotency_key",
  ],
  availability_blocks: [
    "room_id",
    "checkin",
    "checkout",
    "source",
    "external_uid",
    "integration_id",
  ],
  room_images: ["room_id"],
  booking_guests: ["booking_id", "guest_id"],
  functions: ["checkin", "checkout", "status"],
  sessions: ["user_id", "token_hash", "expires_at"],
  reset_tokens: ["user_id", "token_hash", "expires_at"],
  guests: ["email"],
  blog_posts: ["slug"],
  users: ["email"],
};
export async function put(table: string, entry: Entry) {
  check(table);
  const now = new Date().toISOString();
  const { id, ...data } = entry;
  const fields: Record<string, unknown> = {
    id,
    data: JSON.stringify(data),
    created_at: entry.created_at ?? now,
    updated_at: now,
  };
  for (const c of cols[table] ?? [])
    if (data[c] !== undefined) fields[c] = data[c];
  if (pg()) {
    fields.data = data;
    await rest(table + "?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(fields),
    });
  } else {
    const keys = Object.keys(fields);
    await db()
      .prepare(
        `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")}) ON CONFLICT(id) DO UPDATE SET ${keys
          .filter((k) => k !== "id" && k !== "created_at")
          .map((k) => `${k}=excluded.${k}`)
          .join(",")}`,
      )
      .bind(...Object.values(fields))
      .run();
  }
  return entry;
}
export async function remove(table: string, id: string) {
  check(table);
  if (pg())
    await rest(table + "?id=eq." + encodeURIComponent(id), {
      method: "DELETE",
    });
  else await db().prepare(`DELETE FROM ${table} WHERE id=?`).bind(id).run();
}
export async function get(table: string, id: string) {
  check(table);
  if (pg()) {
    const rows = await rest(
      table + "?id=eq." + encodeURIComponent(id) + "&limit=1",
    );
    return rows[0] ? unpack(rows[0]) : null;
  }
  const r = await db()
    .prepare(`SELECT * FROM ${table} WHERE id=?`)
    .bind(id)
    .first();
  return r ? unpack(r) : null;
}
export async function audit(actor: string, action: string, detail: unknown) {
  await put("audit_logs", { id: crypto.randomUUID(), actor, action, detail });
}
export async function reserve(entry: Entry, guest: Entry) {
  if (pg()) {
    return rest("rpc/create_reservation", {
      method: "POST",
      body: JSON.stringify({ reservation: entry, guest_record: guest }),
    });
  }
  const now = new Date().toISOString();
  const keys = [
    "id",
    "room_id",
    "checkin",
    "checkout",
    "status",
    "source",
    "guest_id",
    "idempotency_key",
  ];
  const vals = keys.map((k) => entry[k] ?? null);
  try {
    await db().batch([
      db()
        .prepare(
          "INSERT INTO guests (id,email,data,created_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
        )
        .bind(guest.id, guest.email, JSON.stringify(guest), now, now),
      db()
        .prepare(
          `INSERT INTO bookings (${keys.join(",")},data,created_at,updated_at) VALUES (${keys.map(() => "?").join(",")},?,?,?)`,
        )
        .bind(...vals, JSON.stringify(entry), now, now),
      db()
        .prepare(
          "INSERT INTO booking_guests (id,booking_id,guest_id,data,created_at,updated_at) VALUES (?,?,?,?,?,?)",
        )
        .bind(crypto.randomUUID(), entry.id, guest.id, "{}", now, now),
      db()
        .prepare(
          "INSERT INTO audit_logs (id,data,created_at,updated_at) VALUES (?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          JSON.stringify({
            action: "booking.created",
            booking_id: entry.id,
            source: entry.source,
          }),
          now,
          now,
        ),
    ]);
    return entry;
  } catch (e) {
    if (String(e).includes("conflict"))
      throw new Error(
        "Those dates are no longer available. Please choose another room or dates.",
      );
    throw e;
  }
}
export async function rateLimit(key: string, limit = 8, window = 600000) {
  const now = Date.now(),
    slot = Math.floor(now / window),
    id = key + ":" + slot;
  if (pg()) {
    const rows = await rest("rpc/take_rate_limit", {
      method: "POST",
      body: JSON.stringify({ key_id: id, max_count: limit }),
    });
    if (!rows) throw new Error("Too many requests. Please try again later.");
    return;
  }
  const result = await db()
    .prepare(
      `INSERT INTO rate_limits (id,data,created_at,updated_at) VALUES (?, '{"count":1}', ?, ?) ON CONFLICT(id) DO UPDATE SET data=json_set(data,'$.count',json_extract(data,'$.count')+1) RETURNING data`,
    )
    .bind(id, new Date(now).toISOString(), new Date(now).toISOString())
    .first<{ data: string }>();
  if (result && JSON.parse(result.data).count > limit)
    throw new Error("Too many requests. Please try again later.");
}
export async function replaceChannelBlocks(
  integrationId: string,
  entries: Entry[],
) {
  if (pg())
    return rest("rpc/replace_channel_blocks", {
      method: "POST",
      body: JSON.stringify({ integration: integrationId, blocks: entries }),
    });
  const now = new Date().toISOString();
  await db().batch([
    db()
      .prepare("DELETE FROM availability_blocks WHERE integration_id=?")
      .bind(integrationId),
    ...entries.map((e) =>
      db()
        .prepare(
          "INSERT INTO availability_blocks(id,room_id,checkin,checkout,source,external_uid,integration_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          e.id,
          e.room_id,
          e.checkin,
          e.checkout,
          e.source,
          e.external_uid,
          integrationId,
          JSON.stringify(e),
          now,
          now,
        ),
    ),
  ]);
}
export async function saveFunction(entry: Entry, roomIds: string[]) {
  if (pg())
    return rest("rpc/save_function", {
      method: "POST",
      body: JSON.stringify({ function_record: entry, room_ids: roomIds }),
    });
  const now = new Date().toISOString();
  await db().batch([
    db()
      .prepare("DELETE FROM availability_blocks WHERE function_id=?")
      .bind(entry.id),
    db()
      .prepare(
        "INSERT INTO functions(id,checkin,checkout,status,data,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET checkin=excluded.checkin,checkout=excluded.checkout,status=excluded.status,data=excluded.data,updated_at=excluded.updated_at",
      )
      .bind(
        entry.id,
        entry.checkin,
        entry.checkout,
        entry.status,
        JSON.stringify(entry),
        now,
        now,
      ),
    ...(entry.status === "CONFIRMED" ? roomIds : []).map((roomId) =>
      db()
        .prepare(
          "INSERT INTO availability_blocks(id,room_id,checkin,checkout,source,function_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          roomId,
          entry.checkin,
          entry.checkout,
          "FUNCTION",
          entry.id,
          JSON.stringify({ notes: entry.name, function_id: entry.id }),
          now,
          now,
        ),
    ),
    db()
      .prepare(
        "INSERT INTO audit_logs(id,data,created_at,updated_at) VALUES(?,?,?,?)",
      )
      .bind(
        crypto.randomUUID(),
        JSON.stringify({
          action: "function.saved",
          function_id: entry.id,
          room_ids: roomIds,
        }),
        now,
        now,
      ),
  ]);
  return entry;
}
export async function consumeResetToken(digest: string) {
  const now = new Date().toISOString();
  if (pg()) {
    const rows = await rest(
      "reset_tokens?token_hash=eq." +
        encodeURIComponent(digest) +
        "&expires_at=gt." +
        encodeURIComponent(now),
      { method: "DELETE" },
    );
    return rows[0] ? unpack(rows[0]) : null;
  }
  const row = await db()
    .prepare(
      "DELETE FROM reset_tokens WHERE token_hash=? AND expires_at>? RETURNING *",
    )
    .bind(digest, now)
    .first();
  return row ? unpack(row) : null;
}
