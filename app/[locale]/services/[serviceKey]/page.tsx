import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function ServiceDetail({ params }: { params: { locale: string; serviceKey: string } }) {
  const service = await prisma.service.findUnique({ where: { key: params.serviceKey as any } });
  if (!service || !service.isActive) return notFound();
  const names = service.nameI18n as Record<string, string>;
  return (
    <SiteShell locale={params.locale} title={names[params.locale] ?? names.en}>
      <p className="mb-4">Default duration: {service.defaultDurationMin} min</p>
      <Link className="rounded bg-blue-600 px-3 py-2 text-white" href={`/${params.locale}/book/${service.key}`}>Book appointment</Link>
    </SiteShell>
  );
}
