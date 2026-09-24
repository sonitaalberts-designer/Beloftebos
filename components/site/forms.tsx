"use client";
import { useState } from "react";
import { Choice, track } from "./controls";
import { ArrowUpRight } from "lucide-react";
export function Field({
  label,
  name,
  type = "text",
  required = false,
  wide = false,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  wide?: boolean;
  defaultValue?: string;
  min?: string;
}) {
  return (
    <label className={"field " + (wide ? "wide" : "")}>
      {label}
      {type === "textarea" ? (
        <textarea
          name={name}
          required={required}
          defaultValue={defaultValue}
          maxLength={5000}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          min={min}
          maxLength={type === "number" ? undefined : 250}
        />
      )}
    </label>
  );
}
export function EnquiryForm({
  functionForm = false,
  subject = "",
  initialEvent = "Private function",
}: {
  functionForm?: boolean;
  subject?: string;
  initialEvent?: string;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [event, setEvent] = useState(initialEvent),
    [accommodation, setAccommodation] = useState("No");
  return (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const form = e.currentTarget;
        const v = Object.fromEntries(new FormData(form));
        if (functionForm) {
          v.event_type = event;
          v.accommodation = accommodation;
          v.subject = event + " enquiry";
        }
        try {
          const r = await fetch(
            functionForm ? "/api/functions" : "/api/contact",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(v),
            },
          );
          const result = await r.json();
          if (!r.ok) throw new Error(result.error);
          setError(false);
          setMessage(
            "Thank you. Your enquiry has been saved. Heidi will be in touch. Reference: " +
              result.reference,
          );
          track(functionForm ? "function_enquiry" : "contact_submission");
          form.reset();
        } catch (e) {
          setError(true);
          setMessage(String(e instanceof Error ? e.message : e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>
        {functionForm ? "Tell us what you have in mind." : "A little hello."}
      </h2>
      <div className="form-grid">
        <Field label="Your name" name="name" required />
        <Field label="Email address" name="email" type="email" required />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          required={functionForm}
        />
        {functionForm ? (
          <>
            <label className="field">
              Type of gathering
              <Choice
                value={event}
                onChange={setEvent}
                options={[
                  "Weddings",
                  "Catering",
                  "Kids parties",
                  "Spesial events",
                  "End year functions",
                  "Private function",
                  "Celebration",
                  "Family gathering",
                  "Corporate gathering",
                  "Special occasion",
                ]}
                label="Type of gathering"
              />
            </label>
            <Field
              label="Preferred date"
              name="preferred_date"
              type="date"
              required
              min={new Date().toLocaleDateString("en-CA", {
                timeZone: "Africa/Johannesburg",
              })}
            />
            <Field
              label="Number of guests"
              name="guests"
              type="number"
              required
              min="1"
            />
            <Field label="Start time" name="start_time" type="time" required />
            <Field label="End time" name="end_time" type="time" required />
            <Field
              label="Catering requirements"
              name="catering"
              type="textarea"
              wide
            />
            <label className="field wide">
              Will you need accommodation?
              <Choice
                value={accommodation}
                onChange={setAccommodation}
                options={["No", "Yes", "Not sure yet"]}
                label="Accommodation required"
              />
            </label>
          </>
        ) : (
          <Field
            label="Subject"
            name="subject"
            defaultValue={subject}
            required
          />
        )}
        <Field
          label={functionForm ? "Tell us about your plans" : "Your message"}
          name="message"
          type="textarea"
          required
          wide
        />
        <label className="honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <p className="form-help wide">
          We use your details to respond to this enquiry. Read our{" "}
          <a href="/privacy-policy" className="underline">
            privacy notice
          </a>
          . An enquiry does not reserve dates.
        </p>
      </div>
      {message && (
        <div
          role={error ? "alert" : "status"}
          className={"notice " + (error ? "error" : "")}
        >
          {message}
        </div>
      )}
      <button className="button" disabled={busy}>
        {busy
          ? "Sending…"
          : functionForm
            ? "Send function enquiry"
            : "Send your enquiry"}
        <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
