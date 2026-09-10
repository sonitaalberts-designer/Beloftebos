import { Shell, PageIntro, brand } from "@/components/site/shell";
import { EnquiryForm } from "@/components/site/forms";
import { settings } from "@/lib/public-data";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Contact Heidi",
    "Speak to Heidi Alberts about accommodation, meals or a gathering at BelofteBos Farmhouse Inn, Bandelierkop.",
    "/contact",
  );
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const s = await settings(),
    q = await searchParams;
  return (
    <Shell settings={s}>
      <main id="main">
        <PageIntro
          eyebrow="A warm welcome starts here"
          title="Let’s talk about your stay."
        />
        <div className="page-body contact-layout">
          <div className="contact-details">
            <span className="eyebrow">Your host</span>
            <h2>{String(s.contact_name)}</h2>
            <p>
              A room enquiry, a meal arrangement or a gathering you have in mind
              — we’d love to hear from you.
            </p>
            <a href={"tel:" + String(s.phone).replace(/\s/g, "")}>
              {String(s.phone)}
            </a>
            <a href={"mailto:" + s.email}>{String(s.email)}</a>
            <a className="text-link" href={brand.maps}>
              Bandelierkop, Limpopo · Get directions ↗
            </a>
            {Boolean(s.whatsapp_enabled) && (
              <a
                className="button"
                href={"https://wa.me/" + String(s.phone).replace(/\D/g, "")}
              >
                Chat on WhatsApp
              </a>
            )}
          </div>
          <EnquiryForm subject={q.subject ?? ""} />
        </div>
      </main>
    </Shell>
  );
}
