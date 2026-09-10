import { notFound } from "next/navigation";
import { get, list } from "@/db/repository";
import { Shell, PageIntro } from "@/components/site/shell";
import { settings } from "@/lib/public-data";
import { meta } from "@/lib/seo";
import { Gallery } from "@/components/site/controls";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await get("rooms", id);
  return meta(
    String(r?.name ?? "Room"),
    String(r?.description ?? ""),
    "/accommodation/" + id,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await get("rooms", id);
  if (!r || !r.published) notFound();
  const imgs = (await list("room_images")).filter((i) => i.room_id === id);
  return (
    <Shell settings={await settings()}>
      <main id="main">
        <PageIntro
          eyebrow="Make yourself at home"
          title={String(r.name)}
          text={String(r.description)}
        />
        <div className="page-body">
          <Gallery
            images={[
              { id: r.id, image: r.image, title: r.name, alt: r.name },
              ...imgs,
            ]}
          />
          <div className="form-panel">
            <h2>The details of your stay</h2>
            <p>
              Up to {Number(r.capacity)} guests · {String(r.beds)}
              <br />
              {String(r.bathroom)}
            </p>
            <p>{String(r.amenities ?? "")}</p>
            {r.price != null && (
              <h3>R {Number(r.price).toLocaleString("en-ZA")} per night</h3>
            )}
            <a className="button" href={"/book?room=" + id}>
              Check availability
            </a>
          </div>
        </div>
      </main>
    </Shell>
  );
}
