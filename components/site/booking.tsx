"use client";
import { Photo } from "@/components/site/photo";
import { useState, useEffect } from "react";
import { BookingBar } from "./controls";
import { Field } from "./forms";
import { type Entry } from "@/lib/content";
export function BookingFlow({ initial }: { initial: Record<string, string> }) {
  const [rooms, setRooms] = useState<Entry[]>([]),
    [room, setRoom] = useState<Entry | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [step, setStep] = useState(1),
    [guest, setGuest] = useState<Record<string, FormDataEntryValue>>({}),
    [reference, setReference] = useState(""),
    [idem] = useState(() => crypto.randomUUID());
  const nights =
    (Date.parse(initial.checkout) - Date.parse(initial.checkin)) / 86400000;
  useEffect(() => {
    if (!initial.checkin || !initial.checkout) return;
    let valid = true;
    Promise.resolve().then(() => setBusy(true));
    fetch("/api/availability?" + new URLSearchParams(initial))
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (valid) {
          setRooms(d.rooms);
          setMessage(d.message);
        }
      })
      .catch((e) => valid && setError(e.message))
      .finally(() => valid && setBusy(false));
    return () => {
      valid = false;
    };
  }, [initial]);
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...initial,
          ...guest,
          room_id: room?.id,
          idempotency_key: idem,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setReference(d.reference);
      setStep(4);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Booking could not be submitted",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="booking-steps">
        {[
          "1. Find your stay",
          "2. Your details",
          "3. Review",
          "4. Received",
        ].map((s, i) => (
          <span className={step === i + 1 ? "active" : ""} key={s}>
            {s}
          </span>
        ))}
      </div>
      {step === 1 && (
        <>
          <BookingBar initial={initial} />
          <div className="booking-results" aria-live="polite">
            {busy ? (
              <p>Checking rooms and blocked dates…</p>
            ) : initial.checkin ? (
              <>
                <h2>
                  {rooms.length
                    ? "Make yourself at home."
                    : "Let’s find your stay."}
                </h2>
                {message && (
                  <div className="notice">
                    {message}{" "}
                    <a href="/contact" className="underline">
                      Get in touch
                    </a>
                  </div>
                )}
                {rooms.map((r) => (
                  <article className="room-result" key={r.id}>
                    {r.image && (
                      <Photo src={String(r.image)} alt={String(r.name)} />
                    )}
                    <div>
                      <h3>{r.name}</h3>
                      <p>{r.description}</p>
                      <p>
                        {String(r.beds)} · {Number(r.capacity)} guests
                      </p>
                      <strong>
                        R {(Number(r.price) * nights).toLocaleString("en-ZA")}{" "}
                        for {nights} night{nights !== 1 ? "s" : ""}
                      </strong>
                    </div>
                    <button
                      className="button"
                      onClick={() => {
                        setRoom(r);
                        setStep(2);
                        setError("");
                      }}
                    >
                      Select room
                    </button>
                  </article>
                ))}
              </>
            ) : (
              <p>
                Select your dates and number of guests to check direct
                availability.
              </p>
            )}
          </div>
        </>
      )}
      {(step === 2 || step === 3) && room && (
        <div className="booking-layout">
          <div>
            {step === 2 ? (
              <form
                className="form-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = Object.fromEntries(new FormData(e.currentTarget));
                  if (
                    Number(v.adults) + Number(v.children) !==
                    Number(initial.guests)
                  ) {
                    setError(
                      "Adults and children must match your search total.",
                    );
                    return;
                  }
                  setGuest(v);
                  setError("");
                  setStep(3);
                }}
              >
                <h2>Your details</h2>
                <div className="form-grid">
                  <Field
                    label="First name"
                    name="first_name"
                    required
                    defaultValue={String(guest.first_name ?? "")}
                  />
                  <Field
                    label="Last name"
                    name="last_name"
                    required
                    defaultValue={String(guest.last_name ?? "")}
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    required
                    defaultValue={String(guest.email ?? "")}
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    type="tel"
                    required
                    defaultValue={String(guest.phone ?? "")}
                  />
                  <Field
                    label="Adults"
                    name="adults"
                    type="number"
                    required
                    min="1"
                    defaultValue={String(guest.adults ?? initial.guests)}
                  />
                  <Field
                    label="Children"
                    name="children"
                    type="number"
                    required
                    min="0"
                    defaultValue={String(guest.children ?? 0)}
                  />
                  <Field
                    label="Expected arrival"
                    name="arrival_time"
                    type="time"
                    defaultValue={String(guest.arrival_time ?? "")}
                  />
                  <Field
                    label="Special requests"
                    name="special_requests"
                    type="textarea"
                    wide
                    defaultValue={String(guest.special_requests ?? "")}
                  />
                </div>
                <p className="form-help">
                  Special requests are subject to confirmation by the property.
                </p>
                <button className="button">Review booking</button>
              </form>
            ) : (
              <div className="form-panel">
                <h2>A last look before you send.</h2>
                <p>
                  {String(guest.first_name)} {String(guest.last_name)}
                  <br />
                  {String(guest.email)}
                  <br />
                  {String(guest.phone)}
                </p>
                <p>
                  {String(guest.adults)} adults · {String(guest.children)}{" "}
                  children
                </p>
                <p>{String(guest.special_requests ?? "")}</p>
                <div className="notice">
                  Your booking will be pending confirmation by BelofteBos. No
                  payment is taken here. The property will confirm payment and
                  cancellation terms before final confirmation.
                </div>
                <p className="form-help">
                  By submitting, you agree to the{" "}
                  <a className="underline" href="/terms">
                    booking terms
                  </a>{" "}
                  and acknowledge the{" "}
                  <a className="underline" href="/privacy-policy">
                    privacy notice
                  </a>
                  .
                </p>
                <button className="button" disabled={busy} onClick={submit}>
                  {busy ? "Submitting…" : "Submit booking request"}
                </button>
                <button className="text-link ml-5" onClick={() => setStep(2)}>
                  Edit details
                </button>
              </div>
            )}
          </div>
          <aside className="booking-summary">
            <span className="eyebrow">Your farmhouse stay</span>
            <h3>{room.name}</h3>
            <p>
              {initial.checkin} → {initial.checkout}
              <br />
              {nights} nights · {initial.guests} guests
            </p>
            <hr />
            <p>Total accommodation</p>
            <h3>R {(Number(room.price) * nights).toLocaleString("en-ZA")}</h3>
            <p>
              Meals by arrangement.
              <br />
              Source: direct booking.
            </p>
            <button
              className="text-link"
              onClick={() => {
                setStep(1);
                setRoom(null);
              }}
            >
              Change room
            </button>
          </aside>
        </div>
      )}
      {step === 4 && (
        <div className="form-panel text-center">
          <span className="eyebrow">We look forward to welcoming you</span>
          <h2>Your request has arrived.</h2>
          <p>
            Booking reference: <strong>{reference}</strong>
          </p>
          <div className="notice">
            Pending confirmation. Your room dates have been held in our booking
            calendar. Heidi will confirm your arrangements. No payment has been
            taken.
          </div>
          <p>
            Keep this reference. You can contact the property on +27 83 409
            1170.
          </p>
          <a className="button" href="/">
            Back to BelofteBos
          </a>
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
