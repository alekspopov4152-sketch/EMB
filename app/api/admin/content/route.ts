import { ContentType, PublishStatus, StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  await requireStaff([StaffRole.ADMIN]);
  const content = await prisma.contentItem.findMany({ orderBy: { updatedAt: "desc" } });
  return ok({ content });
}

export async function POST(req: Request) {
  const staff = await requireStaff([StaffRole.ADMIN]);
  const parsed = z.object({ slug: z.string().min(1), type: z.nativeEnum(ContentType), status: z.nativeEnum(PublishStatus), contentI18n: z.any() }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const item = await prisma.contentItem.upsert({
    where: { slug: parsed.data.slug },
    update: { type: parsed.data.type, status: parsed.data.status, contentI18n: parsed.data.contentI18n, authorId: staff.id, publishedAt: parsed.data.status === PublishStatus.PUBLISHED ? new Date() : null },
    create: { ...parsed.data, authorId: staff.id, publishedAt: parsed.data.status === PublishStatus.PUBLISHED ? new Date() : null },
  });
  await prisma.auditLog.create({ data: { actorId: staff.id, action: "CONTENT_SAVE", entityType: "ContentItem", entityId: item.id } });
  return ok({ item });
}
