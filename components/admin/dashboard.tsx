"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  Leaf,
  BookOpen,
  Images,
  Settings,
  Link2,
  MessageSquare,
  CalendarCheck,
  Globe,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LogOut,
  Search,
} from "lucide-react";
import { Choice } from "@/components/site/controls";
import { schemas, type FormField } from "./fields";
import { type Entry, defaults } from "@/lib/content";
import { activeStatuses } from "@/lib/validation";
type Data = Record<string, Entry[]>;
const nav = [
  ["overview", "Overview", LayoutDashboard],
  ["bookings", "Bookings", CalendarCheck],
  ["calendar", "Calendar", CalendarDays],
  ["accommodation", "Accommodation", BedDouble],
  ["functions", "Functions", Leaf],
  ["guests", "Guests", Users],
  ["availability", "Availability", CalendarDays],
  ["journal", "Blog / Journal", BookOpen],
  ["gallery", "Gallery", Images],
  ["content", "Website Content", Globe],
  ["reviews", "Reviews", MessageSquare],
  ["settings", "Settings", Settings],
  ["integrations", "Integrations", Link2],
  ["users", "Users", ShieldCheck],
] as const;
const collections: Record<string, string> = {
  bookings: "bookings",
  accommodation: "rooms",
  functions: "functions",
  guests: "guests",
  availability: "availability_blocks",
  journal: "blog_posts",
  gallery: "gallery_images",
  reviews: "testimonials",
  integrations: "integration_settings",
  users: "users",
};
async function api(path: string, data: unknown) {
  const r = await fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error);
  return d;
}
export function AdminApp({ section }: { section: string }) {
  const [data, setData] = useState<Data>({}),
    [user, setUser] = useState({ name: "", email: "" }),
    [services, setServices] = useState<Record<string, unknown>>({}),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [editor, setEditor] = useState<{ collection: string; entry: Entry } | null>(
      null,
    ),
    [deleting, setDeleting] = useState<{
      collection: string;
      id: string;
    } | null>(null),
    [saving, setSaving] = useState(false),
    [sub, setSub] = useState(""),
    [drag, setDrag] = useState("");
  const reload = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/data");
      if (r.status === 401) {
        location.href = "/admin";
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setData(
        Object.fromEntries(
          Object.entries(d.data as Data).map(([k, v]) => [
            k,
            v.sort(
              (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
            ),
          ]),
        ),
      );
      setUser(d.user);
      setServices(d.services);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);
  const collection = sub || collections[section] || "",
    all = data[collection] ?? [],
    rows = all.filter(
      (e) =>
        (filter === "All" || e.status === filter || e.source === filter) &&
        JSON.stringify(e).toLowerCase().includes(query.toLowerCase()),
    );
  function edit(c: string, e?: Entry) {
    setError("");
    const initial: Entry = {
      ...Object.fromEntries(
        (schemas[c] ?? [])
          .filter((f) => f.options)
          .map((f) => [f.key, f.options![0]]),
      ),
      room_id: data.rooms?.[0]?.id,
      id: crypto.randomUUID(),
      published: false,
      adults: 1,
      children: 0,
      status: c === "bookings" ? "PENDING" : "NEW",
      source: "ADMIN",
      payment_status: "UNPAID",
      frequency_minutes: 60,
      ...e,
    };
    setEditor({ collection: c, entry: initial });
  }
  async function action(
    fn: () => Promise<unknown>,
    success = "Saved successfully.",
  ) {
    setSaving(true);
    setError("");
    try {
      await fn();
      setNotice(success);
      await reload();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setSaving(false);
    }
  }
  async function save() {
    if (!editor) return;
    const c = editor.collection;
    const endpoint =
      c === "bookings"
        ? "admin/booking"
        : c === "availability_blocks"
          ? "admin/block"
          : "admin/save";
    if (
      await action(() => api(endpoint, editor), "Your changes have been saved.")
    )
      setEditor(null);
  }
  function exportRows(items: Entry[]) {
    const columns = [
      "reference",
      "name",
      "first_name",
      "last_name",
      "email",
      "phone",
      "room_name",
      "checkin",
      "checkout",
      "source",
      "status",
      "payment_status",
      "notes",
    ];
    const cell = (s: unknown) =>
      '"' +
      String(s ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const csv = [
      columns.join(","),
      ...items.map((r) => columns.map((c) => cell(r[c])).join(",")),
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "beloftebos-" + section + ".csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Africa/Johannesburg",
    }),
    bookings = data.bookings ?? [],
    active = bookings.filter((b) => activeStatuses.includes(String(b.status))),
    arrivals = active.filter((b) => b.checkin === today),
    departures = active.filter((b) => b.checkout === today),
    current = active.filter(
      (b) => String(b.checkin) <= today && String(b.checkout) > today,
    ),
    upcoming = active
      .filter((b) => String(b.checkin) >= today)
      .sort((a, b) => String(a.checkin).localeCompare(String(b.checkin))),
    pending = (data.function_enquiries ?? []).filter((e) => e.status === "NEW");
  const title = nav.find((n) => n[0] === section)?.[1] ?? "Overview";
  return (
    <SidebarProvider className="admin-app">
      <Sidebar className="admin-sidebar">
        <SidebarHeader className="admin-brand">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/beloftebos-logo-256.webp"
              width="58"
              height="58"
              alt="BelofteBos"
            />
            <div>
              BelofteBos<span>THE FARMHOUSE OFFICE</span>
            </div>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-3">
            {nav.map(([slug, label, Icon]) => (
              <SidebarMenuItem key={slug}>
                <SidebarMenuButton
                  asChild
                  isActive={section === slug}
                  className="h-10 text-[13px]"
                >
                  <a href={"/admin/" + slug}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <a className="admin-view-site" href="/" target="_blank">
            View website <ArrowUpRight size={16} />
          </a>
          <button
            className="admin-view-site"
            onClick={() =>
              api("auth/logout", {}).then(() => (location.href = "/admin"))
            }
          >
            Sign out <LogOut size={16} />
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="admin-main">
        <header className="admin-top">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span>
              BelofteBos <span className="opacity-40 mx-3">/</span> {title}
            </span>
          </div>
          <div className="admin-user">
            <span>{user.name || "Administrator"}</span>
            <span className="avatar">{(user.name || "B").slice(0, 1)}</span>
          </div>
        </header>
        <div className="admin-content">
          <div className="admin-heading">
            <div>
              <span className="eyebrow">
                {new Date().toLocaleDateString("en-ZA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "Africa/Johannesburg",
                })}
              </span>
              <h1>
                {section === "overview"
                  ? "A good day at the farmhouse."
                  : title}
              </h1>
              <p>
                {section === "overview"
                  ? "Your guests, your plans, your little corner of the countryside."
                  : "Everything you need, in one place."}
              </p>
            </div>
            {["overview", "bookings", "calendar"].includes(section) && (
              <button className="button" onClick={() => edit("bookings")}>
                <Plus size={17} /> Add booking
              </button>
            )}
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                className="float-right"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}
          {loading ? (
            <div className="notice">Loading your farmhouse office…</div>
          ) : (
            <>
              {section === "overview" && (
                <>
                  <div className="stats-grid">
                    {[
                      ["Arrivals today", arrivals.length, "Guests to welcome"],
                      [
                        "Departures today",
                        departures.length,
                        "Until next time",
                      ],
                      ["Staying tonight", current.length, "Occupied rooms"],
                      [
                        "Pending enquiries",
                        pending.length + (data.contact_enquiries ?? []).length,
                        "A little follow-up",
                      ],
                    ].map(([label, note, caption]) => (
                      <div className="stat" key={label}>
                        <span>{label}</span>
                        <strong>{note}</strong>
                        <small>{caption}</small>
                      </div>
                    ))}
                  </div>
                  <div className="admin-quick">
                    <button onClick={() => edit("functions")}>
                      <Plus size={16} /> Add function
                    </button>
                    <button onClick={() => edit("availability_blocks")}>
                      <Plus size={16} /> Block dates
                    </button>
                    <button onClick={() => edit("rooms")}>
                      <Plus size={16} /> Add room
                    </button>
                    <button onClick={() => edit("blog_posts")}>
                      <Plus size={16} /> Add blog post
                    </button>
                  </div>
                  <div className="admin-two">
                    <section className="admin-panel">
                      <div className="panel-heading">
                        <h2>Coming to stay</h2>
                        <a href="/admin/bookings">All bookings ↗</a>
                      </div>
                      {upcoming.length ? (
                        <RecordTable
                          rows={upcoming.slice(0, 6)}
                          collection="bookings"
                          edit={edit}
                        />
                      ) : (
                        <Empty
                          title="Room for a warm welcome"
                          text="Upcoming bookings will appear here. Add a room, then create your first booking."
                        />
                      )}
                    </section>
                    <section className="admin-panel">
                      <h2>The farmhouse at a glance</h2>
                      <div className="occupancy-number">
                        {data.rooms?.length
                          ? Math.round(
                              (current.length / data.rooms.length) * 100,
                            )
                          : 0}
                        <span>%</span>
                      </div>
                      <p>Room occupancy tonight</p>
                      <div className="occupancy-bar">
                        <span
                          style={{
                            width:
                              Math.min(
                                100,
                                (current.length / (data.rooms?.length || 1)) *
                                  100,
                              ) + "%",
                          }}
                        />
                      </div>
                      <p>
                        {data.rooms?.length ?? 0} rooms configured ·{" "}
                        {current.length} occupied
                      </p>
                      <a className="text-link" href="/admin/calendar">
                        Open the calendar ↗
                      </a>
                    </section>
                  </div>
                  <div className="admin-two">
                    <section className="admin-panel">
                      <h2>Recent enquiries</h2>
                      {[
                        ...(data.contact_enquiries ?? []),
                        ...(data.function_enquiries ?? []),
                      ]
                        .slice(0, 5)
                        .map((e) => (
                          <div key={e.id} className="enquiry-row">
                            <strong>{String(e.name)}</strong>
                            <span>{String(e.subject ?? e.event_type)}</span>
                            <p>{String(e.message)}</p>
                            <a href={"mailto:" + e.email}>{String(e.email)}</a>
                          </div>
                        ))}
                      {!(
                        data.contact_enquiries?.length ||
                        data.function_enquiries?.length
                      ) && (
                        <Empty
                          title="All quiet for now"
                          text="Contact and function enquiries will arrive here."
                        />
                      )}
                    </section>
                    <section className="admin-panel">
                      <h2>Upcoming functions</h2>
                      {(data.functions ?? [])
                        .filter(
                          (e) =>
                            String(e.checkin) >= today &&
                            !["DECLINED", "COMPLETED"].includes(
                              String(e.status),
                            ),
                        )
                        .slice(0, 5)
                        .map((e) => (
                          <button
                            className="enquiry-row w-full text-left"
                            key={e.id}
                            onClick={() => edit("functions", e)}
                          >
                            <strong>{e.name}</strong>
                            <span>
                              {String(e.checkin)} · {String(e.status)}
                            </span>
                          </button>
                        ))}
                      {!data.functions?.length && (
                        <Empty
                          title="Make room for a gathering"
                          text="Add a function and block any rooms it needs."
                        />
                      )}
                    </section>
                  </div>
                  <ServiceStatus services={services} />
                </>
              )}
              {section === "calendar" && (
                <Calendar
                  bookings={bookings}
                  blocks={data.availability_blocks ?? []}
                  functions={data.functions ?? []}
                  edit={edit}
                />
              )}
              {["content", "settings"].includes(section) && (
                <ContentSettings
                  data={data}
                  section={section}
                  action={action}
                  edit={edit}
                />
              )}
              {section === "users" && (
                <>
                  <div className="admin-panel">
                    <h2>Administrator access</h2>
                    <p>
                      Only authorised staff should be added. Passwords need at
                      least 14 characters.
                    </p>
                    <form
                      className="form-grid"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        action(() =>
                          api(
                            "admin/user",
                            Object.fromEntries(new FormData(form)),
                          ),
                        ).then((ok) => ok && form.reset());
                      }}
                    >
                      {["name", "email", "password"].map((k) => (
                        <label className="field" key={k}>
                          {k}
                          <input
                            name={k}
                            type={
                              k === "password"
                                ? "password"
                                : k === "email"
                                  ? "email"
                                  : "text"
                            }
                            required
                            minLength={k === "password" ? 14 : 2}
                          />
                        </label>
                      ))}
                      <button className="button self-end" disabled={saving}>
                        Add administrator
                      </button>
                    </form>
                  </div>
                  <div className="admin-panel mt-5">
                    {(data.users ?? []).map((u) => (
                      <div key={u.id} className="user-row">
                        <div>
                          <strong>{u.name}</strong>
                          <p>{String(u.email)}</p>
                        </div>
                        {u.email !== user.email && (
                          <button
                            className="button outline"
                            onClick={() =>
                              action(() =>
                                api("admin/user", {
                                  action: "disable",
                                  id: u.id,
                                  disabled: !u.disabled,
                                }),
                              )
                            }
                          >
                            {u.disabled ? "Enable" : "Disable"} access
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {collection && section !== "users" && (
                <>
                  <div className="admin-toolbar">
                    <div className="admin-search">
                      <Search size={17} />
                      <input
                        aria-label="Search records"
                        placeholder="Search…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    {["bookings", "functions"].includes(section) && (
                      <Choice
                        value={filter}
                        onChange={setFilter}
                        options={[
                          "All",
                          ...new Set(
                            all.map((e) => String(e.status ?? "")),
                          ).values(),
                        ].filter(Boolean)}
                        label="Filter status"
                      />
                    )}
                    {section === "functions" && (
                      <button
                        className="button outline"
                        onClick={() => {
                          setSub(sub ? "" : "function_enquiries");
                          setFilter("All");
                        }}
                      >
                        {sub ? "View functions" : "View enquiries"}
                      </button>
                    )}
                    {section === "accommodation" && (
                      <button
                        className="button outline"
                        onClick={() => {
                          setSub(sub ? "" : "room_images");
                        }}
                      >
                        {sub ? "View rooms" : "Room photographs"}
                      </button>
                    )}
                    <button
                      className="button outline"
                      onClick={() => exportRows(rows)}
                    >
                      <ArrowDownToLine size={16} /> Export
                    </button>
                    {schemas[collection] && (
                      <button
                        className="button"
                        onClick={() => edit(collection)}
                      >
                        <Plus size={16} /> Add{" "}
                        {section === "accommodation"
                          ? "room"
                          : section === "journal"
                            ? "post"
                            : "new"}
                      </button>
                    )}
                  </div>
                  {section === "integrations" && (
                    <div className="notice">
                      <strong>Calendar connections, with honest status.</strong>
                      <p>
                        Use a supported ICS feed or manual calendar import.
                        Store private feed URLs and credentials in environment
                        variables, then enter their names here. API two-way sync
                        requires a channel-specific adapter and approved
                        credentials; it is not active. Calendar polling cannot
                        eliminate the delay between independent channel
                        bookings. Keep direct booking disabled until channel
                        arrangements are confirmed.
                      </p>
                      <p>
                        Scheduled sync endpoint: POST /api/cron with the
                        configured bearer secret. Allowlist feed hosts in
                        CALENDAR_ALLOWED_HOSTS.
                      </p>
                    </div>
                  )}
                  {section === "availability" && (
                    <div className="notice">
                      Blocks prevent overnight reservations for the chosen room.
                      The end date is exclusive. For a function, block every
                      affected room and record its reference in the reason.
                    </div>
                  )}
                  {["gallery", "accommodation", "journal"].includes(section) &&
                  !sub ? (
                    <div className="admin-card-grid">
                      {rows.map((e, i) => (
                        <article
                          className="admin-card"
                          key={e.id}
                          draggable={section === "gallery"}
                          onDragStart={() => setDrag(e.id)}
                          onDragOver={(ev) => ev.preventDefault()}
                          onDrop={() => {
                            if (
                              section === "gallery" &&
                              drag &&
                              drag !== e.id
                            ) {
                              const ordered = [...rows];
                              const from = ordered.findIndex(
                                (x) => x.id === drag,
                              );
                              const [moved] = ordered.splice(from, 1);
                              ordered.splice(i, 0, moved);
                              action(async () => {
                                for (let j = 0; j < ordered.length; j++)
                                  await api("admin/save", {
                                    collection,
                                    entry: { ...ordered[j], sort_order: j },
                                  });
                              }, "Gallery order updated.");
                            }
                          }}
                        >
                          {e.image ? (
                            <img
                              src={String(e.image)}
                              alt={String(e.alt ?? e.name ?? e.title ?? "")}
                            />
                          ) : (
                            <div className="image-placeholder">
                              Add a photograph
                            </div>
                          )}
                          <div>
                            <span
                              className={
                                "status " +
                                (e.published ? "confirmed" : "pending")
                              }
                            >
                              {e.published ? "Published" : "Draft"}
                            </span>
                            <h3>{e.name ?? e.title}</h3>
                            <p>{String(e.description ?? e.category ?? "")}</p>
                            <div className="flex gap-3 flex-wrap">
                              <button
                                className="button outline"
                                onClick={() => edit(collection, e)}
                              >
                                Edit
                              </button>
                              <button
                                className="small-link"
                                onClick={() =>
                                  setDeleting({ collection, id: e.id })
                                }
                              >
                                Delete
                              </button>
                              {section === "gallery" && (
                                <>
                                  <button
                                    aria-label="Move image up"
                                    disabled={i === 0}
                                    onClick={() =>
                                      action(async () => {
                                        await api("admin/save", {
                                          collection,
                                          entry: { ...e, sort_order: i - 1 },
                                        });
                                        await api("admin/save", {
                                          collection,
                                          entry: {
                                            ...rows[i - 1],
                                            sort_order: i,
                                          },
                                        });
                                      })
                                    }
                                  >
                                    ↑
                                  </button>
                                  <button
                                    aria-label="Move image down"
                                    disabled={i === rows.length - 1}
                                    onClick={() =>
                                      action(async () => {
                                        await api("admin/save", {
                                          collection,
                                          entry: { ...e, sort_order: i + 1 },
                                        });
                                        await api("admin/save", {
                                          collection,
                                          entry: {
                                            ...rows[i + 1],
                                            sort_order: i,
                                          },
                                        });
                                      })
                                    }
                                  >
                                    ↓
                                  </button>
                                  <GripVertical size={18} />
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-panel">
                      <RecordTable
                        rows={rows}
                        collection={collection}
                        edit={edit}
                      />
                      {section === "integrations" &&
                        rows.map((e) => (
                          <div key={e.id} className="integration-actions">
                            <strong>{e.name}</strong>
                            <p>
                              Last sync: {String(e.last_sync ?? "Never")} ·{" "}
                              {String(e.status ?? "NOT CONNECTED")}
                            </p>
                            {Boolean(e.last_error) && (
                              <p className="text-red-800">
                                {String(e.last_error)}
                              </p>
                            )}
                            <button
                              className="button outline"
                              disabled={saving}
                              onClick={() =>
                                action(
                                  () => api("admin/sync", { id: e.id }),
                                  "Calendar synchronised.",
                                )
                              }
                            >
                              Sync now
                            </button>
                            <label className="button outline ml-3">
                              Import .ics
                              <input
                                className="hidden"
                                type="file"
                                accept=".ics,text/calendar"
                                onChange={async (ev) => {
                                  const f = ev.target.files?.[0];
                                  if (f)
                                    await action(async () =>
                                      api("admin/sync", {
                                        id: e.id,
                                        ics: await f.text(),
                                      }),
                                    );
                                }}
                              />
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                  {!rows.length && (
                    <Empty
                      title="A fresh page"
                      text="Add your first record using the button above. Nothing has been invented or pre-filled as live inventory."
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </SidebarInset>
      <Sheet open={!!editor} onOpenChange={(o) => !o && setEditor(null)}>
        <SheetContent className="admin-editor">
          <SheetTitle>
            {editor?.entry.reference
              ? String(editor.entry.reference)
              : "Edit " + (editor?.collection.replaceAll("_", " ") ?? "record")}
          </SheetTitle>
          <SheetDescription>
            Save your changes when you’re ready.
          </SheetDescription>
          {editor && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div className="form-grid">
                {(schemas[editor.collection] ?? []).map((f) => (
                  <EditorField
                    key={f.key}
                    field={f}
                    value={editor.entry[f.key]}
                    rooms={data.rooms ?? []}
                    change={(value) =>
                      setEditor({
                        ...editor,
                        entry: { ...editor.entry, [f.key]: value },
                      })
                    }
                  />
                ))}
              </div>
              {error && (
                <div className="notice error" role="alert">
                  {error}
                </div>
              )}
              <div className="editor-actions">
                <button className="button" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  className="button outline"
                  onClick={() => setEditor(null)}
                >
                  Cancel
                </button>
              </div>
              {editor.collection === "bookings" && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => exportRows([editor.entry])}
                >
                  Export booking details
                </button>
              )}
              {editor.collection === "availability_blocks" &&
                data.availability_blocks?.some(
                  (b) => b.id === editor.entry.id,
                ) && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => {
                      const reason = String(editor.entry.notes ?? "");
                      if (!reason) {
                        setError("Add an override reason in notes.");
                        return;
                      }
                      action(() =>
                        api("admin/unblock", { id: editor.entry.id, reason }),
                      ).then((ok) => ok && setEditor(null));
                    }}
                  >
                    Remove block with audit reason
                  </button>
                )}
            </form>
          )}
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from the website. Linked booking records may
              prevent deletion. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep record</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                action(() => api("admin/delete", deleting)).then(() =>
                  setDeleting(null),
                )
              }
            >
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="admin-empty">
      <Leaf size={27} strokeWidth={1} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function RecordTable({
  rows,
  collection,
  edit,
}: {
  rows: Entry[];
  collection: string;
  edit: (c: string, e: Entry) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{collection === "bookings" ? "Guest" : "Name"}</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell>
              <strong>
                {String(
                  e.name ??
                    e.title ??
                    e.guest_name ??
                    [e.first_name, e.last_name].filter(Boolean).join(" ") ??
                    e.id,
                )}
              </strong>
              <small className="block">
                {String(e.email ?? e.reference ?? "")}
              </small>
            </TableCell>
            <TableCell>
              {String(
                e.room_name ??
                  e.channel ??
                  e.category ??
                  e.subject ??
                  e.description ??
                  "",
              ).slice(0, 80)}
              <small className="block">
                {String(e.checkin ?? e.preferred_date ?? "")}{" "}
                {e.checkout ? "→ " + e.checkout : ""}
              </small>
            </TableCell>
            <TableCell>
              <span
                className={"status " + String(e.status ?? "").toLowerCase()}
              >
                {String(e.status ?? (e.published ? "Published" : "Draft"))}
              </span>
              {Boolean(e.source) && (
                <small className="block">{String(e.source)}</small>
              )}
            </TableCell>
            <TableCell>
              {schemas[collection] ? (
                <button
                  className="text-link"
                  onClick={() => edit(collection, e)}
                >
                  Open ↗
                </button>
              ) : e.email ? (
                <a className="text-link" href={"mailto:" + e.email}>
                  Email ↗
                </a>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
function EditorField({
  field: f,
  value,
  rooms,
  change,
}: {
  field: FormField;
  value: unknown;
  rooms: Entry[];
  change: (v: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false),
    [err, setErr] = useState("");
  if (f.type === "rooms")
    return (
      <div className="field wide">
        <span>{f.label}</span>
        {rooms.map((r) => (
          <label className="flex items-center gap-3" key={r.id}>
            <Checkbox
              checked={Array.isArray(value) && value.includes(r.id)}
              onCheckedChange={(checked) =>
                change(
                  checked
                    ? [...(Array.isArray(value) ? value : []), r.id]
                    : (Array.isArray(value) ? value : []).filter(
                        (x) => x !== r.id,
                      ),
                )
              }
            />
            {r.name}
          </label>
        ))}
        <small>
          Confirmed functions block these rooms atomically. Conflicting bookings
          prevent confirmation.
        </small>
      </div>
    );
  if (f.type === "boolean")
    return (
      <label className="field wide flex-row items-center justify-between py-2">
        {f.label}
        <Switch checked={!!value} onCheckedChange={change} />
      </label>
    );
  return (
    <label
      className={
        "field " + (["textarea", "image"].includes(f.type ?? "") ? "wide" : "")
      }
    >
      {f.label}
      {f.type === "room" ? (
        <Choice
          value={String(value ?? "")}
          onChange={change}
          options={rooms.map((r) => r.id)}
          labels={Object.fromEntries(rooms.map((r) => [r.id, String(r.name)]))}
          label={f.label}
        />
      ) : f.options ? (
        <Choice
          value={String(value ?? f.options[0])}
          onChange={change}
          options={f.options}
          label={f.label}
        />
      ) : f.type === "textarea" ? (
        <textarea
          className={f.key === "body" ? "article-input" : ""}
          value={String(value ?? "")}
          onChange={(e) => change(e.target.value)}
          required={f.required}
        />
      ) : f.type === "image" ? (
        <>
          <input
            value={String(value ?? "")}
            placeholder="Upload or use an HTTPS image URL"
            onChange={(e) => change(e.target.value)}
          />
          {Boolean(value) && (
            <img
              src={String(value)}
              alt="Selected image preview"
              className="editor-image"
            />
          )}
          <input
            aria-label="Upload image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setErr("");
              try {
                const fd = new FormData();
                fd.set("file", file);
                const r = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: fd,
                  }),
                  d = await r.json();
                if (!r.ok) throw new Error(d.error);
                change(d.url);
              } catch (e) {
                setErr(String(e));
              } finally {
                setUploading(false);
              }
            }}
          />
          {uploading && <small>Uploading photograph…</small>}
          {err && <small role="alert">{err}</small>}
        </>
      ) : (
        <input
          type={f.type ?? "text"}
          value={String(value ?? "")}
          onChange={(e) =>
            change(
              f.type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
          required={f.required}
          min={f.type === "number" ? "0" : undefined}
        />
      )}
      {f.type === "room" && (
        <small>
          {rooms.find((r) => r.id === value)?.name ??
            "Select the room ID. Add rooms first if this list is empty."}
        </small>
      )}
    </label>
  );
}
function ServiceStatus({ services }: { services: Record<string, unknown> }) {
  return (
    <div className="admin-panel">
      <h2>Connections</h2>
      <div className="service-grid">
        <div>
          <strong>Database</strong>
          <p>{String(services.database)}</p>
        </div>
        <div>
          <strong>Email notifications</strong>
          <p>
            {services.email
              ? "Configured"
              : "Not connected — messages remain in the outbox"}
          </p>
        </div>
        <div>
          <strong>Availability export</strong>
          <p>
            {services.calendar
              ? "Configured"
              : "Export token needs configuration"}
          </p>
        </div>
      </div>
    </div>
  );
}
function Calendar({
  bookings,
  blocks,
  functions,
  edit,
}: {
  bookings: Entry[];
  blocks: Entry[];
  functions: Entry[];
  edit: (c: string, e: Entry) => void;
}) {
  const [month, setMonth] = useState(new Date()),
    [view, setView] = useState("month");
  const first = new Date(month.getFullYear(), month.getMonth(), 1),
    start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  const weekStart = new Date(month);
  weekStart.setDate(month.getDate() - ((month.getDay() + 6) % 7));
  const days = Array.from({ length: view === "week" ? 7 : 42 }, (_, i) => {
    const d = new Date(view === "week" ? weekStart : start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const iso = (d: Date) => d.toLocaleDateString("en-CA");
  const events: (Entry & { collection: string })[] = [
    ...bookings
      .filter(
        (b) =>
          !["CANCELLED", "NO-SHOW", "CHECKED-OUT"].includes(String(b.status)),
      )
      .map((e) => ({ ...e, collection: "bookings" })),
    ...blocks.map((e) => ({
      ...e,
      collection: "availability_blocks",
      status: "BLOCKED",
    })),
    ...functions.map((e) => ({
      ...e,
      collection: "functions",
      source: "FUNCTION",
    })),
  ];
  return (
    <section className="admin-panel">
      <div className="calendar-toolbar">
        <div className="flex gap-3 items-center">
          <button
            aria-label="Previous period"
            onClick={() => {
              const d = new Date(month);
              if (view === "week") d.setDate(d.getDate() - 7);
              else d.setMonth(d.getMonth() - 1);
              setMonth(d);
            }}
          >
            <ChevronLeft />
          </button>
          <h2>
            {month.toLocaleDateString("en-ZA", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            aria-label="Next period"
            onClick={() => {
              const d = new Date(month);
              if (view === "week") d.setDate(d.getDate() + 7);
              else d.setMonth(d.getMonth() + 1);
              setMonth(d);
            }}
          >
            <ChevronRight />
          </button>
          <button className="text-link" onClick={() => setMonth(new Date())}>
            Today
          </button>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="calendar-legend">
        {[
          "DIRECT",
          "BOOKING.COM",
          "LEKKESLAAP",
          "FUNCTION",
          "BLOCKED",
          "PENDING",
          "CONFIRMED",
        ].map((s) => (
          <span key={s} className={"event " + s.toLowerCase().replace(".", "")}>
            {s}
          </span>
        ))}
      </div>
      {view === "list" ? (
        <div>
          {events
            .filter(
              (e) => String(e.checkin).slice(0, 7) === iso(month).slice(0, 7),
            )
            .map((e) => (
              <button
                className="calendar-list-item"
                key={e.id}
                onClick={() => edit(e.collection, e)}
              >
                <strong>
                  {String(e.name ?? e.first_name ?? e.notes ?? "Blocked")}
                </strong>
                <span>
                  {String(e.checkin)} → {String(e.checkout)}
                </span>
                <span>{String(e.source ?? e.status)}</span>
              </button>
            ))}
        </div>
      ) : (
        <div className="calendar-scroll">
          <div className="calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div className="weekday" key={d}>
                {d}
              </div>
            ))}
            {days.map((d) => (
              <div
                key={iso(d)}
                className={
                  "calendar-day " +
                  (d.getMonth() !== month.getMonth() ? "outside" : "")
                }
              >
                <button
                  className="day-number"
                  onClick={() =>
                    edit("bookings", {
                      id: crypto.randomUUID(),
                      checkin: iso(d),
                      checkout: iso(new Date(d.getTime() + 86400000)),
                    })
                  }
                >
                  {d.getDate()}
                </button>
                {events
                  .filter(
                    (e) =>
                      String(e.checkin) <= iso(d) &&
                      String(e.checkout) > iso(d),
                  )
                  .map((e) => (
                    <button
                      className={
                        "event " +
                        String(
                          e.status === "BLOCKED"
                            ? "blocked"
                            : (e.source ?? "direct"),
                        )
                          .toLowerCase()
                          .replace(".", "")
                      }
                      key={e.id}
                      onClick={() => edit(e.collection, e)}
                    >
                      {String(e.name ?? e.first_name ?? "Blocked")}{" "}
                      {e.status === "PENDING" ? "· pending" : ""}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
function ContentSettings({
  data,
  section,
  action,
  edit,
}: {
  data: Data;
  section: string;
  action: (fn: () => Promise<unknown>, success?: string) => Promise<boolean>;
  edit: (c: string, e?: Entry) => void;
}) {
  const s = {
    ...defaults,
    ...Object.fromEntries(
      (data.website_settings ?? []).map((e) => [e.id, e.value]),
    ),
  };
  const keys =
    section === "content"
      ? [
          "hero_heading",
          "hero_description",
          "intro_heading",
          "intro_text",
          "meal_text",
          "footer_text",
        ]
      : [
          "contact_name",
          "phone",
          "email",
          "lekker_url",
          "booking_url",
          "social_instagram",
          "social_facebook",
          "checkin_time",
          "checkout_time",
          "analytics_id",
        ];
  return (
    <>
      <section className="admin-panel">
        <h2>
          {section === "content"
            ? "Make the website your own."
            : "Property & booking settings"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = Object.fromEntries(new FormData(e.currentTarget));
            action(async () => {
              for (const [id, value] of Object.entries(v))
                await api("admin/save", {
                  collection: "website_settings",
                  entry: { id, value },
                });
            });
          }}
        >
          <div className="form-grid">
            {keys.map((k) => (
              <label
                className={
                  "field " + (/heading|text|description/.test(k) ? "wide" : "")
                }
                key={k}
              >
                {k.replaceAll("_", " ")}
                {/heading|text|description/.test(k) ? (
                  <textarea name={k} defaultValue={String(s[k] ?? "")} />
                ) : (
                  <input name={k} defaultValue={String(s[k] ?? "")} />
                )}
              </label>
            ))}
          </div>
          <button className="button mt-6">Save website settings</button>
        </form>
        {section === "settings" && (
          <>
            <div className="setting-switch">
              <div>
                <strong>Direct online bookings</strong>
                <p>
                  Enable only after room rates, inventory, channel arrangements
                  and terms are confirmed.
                </p>
              </div>
              <Switch
                checked={!!s.direct_booking_enabled}
                onCheckedChange={(value) =>
                  action(() =>
                    api("admin/save", {
                      collection: "website_settings",
                      entry: { id: "direct_booking_enabled", value },
                    }),
                  )
                }
              />
            </div>
            <div className="setting-switch">
              <div>
                <strong>Show WhatsApp</strong>
                <p>
                  Enable after confirming the contact number accepts WhatsApp.
                </p>
              </div>
              <Switch
                checked={!!s.whatsapp_enabled}
                onCheckedChange={(value) =>
                  action(() =>
                    api("admin/save", {
                      collection: "website_settings",
                      entry: { id: "whatsapp_enabled", value },
                    }),
                  )
                }
              />
            </div>
            <div className="notice">
              Secrets are configured in server environment settings. Never paste
              API credentials into website content. Required connections are
              documented in the launch guide.
            </div>
          </>
        )}
      </section>
      {section === "content" && (
        <>
          <div className="admin-quick">
            <button onClick={() => edit("faqs")}>
              <Plus size={16} /> Add FAQ
            </button>
            <button onClick={() => edit("seo_metadata")}>
              <Plus size={16} /> Add SEO metadata
            </button>
            <button onClick={() => edit("menu_items")}>
              <Plus size={16} /> Add menu item
            </button>
          </div>
          {["faqs", "menu_items", "seo_metadata"].map((c) => (
            <section className="admin-panel mb-5" key={c}>
              <h2>
                {c === "faqs"
                  ? "Frequently asked questions"
                  : c === "seo_metadata"
                    ? "Search engine metadata"
                    : "Food & drink menu"}
              </h2>
              <RecordTable rows={data[c] ?? []} collection={c} edit={edit} />
            </section>
          ))}
        </>
      )}
      {section === "settings" && (
        <section className="admin-panel mt-6">
          <h2>Email outbox</h2>
          <p>
            Messages are kept here when delivery is not configured or fails.
          </p>
          {(data.email_outbox ?? []).slice(0, 25).map((e) => (
            <div className="enquiry-row" key={e.id}>
              <strong>
                {String(e.type)} · {String(e.status)}
              </strong>
              <p>{String(e.to)}</p>
              {e.status !== "SENT" && (
                <button
                  className="text-link"
                  onClick={() =>
                    action(() => api("admin/retry-email", { id: e.id }))
                  }
                >
                  Retry delivery
                </button>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  );
}
