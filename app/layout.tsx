import type { Metadata } from "next";
import {config} from "@/db/repository";
import {origin} from "@/lib/seo";
import "./globals.css";
export const dynamic = "force-dynamic";
const baseMetadata: Metadata = {
  title: {
    default: "BelofteBos Farmhouse Inn | Bandelierkop, Limpopo",
    template: "%s | BelofteBos Farmhouse Inn",
  },
  description:
    "A peaceful farmhouse stay in Bandelierkop, Limpopo. Rest, reconnect and enjoy a warm countryside welcome near Louis Trichardt and the N1.",
  icons: { icon: "/images/beloftebos-logo-256.webp" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "BelofteBos Farmhouse Inn",
    description: "A peaceful countryside stay in the heart of Limpopo.",
    images: ["/images/property.avif"],
  },
  twitter: { card: "summary_large_image" },
};
export function generateMetadata():Metadata {return {...baseMetadata,metadataBase:new URL(origin()),verification:{google:config("GOOGLE_SITE_VERIFICATION")||undefined}}}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}
