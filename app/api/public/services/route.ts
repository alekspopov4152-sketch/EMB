import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/http";

export async function GET() {
  const services = await prisma.service.findMany({ where: { isActive: true, acceptsAppointments: true }, orderBy: { key: "asc" } });
  return ok({ services });
}
