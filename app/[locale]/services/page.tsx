import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { key: "asc" } });
  return (
    <SiteShell locale={params.locale} title="Services">
      <ul className="grid gap-4 md:grid-cols-2">
        {services.map((s) => {
          const names = s.nameI18n as Record<string, string>;
          return (
            <li key={s.id} className="rounded-lg bg-white p-4 shadow">
              <h2 className="font-semibold">{names[params.locale] ?? names.en}</h2>
              <Link className="mt-2 inline-block text-blue-700 underline" href={`/${params.locale}/services/${s.key}`}>Details</Link>
            </li>
          );
        })}
      </ul>
    </SiteShell>
  );
}
