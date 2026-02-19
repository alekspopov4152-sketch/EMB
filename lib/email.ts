import { prisma } from "@/lib/prisma";

export async function enqueueEmail(params: { toEmail: string; subject: string; bodyText: string; bodyHtml?: string }) {
  return prisma.emailOutbox.create({ data: { ...params } });
}
