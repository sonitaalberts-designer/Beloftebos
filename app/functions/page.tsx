import { Photo } from "@/components/site/photo";
import { Shell, PageIntro } from "@/components/site/shell";
import { EnquiryForm } from "@/components/site/forms";
import { settings } from "@/lib/public-data";
import { photos } from "@/lib/content";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Functions & private gatherings",
    "Enquire about a private gathering at BelofteBos in Bandelierkop. Discuss dates, catering and accommodation with Heidi.",
    "/functions",
  );
export default async function Page() {
  return (
    <Shell settings={await settings()}>
      <main id="main">
        <PageIntro
          eyebrow="For the people and moments that matter"
          title="A place to come together."
          text="Tell us your plans, your people and your preferred date. We’ll help you explore what’s possible at the farmhouse."
        />
        <div className="page-body">
          <Photo
            src={photos.garden}
            alt="The garden at BelofteBos Farmhouse Inn"
            className="w-full h-[400px] object-cover rounded-lg mb-14"
          />
          <div className="contact-layout">
            <div>
              <h2>
                Make a little
                <br />
                room for connection.
              </h2>
              <p>
                Private functions, celebrations, family gatherings, corporate
                gatherings and special occasions — every enquiry begins with a
                conversation.
              </p>
              <p>
                We’ll discuss suitability, guest numbers, catering and
                accommodation with you. Dates and arrangements are subject to
                confirmation.
              </p>
            </div>
            <EnquiryForm functionForm />
          </div>
        </div>
      </main>
    </Shell>
  );
}
