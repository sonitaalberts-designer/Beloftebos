import { Gallery } from "@/components/site/controls";
import { kidsPartyImages } from "@/lib/kids-party-gallery";
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
export default async function Page({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event } = await searchParams;
  const selected = ["Weddings", "Catering", "Kids parties", "Spesial events", "End year functions"].includes(event ?? "") ? event! : "Private function";
  const kidsParty = selected === "Kids parties";
  return (
    <Shell settings={await settings()}>
      <main id="main">
        <PageIntro
          eyebrow={kidsParty ? "Kids parties at BelofteBos" : "For the people and moments that matter"}
          title={kidsParty ? "Little birthdays. Big memories." : "A place to come together."}
          text={kidsParty ? "Gather under the trees with friends and family for a birthday full of colour, laughter and countryside moments. Let’s make room for your little one’s big day." : "Tell us your plans, your people and your preferred date. We’ll help you explore what’s possible at the farmhouse."}
        />
        <div className="page-body">
          {kidsParty ? <section className="kids-party-gallery" aria-label="Kids party photographs"><Gallery images={kidsPartyImages} /></section> : <Photo
            src={photos.garden}
            alt="The garden at BelofteBos Farmhouse Inn"
            className="w-full h-[400px] object-cover rounded-lg mb-14"
          />}
          <div className="contact-layout">
            <div>
              {kidsParty ? <>
                <span className="eyebrow">Let’s plan a celebration</span>
                <h2>A birthday with room to play.</h2>
                <p>A picnic beneath the branches, colourful decorations and the people who make the day special. Take a look at past celebrations in our gallery and tell Heidi what you have in mind.</p>
                <p>Share your preferred date, your child’s age, the number of children and adults, and any theme or catering ideas. We’ll discuss the arrangements and availability with you.</p>
                <p>Visits and celebrations are by prior booking. Ask us which activities, decorations and catering can be arranged for your date; the photographs show past events.</p>
              </> : <>
                <h2>Make a little<br />room for connection.</h2>
                <p>Private functions, celebrations, family gatherings, corporate gatherings and special occasions — every enquiry begins with a conversation.</p>
                <p>We’ll discuss suitability, guest numbers, catering and accommodation with you. Dates and arrangements are subject to confirmation.</p>
              </>}
            </div>
            <EnquiryForm functionForm initialEvent={selected} />
          </div>
        </div>
      </main>
    </Shell>
  );
}
