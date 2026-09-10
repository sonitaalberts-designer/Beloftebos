import { content } from "@/lib/public-data";
import { origin } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const routes = [
    "",
    "/accommodation",
    "/functions",
    "/gallery",
    "/eat-drink",
    "/contact",
    "/journal",
  ];
  const posts = await content("blog_posts");
  return [
    ...routes.map((p) => ({ url: origin() + p })),
    ...posts.map((p) => ({
      url: origin() + "/journal/" + p.slug,
      lastModified: String(p.updated_at ?? "2026-09-10"),
    })),
  ];
}
