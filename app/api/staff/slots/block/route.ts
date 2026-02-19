import { SlotStatus, StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function POST(req: Request) {
  await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const parsed = z.object({ serviceId: z.string(), from: z.string(), to: z.string(), blocked: z.boolean().default(true) }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const data = parsed.data;
  const result = await prisma.appointmentSlot.updateMany({
    where: { serviceId: data.serviceId, startAtUtc: { gte: new Date(data.from), lte: new Date(data.to) } },
    data: { status: data.blocked ? SlotStatus.BLOCKED : SlotStatus.OPEN },
  });
  return ok({ updated: result.count });
}
