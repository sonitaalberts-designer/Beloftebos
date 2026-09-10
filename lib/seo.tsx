import { config, get } from "@/db/repository";
import { type Metadata } from "next";
export function origin() {
  return (
    config("SITE_URL") ||
    "https://beloftebos-farmhouse-inn.justbrand.chatgpt.site"
  );
}
export async function meta(
  title: string,
  description: string,
  path: string,
  image = "/images/property.avif",
): Promise<Metadata> {
  const saved = await get("seo_metadata", path).catch(() => null);
  title = String(saved?.title ?? title);
  description = String(saved?.description ?? description);
  return {
    title,
    description,
    alternates: { canonical: origin() + path },
    openGraph: {
      title,
      description,
      url: origin() + path,
      images: [origin() + image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [origin() + image],
    },
  };
}
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: v.name,
          item: origin() + v.path,
        })),
      }}
    />
  );
}
