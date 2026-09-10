import { list, config } from "@/db/repository";
import { defaults, postSeeds, initialFaqs, type Entry } from "./content";
import { gallerySeeds } from "@/lib/gallery-data";
export async function settings() {
  try {
    const values = {...defaults,...Object.fromEntries((await list("website_settings")).map(s=>[s.id,s.value]))};
    if (!values.analytics_id) values.analytics_id=config("GA4_ID");
    return values;
  } catch {
    return defaults;
  }
}
export async function content(table: string, fallback: Entry[] = []) {
  try {
    const rows = await list(table);
    return rows
      .filter((r) => r.published !== false)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  } catch {
    return fallback;
  }
}
export async function publicData() {
  const [s, rooms, posts, faqs, gallery, reviews] = await Promise.all([
    settings(),
    content("rooms"),
    content("blog_posts", postSeeds),
    content("faqs", initialFaqs),
    content("gallery_images", gallerySeeds),
    content("testimonials"),
  ]);
  return { settings: s, rooms, posts, faqs, gallery, reviews };
}
