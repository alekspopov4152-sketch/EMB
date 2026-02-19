import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isLocale, localeDirection } from "@/lib/i18n";

export default function LocaleLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) return notFound();
  return (
    <section lang={params.locale} dir={localeDirection(params.locale)}>
      {children}
    </section>
  );
}
