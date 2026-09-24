import { Header, Consent, Analytics } from "./controls";
import { ArrowUpRight } from "lucide-react";
import { brand, defaults } from "@/lib/content";
export function Footer({
  settings = defaults,
}: {
  settings?: Record<string, unknown>;
}) {
  return (
    <footer>
      <div className="footer-top">
        <img
          src="/images/beloftebos-illustrative-256.webp"
          alt="BelofteBos Farmhouse Inn"
          width="150"
          height="150"
        />
        <div>
          <h3>{String(settings.footer_text)}</h3>
          <p>
            Bandelierkop, Limpopo
            <br />
            South Africa
          </p>
        </div>
        <div>
          <span className="eyebrow">Make yourself at home</span>
          <a href="/accommodation">Accommodation</a>
          <a href="/functions">Functions & gatherings</a>
          <a href="/journal">The journal</a>
          <a href="/gallery">Look around</a>
        </div>
        <div>
          <span className="eyebrow">Let’s talk</span>
          <a href={"tel:" + String(settings.phone).replace(/\s/g, "")}>
            {String(settings.phone)}
          </a>
          <a href={"mailto:" + settings.email}>{String(settings.email)}</a>
          <a href="/contact">
            Speak to {String(settings.contact_name ?? "Heidi")}{" "}
            <ArrowUpRight size={14} />
          </a>
          {Boolean(settings.social_instagram) && (
            <a href={String(settings.social_instagram)}>Instagram</a>
          )}
          {Boolean(settings.social_facebook) && (
            <a href={String(settings.social_facebook)}>Facebook</a>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} BelofteBos Farmhouse Inn</span>
        <div>
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/cookie-policy">Cookies</a>
          <a href="/admin">Admin</a>
        </div>
        <span>Rooted in the countryside.</span>
      </div>
    </footer>
  );
}
export function Shell({
  children,
  settings = defaults,
}: {
  children: React.ReactNode;
  settings?: Record<string, unknown>;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer settings={settings} />
      <Consent />
      <Analytics id={String(settings.analytics_id ?? "")} />
    </>
  );
}
export function FinalCTA() {
  return (
    <section className="final-cta">
      <span className="eyebrow">
        Good places have a way of staying with you.
      </span>
      <h2>
        Come stay <em>a while.</em>
      </h2>
      <a className="button cream" href="/book">
        Book your stay <ArrowUpRight size={18} />
      </a>
      <p>We look forward to welcoming you.</p>
    </section>
  );
}
export function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="page-intro">
      <a className="breadcrumb" href="/">
        Home
      </a>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </div>
  );
}
export function ExternalBookings({
  settings = defaults,
  whatsapp = false,
}: {
  settings?: Record<string, unknown>;
  whatsapp?: boolean;
}) {
  return (
    <div className="external-bookings">
      <p>Prefer to book through a familiar platform?</p>
      <div>
        {whatsapp && <a href="https://wa.me/27834091170?text=Hello%20Heidi%2C%20I%27d%20like%20to%20enquire%20about%20booking%20a%20stay%20at%20BelofteBos." target="_blank" rel="noopener noreferrer">Book via WhatsApp <ArrowUpRight size={16} /></a>}
        {Boolean(settings.lekker_url) && (
          <a
            href={String(settings.lekker_url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book on LekkeSlaap <ArrowUpRight size={16} />
          </a>
        )}
        {Boolean(settings.booking_url) && (
          <a
            href={String(settings.booking_url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book on Booking.com <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </div>
  );
}
export { brand };
