import { Shell, PageIntro, ExternalBookings } from "@/components/site/shell";
import { BookingFlow } from "@/components/site/booking";
import { settings } from "@/lib/public-data";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Book your farmhouse stay",
    "Choose your dates and explore direct and partner booking options for BelofteBos Farmhouse Inn in Limpopo.",
    "/book",
  );
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const initial = await searchParams,
    s = await settings();
  return (
    <Shell settings={s}>
      <main id="main">
        <PageIntro
          eyebrow="There’s a slower stay waiting"
          title="Come stay a while."
          text="Choose your dates. Find your room. We’ll take care of the welcome."
        />
        <div className="booking-page">
          <BookingFlow initial={{ guests: "2", ...initial }} />
          <ExternalBookings settings={s} />
        </div>
      </main>
    </Shell>
  );
}
