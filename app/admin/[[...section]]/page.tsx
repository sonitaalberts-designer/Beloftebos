import { admin } from "@/lib/auth";
import { AdminLogin } from "@/components/admin/login";
import { AdminApp } from "@/components/admin/dashboard";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "The farmhouse office",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<{ reset?: string }>;
}) {
  const u = await admin();
  if (!u) return <AdminLogin resetToken={(await searchParams).reset} />;
  const p = await params;
  return <AdminApp section={p.section?.[0] ?? "overview"} />;
}
