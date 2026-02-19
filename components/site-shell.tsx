import Link from "next/link";

export function SiteShell({ locale, title, children }: { locale: string; title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <nav className="flex gap-3 text-sm underline">
          <Link href={`/${locale}`}>Home</Link>
          <Link href={`/${locale}/services`}>Services</Link>
          <Link href={`/${locale}/news`}>News</Link>
          <Link href={`/${locale}/contact`}>Contact</Link>
          <Link href={`/${locale}/faq`}>FAQ</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
