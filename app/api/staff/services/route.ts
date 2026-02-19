import { StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const services = await prisma.service.findMany({ orderBy: { key: "asc" } });
  return ok({ services });
}

export async function POST(req: Request) {
  await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const parsed = z.object({ id: z.string(), isActive: z.boolean().optional(), defaultDurationMin: z.number().int().positive().optional() }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const updated = await prisma.service.update({ where: { id: parsed.data.id }, data: { isActive: parsed.data.isActive, defaultDurationMin: parsed.data.defaultDurationMin } });
  return ok({ service: updated });
}
