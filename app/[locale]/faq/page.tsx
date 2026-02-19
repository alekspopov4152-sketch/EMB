import { SiteShell } from "@/components/site-shell";

export default function Faq({ params }: { params: { locale: string } }) {
  return <SiteShell locale={params.locale} title="FAQ">Frequently asked questions will be managed via CMS.</SiteShell>;
}
