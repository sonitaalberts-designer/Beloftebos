import { type Entry } from "./content";
import {
  config,
  list,
  put,
  replaceChannelBlocks,
  audit,
} from "@/db/repository";
import { activeStatuses, date } from "./validation";
export type ChannelAdapter = {
  name: string;
  capabilities: ("ical-import" | "ical-export" | "api-two-way")[];
  sync: (settings: Entry) => Promise<number>;
};
export function parseICS(text: string) {
  if (text.length > 2000000) throw new Error("Calendar is too large");
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const events: Record<string, string>[] = [];
  let e: Record<string, string> | null = null;
  for (const raw of unfolded.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") {
      e = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (e && e.STATUS !== "CANCELLED") {
        if (!e.DTSTART || !e.DTEND || !e.UID)
          throw new Error("Every event needs UID, DTSTART and DTEND");
        if (!/^\d{8}$/.test(e.DTSTART) || !/^\d{8}$/.test(e.DTEND))
          throw new Error(
            "Only all-day date calendars are supported. Use a channel adapter for timed events.",
          );
        const format = (s: string) =>
          `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
        e.start = format(e.DTSTART);
        e.end = format(e.DTEND);
        date.parse(e.start);
        date.parse(e.end);
        if (e.end <= e.start) throw new Error("Invalid calendar date range");
        events.push(e);
      }
      e = null;
      continue;
    }
    if (e) {
      const at = line.indexOf(":");
      if (at > 0) {
        const k = line.slice(0, at).split(";")[0];
        if (k === "RRULE" || k === "RDATE")
          throw new Error(
            "Recurring feeds require a channel adapter; existing blocks were retained",
          );
        e[k] = line.slice(at + 1);
      }
    }
  }
  if (
    !unfolded.includes("BEGIN:VCALENDAR") ||
    !unfolded.includes("END:VCALENDAR")
  )
    throw new Error("Invalid iCalendar");
  return events;
}
export async function syncChannel(s: Entry, text?: string) {
  if (!s.room_id) throw new Error("Map a room before synchronising");
  let body = text;
  if (!body) {
    const ref = String(s.feed_env ?? "");
    if (!/^[A-Z][A-Z0-9_]{2,80}$/.test(ref))
      throw new Error("Configure a feed environment variable");
    const url = new URL(config(ref));
    const allowed = config("CALENDAR_ALLOWED_HOSTS")
      .split(",")
      .map((v) => v.trim());
    if (
      url.protocol !== "https:" ||
      !allowed.includes(url.hostname) ||
      url.username ||
      url.password
    )
      throw new Error("Calendar host is not in the server allowlist");
    const r = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok)
      throw new Error(
        "Channel feed could not be fetched; previous blocks were retained",
      );
    body = await r.text();
  }
  const events = parseICS(body);
  if (events.length > 1000) throw new Error("Feed contains too many events");
  await replaceChannelBlocks(
    s.id,
    events.map((e) => ({
      id: crypto.randomUUID(),
      room_id: s.room_id,
      checkin: e.start,
      checkout: e.end,
      source: s.channel ?? "OTHER",
      external_uid: e.UID,
      integration_id: s.id,
      notes: "Imported calendar block",
    })),
  );
  await put("integration_settings", {
    ...s,
    last_sync: new Date().toISOString(),
    last_error: "",
    status: "CONNECTED",
  });
  await audit("system", "channel.synced", { id: s.id, count: events.length });
  return events.length;
}
export function exportICS(roomId: string, bookings: Entry[], blocks: Entry[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BelofteBos//Availability//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const b of [
    ...bookings.filter((b) => activeStatuses.includes(String(b.status))),
    ...blocks,
  ].filter((b) => b.room_id === roomId)) {
    lines.push(
      "BEGIN:VEVENT",
      "UID:" + b.id + "@beloftebos",
      "DTSTAMP:" +
        new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, ""),
      "DTSTART;VALUE=DATE:" + String(b.checkin).replaceAll("-", ""),
      "DTEND;VALUE=DATE:" + String(b.checkout).replaceAll("-", ""),
      "SUMMARY:Unavailable",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
export const adapters: ChannelAdapter[] = [
  "BOOKING.COM",
  "LEKKESLAAP",
  "OTHER",
].map((name) => ({
  name,
  capabilities: ["ical-import", "ical-export"],
  sync: syncChannel,
}));
export async function syncDue() {
  const results = [];
  for (const s of await list("integration_settings"))
    if (
      s.enabled &&
      s.feed_env &&
      (!s.last_sync ||
        Date.now() - Date.parse(String(s.last_sync)) >
          Number(s.frequency_minutes ?? 60) * 60000)
    ) {
      try {
        results.push({ id: s.id, count: await syncChannel(s) });
      } catch (e) {
        await put("integration_settings", {
          ...s,
          status: "ERROR",
          last_error: String(e),
        });
        results.push({
          id: s.id,
          error: "Sync failed; previous blocks retained",
        });
      }
    }
  return results;
}
