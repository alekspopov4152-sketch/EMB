import { PrismaClient, ServiceKey } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: "TIMEZONE" },
    update: { value: "Africa/Cairo" },
    create: { key: "TIMEZONE", value: "Africa/Cairo" },
  });
  await prisma.setting.upsert({
    where: { key: "BOOKING_WINDOW_DAYS" },
    update: { value: 30 },
    create: { key: "BOOKING_WINDOW_DAYS", value: 30 },
  });
  await prisma.setting.upsert({
    where: { key: "FILE_MAX_MB" },
    update: { value: 10 },
    create: { key: "FILE_MAX_MB", value: 10 },
  });

  const services = [
    { key: ServiceKey.VISA, name: { bg: "Българска виза", en: "Bulgarian visa", ar: "تأشيرة بلغارية" } },
    { key: ServiceKey.ID_DOCS, name: { bg: "Документи за самоличност", en: "Identity documents", ar: "وثائق الهوية" } },
    { key: ServiceKey.CITIZENSHIP, name: { bg: "Българско гражданство", en: "Bulgarian citizenship", ar: "الجنسية البلغارية" } },
    { key: ServiceKey.NOTARY, name: { bg: "Нотариални услуги", en: "Notarial services", ar: "خدمات التوثيق" } },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { key: s.key },
      update: { nameI18n: s.name },
      create: {
        key: s.key,
        nameI18n: s.name,
        acceptsAppointments: true,
        isActive: true,
        defaultDurationMin: 20,
      },
    });
  }
}

main().finally(async () => prisma.$disconnect());
