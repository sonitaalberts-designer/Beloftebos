import { Shell, PageIntro } from "@/components/site/shell";
import { settings } from "@/lib/public-data";
import { meta } from "@/lib/seo";
export const generateMetadata = () => meta("Specials", "Ask Heidi about current offers for your stay at BelofteBos Farmhouse Inn in Bandelierkop, Limpopo.", "/specials");
export default async function Specials() {
  const s = await settings();
  return <Shell settings={s}><main id="main">
    <PageIntro eyebrow="A little time away" title="Specials at BelofteBos" text="Planning a countryside stay? Ask Heidi about any current offers for your travel dates." />
    <div className="page-body text-center">
      <p>Contact us for current availability, rates and offer details before booking.</p>
      <a className="button" href="/contact?subject=Specials%20enquiry">Enquire about specials</a>
    </div>
  </main></Shell>;
}
