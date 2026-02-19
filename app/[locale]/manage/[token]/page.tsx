import { SiteShell } from "@/components/site-shell";

export default function ManagePage({ params }: { params: { locale: string; token: string } }) {
  return (
    <SiteShell locale={params.locale} title="Manage booking">
      <p>Token-based booking management page for token: {params.token.slice(0, 8)}...</p>
    </SiteShell>
  );
}
