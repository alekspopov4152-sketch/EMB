import { notFound } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { SiteShell } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function NewsDetail({ params }: { params: { locale: string; slug: string } }) {
  const item = await prisma.contentItem.findUnique({ where: { slug: params.slug } });
  if (!item || item.status !== PublishStatus.PUBLISHED) return notFound();
  const content = item.contentI18n as Record<string, { title: string; body: string }>;
  const t = content[params.locale] ?? content.en;
  return (
    <SiteShell locale={params.locale} title={t?.title ?? params.slug}>
      <article className="prose max-w-none rounded bg-white p-4 shadow">{t?.body ?? ""}</article>
    </SiteShell>
  );
}
