import {
  Shell,
  PageIntro,
  FinalCTA,
  ExternalBookings,
} from "@/components/site/shell";
import { RoomCards } from "@/components/site/rooms";
import { publicData } from "@/lib/public-data";
import { meta } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const generateMetadata = () =>
  meta(
    "Accommodation in Bandelierkop",
    "Find your farmhouse stay at BelofteBos near Louis Trichardt, Limpopo. Ask about room options and current rates.",
    "/accommodation",
  );
export default async function Page() {
  const d = await publicData();
  return (
    <Shell settings={d.settings}>
      <main id="main">
        <PageIntro
          eyebrow="A soft landing in the countryside"
          title="Your place to rest."
          text="A night on the road, a few days together, a little time to yourself. Let’s find the stay that suits you."
        />
        <div className="page-body">
          <RoomCards rooms={d.rooms} />
          <ExternalBookings settings={d.settings} />
        </div>
        <FinalCTA />
      </main>
    </Shell>
  );
}
