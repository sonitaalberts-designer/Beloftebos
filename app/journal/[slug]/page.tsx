import { Photo } from "@/components/site/photo";
import { notFound } from "next/navigation";
import { Shell, PageIntro, FinalCTA } from "@/components/site/shell";
import { publicData } from "@/lib/public-data";
import { meta, JsonLd, BreadcrumbSchema, origin } from "@/lib/seo";
function inline(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((s, i) => {
    const m = s.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m && /^(\/|https:\/\/)/.test(m[2]) ? (
      <a key={i} href={m[2]}>
        {m[1]}
      </a>
    ) : (
      s
    );
  });
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    d = await publicData(),
    p = d.posts.find((p) => p.slug === slug);
  return meta(
    String(p?.seo_title ?? p?.title ?? "Journal"),
    String(p?.seo_description ?? p?.description ?? ""),
    "/journal/" + slug,
    String(p?.image ?? ""),
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    d = await publicData(),
    p = d.posts.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <Shell settings={d.settings}>
      <main id="main">
        <PageIntro eyebrow={String(p.category)} title={String(p.title)} />
        <div className="article-meta">
          By {String(p.author)} · Published {String(p.published_at)} · Updated{" "}
          {String(p.updated_at).slice(0, 10)}
        </div>
        <article className="article">
          <Photo src={String(p.image)} alt={String(p.alt)} />
          {String(p.body)
            .split("\n\n")
            .map((v, i) => {
              if (v.startsWith("## ")) {
                const [heading, ...rest] = v.split("\n");
                return (
                  <div key={i}>
                    <h2>{heading.slice(3)}</h2>
                    {rest.length > 0 && <p>{inline(rest.join("\n"))}</p>}
                  </div>
                );
              }
              if (v.startsWith("### ")) return <h3 key={i}>{v.slice(4)}</h3>;
              return <p key={i}>{inline(v)}</p>;
            })}
          <div className="notice">
            <h3>A little more to explore</h3>
            {d.posts
              .filter((x) => x.id !== p.id)
              .slice(0, 2)
              .map((x) => (
                <p key={x.id}>
                  <a href={"/journal/" + x.slug}>{x.title}</a>
                </p>
              ))}
          </div>
        </article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            description: p.description,
            image: origin() + p.image,
            datePublished: p.published_at,
            dateModified: String(p.updated_at).slice(0, 10),
            author: { "@type": "Organization", name: p.author },
            publisher: {
              "@type": "Organization",
              name: "BelofteBos Farmhouse Inn",
            },
            mainEntityOfPage: origin() + "/journal/" + slug,
          }}
        />
        <BreadcrumbSchema
          items={[
            { name: "Home", path: "/" },
            { name: "Journal", path: "/journal" },
            { name: String(p.title), path: "/journal/" + slug },
          ]}
        />
        <FinalCTA />
      </main>
    </Shell>
  );
}
