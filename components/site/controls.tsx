"use client";
import { Photo } from "@/components/site/photo";
import { useEffect, useState, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { type Entry } from "@/lib/content";
import { gallerySeeds } from "@/lib/gallery-data";
export function Choice({
  name,
  value,
  onChange,
  options,
  label,
  labels,
}: {
  name?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
  labels?: Record<string, string>;
}) {
  return (
    <Select name={name} value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label ?? name} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((v) => (
          <SelectItem key={v} value={v}>
            {labels?.[v] ?? v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
const nav = [
  ["Stay", "/#welcome"],
  ["Accommodation", "/accommodation"],
  ["Experience", "/#experience"],
  ["Eat & Drink", "/#eat"],
  ["Functions", "/functions"],
  ["Gallery", "/gallery"],
  ["Journal", "/journal"],
  ["Contact", "/contact"],
];
export function Header() {
  const [open, setOpen] = useState(false),
    [compact, setCompact] = useState(false);
  useEffect(() => {
    const fn = () => setCompact(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className={"site-header " + (compact ? "compact" : "")}>
        <a href="/" aria-label="BelofteBos home" className="logo">
          <Photo
            src="/images/beloftebos-illustrative-256.webp"
            width="100"
            height="100"
            alt="BelofteBos Farmhouse Inn"
          />
        </a>
        <nav aria-label="Main navigation">
          {nav.map(([n, h]) => (
            <a key={n} href={h}>
              {n}
            </a>
          ))}
        </nav>
        <a className="button nav-book" href="/book">
          Book your stay <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-toggle"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu />
        </button>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mobile-dialog">
          <DialogTitle>Make yourself at home.</DialogTitle>
          <DialogDescription>Explore BelofteBos</DialogDescription>
          <nav className="mobile-links">
            {nav.map(([n, h]) => (
              <a onClick={() => setOpen(false)} key={n} href={h}>
                {n}
                <ArrowUpRight />
              </a>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function BookingBar({
  initial,
  large = false,
}: {
  initial?: Record<string, string>;
  large?: boolean;
}) {
  const [guests, setGuests] = useState(initial?.guests ?? "2");
  const [checkin, setCheckin] = useState(initial?.checkin ?? "");
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Johannesburg",
  });
  return (
    <form
      className={"booking-bar " + (large ? "booking-large" : "")}
      action="/book"
    >
      <div className="booking-invitation">
        <span className="eyebrow">Your countryside escape</span>
        <span>Stay a little.</span>
      </div>
      <label>
        <span>Check-in</span>
        <input
          aria-label="Check-in"
          name="checkin"
          type="date"
          min={today}
          required
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
        />
      </label>
      <label>
        <span>Check-out</span>
        <input
          aria-label="Check-out"
          name="checkout"
          type="date"
          min={checkin || today}
          defaultValue={initial?.checkout}
          required
        />
      </label>
      <label>
        <span>Guests</span>
        <Choice
          name="guests"
          value={guests}
          onChange={setGuests}
          options={Array.from({ length: 12 }, (_, i) => String(i + 1))}
          label="Number of guests"
        />
      </label>
      <button
        className="button"
        type="submit"
        onClick={() => track("booking_search")}
      >
        Check availability <ArrowRight size={17} />
      </button>
    </form>
  );
}
export function track(name: string) {
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("bb_analytics") === "yes"
  ) {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("event", name);
  }
}

export function Gallery({
  images = gallerySeeds,
  preview = false,
}: {
  images?: Entry[];
  preview?: boolean;
}) {
  const [category, setCategory] = useState("All"),
    [index, setIndex] = useState<number | null>(null);
  const touch = useRef(0);
  const filtered = images.filter(
    (i) => category === "All" || i.category === category,
  );
  const move = (d: number) =>
    setIndex((i) =>
      i === null ? null : (i + d + filtered.length) % filtered.length,
    );
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (index !== null) {
        if (e.key === "ArrowRight") setIndex((i) => (i! + 1) % filtered.length);
        if (e.key === "ArrowLeft")
          setIndex((i) => (i! - 1 + filtered.length) % filtered.length);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [index, filtered.length]);
  return (
    <>
      {!preview && (
        <div className="gallery-filters" aria-label="Gallery categories">
          {["All", ...new Set(images.map((i) => String(i.category)))].map(
            (c) => (
              <button
                className={category === c ? "active" : ""}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                key={c}
              >
                {c}
              </button>
            ),
          )}
        </div>
      )}
      <div className={"gallery-grid " + (preview ? "preview-gallery" : "")}>
        {filtered.slice(0, preview ? 3 : undefined).map((im, i) => (
          <button
            className="gallery-item"
            onClick={() => setIndex(i)}
            key={im.id}
          >
            <Photo
              src={String(im.image)}
              alt={String(im.alt ?? im.title)}
              loading="lazy"
            />
            <span>
              {im.title} <ArrowUpRight size={18} />
            </span>
          </button>
        ))}
      </div>
      <Dialog open={index !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent
          className="lightbox"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const d = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(d) > 40) move(d < 0 ? 1 : -1);
          }}
        >
          <DialogTitle>{filtered[index ?? 0]?.title}</DialogTitle>
          <DialogDescription>
            {index === null
              ? ""
              : `${index + 1} of ${filtered.length} · Use arrow keys or swipe`}
          </DialogDescription>
          {index !== null && (
            <Photo
              src={String(filtered[index].image)}
              alt={String(filtered[index].alt ?? filtered[index].title)}
            />
          )}
          <div className="lightbox-controls">
            <button
              className="button outline"
              aria-label="Previous photo"
              onClick={() => move(-1)}
            >
              <ChevronLeft />
            </button>
            <button
              className="button outline"
              aria-label="Next photo"
              onClick={() => move(1)}
            >
              <ChevronRight />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function MapSection() {
  const [show, setShow] = useState(false);
  return (
    <div className="map-panel">
      {show ? (
        <iframe
          title="BelofteBos location map"
          src="https://maps.google.com/maps?q=BelofteBos%20Farmhouse%20Inn%20Bandelierkop&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="map-consent">
          <CalendarDays size={28} />
          <h3>Find your way here.</h3>
          <p>Bandelierkop · Limpopo · South Africa</p>
          <button className="button" onClick={() => setShow(true)}>
            Load interactive map
          </button>
          <small>Loads Google Maps, which receives your IP address.</small>
        </div>
      )}
    </div>
  );
}
export function Consent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    void Promise.resolve().then(() =>
      setShow(!localStorage.getItem("bb_analytics")),
    );
  }, []);
  if (!show) return null;
  return (
    <aside className="consent">
      <p>
        We use essential cookies for secure forms and sign-in. Optional
        analytics help us understand visits.
      </p>
      <button
        onClick={() => {
          localStorage.setItem("bb_analytics", "no");
          setShow(false);
        }}
      >
        Essential only
      </button>
      <button
        onClick={() => {
          localStorage.setItem("bb_analytics", "yes");
          setShow(false);
          location.reload();
        }}
      >
        Allow analytics
      </button>
      <a href="/cookie-policy">Details</a>
    </aside>
  );
}
export function Analytics({ id }: { id?: string }) {
  useEffect(() => {
    if (
      !id ||
      !/^G-[A-Z0-9]+$/.test(id) ||
      localStorage.getItem("bb_analytics") !== "yes"
    )
      return;
    const w = window as unknown as {
      dataLayer: unknown[];
      gtag: (...a: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    w.gtag = (...a) => w.dataLayer.push(a);
    w.gtag("js", new Date());
    w.gtag("config", id);
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    script.async = true;
    document.head.append(script);
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link) return;
      const href = link.getAttribute('href') ?? '';
      if (href.startsWith('/book')) w.gtag('event', 'booking_cta_click');
      if (/^https:\/\/(www\.)?(lekkeslaap\.co\.za|booking\.com)\//.test(href)) w.gtag('event', 'external_booking_click', {channel: href.includes('lekkeslaap') ? 'LEKKESLAAP' : 'BOOKING.COM'});
    };
    document.addEventListener('click', click);
    const timer = window.setTimeout(() => {
      if (window.location.pathname.startsWith('/journal/')) w.gtag('event','blog_engagement');
    }, 30000);
    return () => {
      document.removeEventListener('click', click);
      window.clearTimeout(timer);
      script.remove();
    };
  }, [id]);
  return null;
}
