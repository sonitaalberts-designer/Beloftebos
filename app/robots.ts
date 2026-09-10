import { origin } from "@/lib/seo";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/book"],
    },
    sitemap: origin() + "/sitemap.xml",
  };
}
