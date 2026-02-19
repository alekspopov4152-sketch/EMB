import { SiteShell } from "@/components/site-shell";

export default function Contact({ params }: { params: { locale: string } }) {
  return <SiteShell locale={params.locale} title="Contact">Bulgarian Embassy Cairo, Consular Office.</SiteShell>;
}
