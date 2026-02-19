import { SiteShell } from "@/components/site-shell";

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <SiteShell locale={params.locale} title="Bulgarian Embassy Cairo - Consular Service">
      <p className="rounded-lg bg-white p-4 shadow">Book appointments online for visa, ID docs, citizenship and notarial services.</p>
    </SiteShell>
  );
}
