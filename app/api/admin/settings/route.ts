import { StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  await requireStaff([StaffRole.ADMIN]);
  const settings = await prisma.setting.findMany({ where: { key: { in: ["TIMEZONE", "BOOKING_WINDOW_DAYS", "FILE_MAX_MB"] } } });
  return ok({ settings });
}

export async function POST(req: Request) {
  const admin = await requireStaff([StaffRole.ADMIN]);
  const parsed = z.object({ key: z.string().min(1), value: z.any() }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const item = await prisma.setting.upsert({ where: { key: parsed.data.key }, update: { value: parsed.data.value }, create: { key: parsed.data.key, value: parsed.data.value } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "SETTING_UPDATE", entityType: "Setting", entityId: item.key } });
  return ok({ item });
}
