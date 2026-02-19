import { BookingStatus, SlotStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/security";

const schema = z.object({ token: z.string().min(10), newSlotId: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const tokenHash = sha256(parsed.data.token);
  const row = await prisma.bookingToken.findUnique({ where: { tokenHash }, include: { booking: true } });
  if (!row || row.expiresAt < new Date()) return fail("Token invalid", 404);

  try {
    await prisma.$transaction(async (tx) => {
      const newSlot = await tx.appointmentSlot.findUnique({ where: { id: parsed.data.newSlotId } });
      if (!newSlot || newSlot.status !== SlotStatus.OPEN) throw new Error("SLOT_BOOKED");
      await tx.appointmentSlot.update({ where: { id: row.booking.slotId }, data: { status: SlotStatus.OPEN } });
      await tx.appointmentSlot.update({ where: { id: newSlot.id }, data: { status: SlotStatus.BOOKED } });
      await tx.booking.update({ where: { id: row.bookingId }, data: { slotId: newSlot.id, status: BookingStatus.RESCHEDULED } });
    });
    return ok({ success: true });
  } catch {
    return fail("Reschedule failed", 409);
  }
}
