import { Shell, PageIntro, FinalCTA } from "@/components/site/shell";
import { Gallery } from "@/components/site/controls";
import { publicData } from "@/lib/public-data";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "A look around BelofteBos",
    "Explore real photographs of the farmhouse, garden, accommodation, food and pool at BelofteBos in Limpopo.",
    "/gallery",
  );
export default async function Page() {
  const d = await publicData();
  return (
    <Shell settings={d.settings}>
      <main id="main">
        <PageIntro
          eyebrow="Little glimpses of life here"
          title="Picture yourself here."
          text="A garden corner. A seat at the table. Your next favourite place to pause."
        />
        <div className="page-body">
          <Gallery images={d.gallery} />
        </div>
        <FinalCTA />
      </main>
    </Shell>
  );
}
