import Link from "next/link";
import { PublishStatus } from "@prisma/client";
import { SiteShell } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const items = await prisma.contentItem.findMany({ where: { type: "NEWS", status: PublishStatus.PUBLISHED }, orderBy: { publishedAt: "desc" } });
  return (
    <SiteShell locale={params.locale} title="News">
      <ul className="space-y-3">
        {items.map((item) => {
          const data = item.contentI18n as Record<string, { title: string }>;
          return <li key={item.id}><Link className="underline" href={`/${params.locale}/news/${item.slug}`}>{data[params.locale]?.title ?? data.en?.title ?? item.slug}</Link></li>;
        })}
      </ul>
    </SiteShell>
  );
}
