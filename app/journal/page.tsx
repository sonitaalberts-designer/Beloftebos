import { Photo } from "@/components/site/photo";
import { Shell, PageIntro } from "@/components/site/shell";
import { publicData } from "@/lib/public-data";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "The BelofteBos Journal",
    "Thoughtful guides to a farmhouse stay, Limpopo road trips, Bandelierkop and planning a slower getaway.",
    "/journal",
  );
export default async function Page() {
  const d = await publicData();
  return (
    <Shell settings={d.settings}>
      <main id="main">
        <PageIntro
          eyebrow="Notes from the countryside"
          title="The BelofteBos journal."
          text="Useful little guides, slower journeys and stories to inspire your next stay."
        />
        <div className="page-body journal-grid">
          {d.posts.map((p) => (
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
              <p>{p.description}</p>
              <span className="text-link">Read the story ↗</span>
            </a>
          ))}
        </div>
      </main>
    </Shell>
  );
}
