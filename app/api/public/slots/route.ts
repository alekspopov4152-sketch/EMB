import { SlotStatus } from "@prisma/client";
import { ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceKey = searchParams.get("serviceKey");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!serviceKey || !from || !to) return fail("Missing params", 400);
  const service = await prisma.service.findUnique({ where: { key: serviceKey as any } });
  if (!service || !service.isActive) return fail("Service not found", 404);
  const slots = await prisma.appointmentSlot.findMany({
    where: {
      serviceId: service.id,
      status: SlotStatus.OPEN,
      startAtUtc: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) },
    },
    orderBy: { startAtUtc: "asc" },
  });
  return ok({ slots });
}
