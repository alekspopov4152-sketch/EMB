import { SiteShell } from "@/components/site-shell";

export default function StatusPage({ params }: { params: { locale: string } }) {
  return <SiteShell locale={params.locale} title="Find your booking">Fallback send-link flow page.</SiteShell>;
}
