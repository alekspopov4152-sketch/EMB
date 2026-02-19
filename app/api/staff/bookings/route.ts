import { StaffRole } from "@prisma/client";
import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET(req: Request) {
  await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const { searchParams } = new URL(req.url);
  const serviceKey = searchParams.get("serviceKey") || undefined;
  const status = searchParams.get("status") || undefined;
  const bookings = await prisma.booking.findMany({
    where: { status: status as any, service: serviceKey ? { key: serviceKey as any } : undefined },
    include: { service: true, slot: true, case: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok({ bookings });
}
