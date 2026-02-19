import { BookingStatus, SlotStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/security";

export async function POST(req: Request) {
  const parsed = z.object({ token: z.string().min(10) }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const tokenHash = sha256(parsed.data.token);
  const tokenRow = await prisma.bookingToken.findUnique({ where: { tokenHash }, include: { booking: true } });
  if (!tokenRow || tokenRow.expiresAt < new Date()) return fail("Token invalid", 404);

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: tokenRow.bookingId }, data: { status: BookingStatus.CANCELLED } });
    await tx.appointmentSlot.update({ where: { id: tokenRow.booking.slotId }, data: { status: SlotStatus.OPEN } });
  });

  return ok({ success: true });
}
