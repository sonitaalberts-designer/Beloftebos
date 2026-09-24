import { Photo } from "@/components/site/photo";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Bird,
  Flame,
  Compass,
  Users,
  Flower2,
} from "lucide-react";
import { Shell, FinalCTA, ExternalBookings } from "@/components/site/shell";
import { BookingBar, MapSection } from "@/components/site/controls";
import { publicData } from "@/lib/public-data";
import { photos, experiences, brand } from "@/lib/content";
import { meta, JsonLd, origin } from "@/lib/seo";
import { RoomCards } from "@/components/site/rooms";
export const dynamic = "force-dynamic";
export const generateMetadata = () =>
  meta(
    "BelofteBos Farmhouse Inn | Bandelierkop, Limpopo",
    "A peaceful farmhouse stay in Bandelierkop, near Louis Trichardt and the N1. Rest, reconnect and enjoy a warm Limpopo welcome.",
    "/",
  );
export default async function Home() {
  const d = await publicData();
  const icons = [Bird, Leaf, Flower2, Flame, Compass, Users];
  return (
    <Shell settings={d.settings}>
      <main id="main">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: brand.name,
            url: origin(),
            telephone: d.settings.phone,
            email: d.settings.email,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bandelierkop",
              addressRegion: "Limpopo",
              addressCountry: "ZA",
            },
            image: origin() + photos.hero,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: brand.name,
            url: origin(),
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: d.faqs.map((f) => ({
              "@type": "Question",
              name: f.title,
              acceptedAnswer: { "@type": "Answer", text: f.description },
            })),
          }}
        />
        <section className="hero">
          <Photo
            className="hero-photo"
            sizes="100vw"
            src={photos.hero}
            alt="Sunlight through the trees over the lawn and countryside at BelofteBos Farmhouse Inn"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="eyebrow">
              Bandelierkop · Limpopo · South Africa
            </span>
            <div className="hero-brand">
              BELOFTEBOS <span>FARMHOUSE INN</span>
            </div>
            <h1>
              {String(d.settings.hero_heading)
                .split("\n")
                .map((l, i) => (
                  <span key={l} className={i ? "italic" : ""}>
                    {l}
                  </span>
                ))}
            </h1>
            <p>{String(d.settings.hero_description)}</p>
            <div className="hero-actions">
              <a className="button cream" href="/book">
                Book your stay <ArrowUpRight size={17} />
              </a>
              <a className="hero-explore" href="#welcome">
                Explore BelofteBos <span>↓</span>
              </a>
            </div>
          </div>
          <div className="hero-logo-badge">
            <Photo src="/images/beloftebos-illustrative-640.webp" alt="BelofteBos Farmhouse Inn" width={640} height={590} />
          </div>
        </section>
        <div className="booking-wrap">
          <BookingBar />
        </div>
        <section id="welcome" className="section intro-section">
          <div className="intro-visual">
            <Photo
              src={photos.nature}
              alt="Stone steps and the welcoming farmhouse terrace"
              loading="lazy"
            />
            <div className="circle-note">
              A little less rush.
              <br />
              <em>A little more life.</em>
              <Leaf size={24} />
            </div>
            <span className="image-caption">
              YOUR LITTLE CORNER OF THE LIMPOPO COUNTRYSIDE
            </span>
          </div>
          <div className="intro-copy">
            <span className="eyebrow">Welcome to BelofteBos</span>
            <h2>
              {String(d.settings.intro_heading)
                .split("\n")
                .map((l, i) => (
                  <span key={l}>{i ? <em>{l}</em> : l}</span>
                ))}
            </h2>
            {String(d.settings.intro_text)
              .split("\n")
              .map((p) => (
                <p key={p}>{p}</p>
              ))}
            <a className="text-link" href="/accommodation">
              Find your place here <ArrowUpRight size={19} />
            </a>
            <span className="handwritten">Come as you are. Stay a while.</span>
          </div>
        </section>
        <section className="slow-section">
          <div className="slow-copy">
            <span className="eyebrow">Room to breathe</span>
            <h2>
              A place to
              <br />
              <em>slow down.</em>
            </h2>
            <p>
              Let the garden set the pace. A little birdsong, a patch of
              afternoon sun, and nowhere you need to be just yet.
            </p>
            <p>
              Here, the small moments have space to become the best part of your
              day.
            </p>
            <a className="text-link" href="/gallery">
              A glimpse of life here <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="oval-image">
            <Photo
              src={photos.garden}
              alt="Leafy garden and picnic tables at BelofteBos"
              loading="lazy"
            />
          </div>
          <span className="slow-side">ROOTED IN NATURE. MADE FOR REST.</span>
        </section>
        <section id="experience" className="section experience-section">
          <div className="section-heading">
            <span className="eyebrow">The BelofteBos experience</span>
            <h2>
              Simple pleasures.
              <br />
              <em>Beautifully unhurried.</em>
            </h2>
          </div>
          <div className="experience-grid">
            {experiences.map(([title, copy], i) => {
              const Icon = icons[i];
              return (
                <div key={title}>
                  <Icon strokeWidth={1} size={38} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              );
            })}
          </div>
        </section>
        <section id="accommodation" className="section accommodation-section">
          <div className="heading-row">
            <div>
              <span className="eyebrow">Settle in. Make yourself at home.</span>
              <h2>
                Your countryside <em>stay.</em>
              </h2>
            </div>
            <a className="text-link" href="/accommodation">
              Explore accommodation <ArrowUpRight size={18} />
            </a>
          </div>
          <RoomCards rooms={d.rooms} preview />
          <ExternalBookings settings={d.settings} />
        </section>
        <section className="photo-transition">
          <Photo
            src={photos.pool}
            alt="BelofteBos swimming pool with the farmhouse garden beyond"
            loading="lazy"
          />
          <div>
            <span className="eyebrow">The luxury of a little time</span>
            <h2>
              Nothing on the agenda.
              <br />
              <em>Everything to enjoy.</em>
            </h2>
          </div>
        </section>
        <section id="eat" className="section eat-section">
          <div className="eat-photos">
            <Photo
              src={photos.food}
              alt="Fresh fruit platter and flowers at the farmhouse table"
              loading="lazy"
            />
            <span className="photo-tag">Pull up a chair.</span>
          </div>
          <div>
            <span className="eyebrow">Eat & drink</span>
            <h2>
              Good food.
              <br />
              Better <em>company.</em>
            </h2>
            <p>{String(d.settings.meal_text)}</p>
            <p>
              From the Tea Garden to the deli and bar, there’s a place to pause.
              Gather around a braai or enjoy an evening by the boma — ask us
              about arrangements for your stay.
            </p>
            <div className="meal-tags">
              <span>Tea Garden</span>
              <span>Meals by arrangement</span>
              <span>Deli & bar</span>
              <span>Braai & boma</span>
            </div>
            <a className="text-link" href="/eat-drink">
              Around our table <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <section className="explore-section section">
          <span className="eyebrow">A little further afield</span>
          <div className="heading-row">
            <h2>
              At home in <em>Limpopo.</em>
            </h2>
            <p>
              An overnight stop on the N1. A countryside base for a longer
              journey. There’s more to discover when you give yourself time.
            </p>
          </div>
          <div className="explore-grid">
            {[
              [
                "01",
                "Louis Trichardt / Makhado",
                "A useful town stop on your northern Limpopo journey.",
                "where-to-stay-near-louis-trichardt",
              ],
              [
                "02",
                "The northern Kruger journey",
                "Plan your route, gate access and time in the park.",
                "northern-kruger-trip-planning",
              ],
              [
                "03",
                "The open road",
                "Make Bandelierkop part of a slower N1 road trip.",
                "limpopo-road-trip-bandelierkop-stop",
              ],
            ].map(([n, t, p, s]) => (
              <a href={"/journal/" + s} key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{p}</p>
                <ArrowUpRight size={23} />
              </a>
            ))}
          </div>
        </section>
        <section className="function-feature">
          <Photo
            src={photos.garden}
            alt="Garden gathering space at BelofteBos"
            loading="lazy"
          />
          <div>
            <span className="eyebrow">Bring your people together</span>
            <h2>
              Some moments deserve
              <br />
              <em>a special place.</em>
            </h2>
            <p>
              A gathering of family, a celebration with friends, a reason to
              reconnect. Tell us what you have in mind, and let’s talk about the
              possibilities.
            </p>
            <a className="button cream" href="/functions">
              Plan a gathering <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <section className="reviews-section section">
          <span className="eyebrow">From those who’ve stayed</span>
          {d.reviews.length ? (
            d.reviews.slice(0, 3).map((r) => (
              <blockquote key={r.id}>
                <p>“{String(r.review ?? r.description)}”</p>
                <cite>
                  {String(r.guest_name ?? r.name)} · {String(r.source)} ·{" "}
                  {String(r.date)}
                </cite>
              </blockquote>
            ))
          ) : (
            <>
              <h2>
                The best stories
                <br />
                come from <em>our guests.</em>
              </h2>
              <p>Read guest feedback from stays booked through LekkeSlaap.</p>
              <a
                className="text-link"
                href={String(d.settings.lekker_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read guest reviews <ArrowUpRight size={17} />
              </a>
            </>
          )}
        </section>
        <section className="section journal-section">
          <div className="heading-row">
            <div>
              <span className="eyebrow">Notes from the countryside</span>
              <h2>
                The BelofteBos <em>journal.</em>
              </h2>
            </div>
            <a className="text-link" href="/journal">
              All our stories <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="journal-grid">
            {d.posts.slice(0, 3).map((p) => (
              <a href={"/journal/" + p.slug} key={p.id}>
                <div className="journal-image">
                  <Photo
                    src={String(p.image)}
                    alt={String(p.alt)}
                    loading="lazy"
                  />
                </div>
                <span className="eyebrow">{String(p.category)}</span>
                <h3>{p.title}</h3>
                <span className="text-link">
                  Read the story <ArrowRight size={17} />
                </span>
              </a>
            ))}
          </div>
        </section>
        <section id="location" className="section location-section">
          <div>
            <span className="eyebrow">Find us in the countryside</span>
            <h2>
              A little off the road.
              <br />
              <em>A world away.</em>
            </h2>
            <p>
              Bandelierkop, Limpopo, South Africa.
              <br />
              Near the N1 and approximately 22 km from Louis Trichardt /
              Makhado.
            </p>
            <p>Your next stop could be your favourite one.</p>
            <a
              className="button"
              href={brand.maps}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <ArrowUpRight size={17} />
            </a>
          </div>
          <MapSection />
        </section>
        <section className="section faq-section">
          <div>
            <span className="eyebrow">A few things you might wonder</span>
            <h2>
              Before you <em>arrive.</em>
            </h2>
            <a className="text-link" href="/contact">
              Ask Heidi <ArrowUpRight size={17} />
            </a>
          </div>
          <div>
            {d.faqs.map((f) => (
              <details key={f.id}>
                <summary>
                  {f.title}
                  <span>+</span>
                </summary>
                <p>{f.description}</p>
              </details>
            ))}
          </div>
        </section>
        <FinalCTA />
      </main>
    </Shell>
  );
}
