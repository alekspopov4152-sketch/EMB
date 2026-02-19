export const locales = ["bg", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

export const localeDirection = (locale: string) => (locale === "ar" ? "rtl" : "ltr");
