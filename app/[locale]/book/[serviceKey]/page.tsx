import { SiteShell } from "@/components/site-shell";

export default function BookPage({ params }: { params: { locale: string; serviceKey: string } }) {
  return (
    <SiteShell locale={params.locale} title={`Book ${params.serviceKey}`}>
      <p className="mb-3">Use public API /api/public/slots and /api/public/bookings to build booking UI flow.</p>
      <div className="rounded bg-white p-4 shadow text-sm">MVP placeholder form container (responsive, mobile-first).</div>
    </SiteShell>
  );
}
