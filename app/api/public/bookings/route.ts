import { BookingStatus, CaseStatus, SlotStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { enqueueEmail } from "@/lib/email";
import { generateBookingCode, generateToken, sha256 } from "@/lib/security";

const schema = z.object({
  serviceKey: z.enum(["VISA", "ID_DOCS", "CITIZENSHIP", "NOTARY"]),
  slotId: z.string().min(1),
  applicantName: z.string().min(2),
  applicantEmail: z.string().email(),
  applicantPhone: z.string().optional(),
  applicantNote: z.string().optional(),
  locale: z.enum(["bg", "en", "ar"]),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  if (!enforceRateLimit(`booking-${ip}`)) return fail("Rate limit", 429);
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const body = parsed.data;
  const token = generateToken(32);
  const tokenHash = sha256(token);
  const ttlHours = Number(process.env.BOOKING_TOKEN_TTL_HOURS ?? 168);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { key: body.serviceKey } });
      if (!service || !service.isActive || !service.acceptsAppointments) throw new Error("SERVICE_UNAVAILABLE");
      const slot = await tx.appointmentSlot.findUnique({ where: { id: body.slotId } });
      if (!slot || slot.serviceId !== service.id) throw new Error("SLOT_NOT_FOUND");
      if (slot.status !== SlotStatus.OPEN) throw new Error("SLOT_BOOKED");

      await tx.appointmentSlot.update({ where: { id: slot.id }, data: { status: SlotStatus.BOOKED } });
      const count = await tx.booking.count();
      const bookingCode = generateBookingCode(count + 1);

      const booking = await tx.booking.create({
        data: {
          serviceId: service.id,
          slotId: slot.id,
          bookingCode,
          status: BookingStatus.CONFIRMED,
          applicantName: body.applicantName,
          applicantEmail: body.applicantEmail,
          applicantPhone: body.applicantPhone,
          applicantNote: body.applicantNote,
          locale: body.locale,
          tokens: {
            create: { tokenHash, expiresAt: new Date(Date.now() + ttlHours * 3600 * 1000) },
          },
        },
      });

      await tx.case.create({ data: { bookingId: booking.id, status: CaseStatus.NEW } });
      return booking;
    });

    const manageLink = `${process.env.BASE_URL ?? "http://localhost:3000"}/${body.locale}/manage/${token}`;
    await enqueueEmail({
      toEmail: result.applicantEmail,
      subject: `Booking confirmation ${result.bookingCode}`,
      bodyText: `Your booking code is ${result.bookingCode}. Manage: ${manageLink}`,
      bodyHtml: `<p>Your booking code is <strong>${result.bookingCode}</strong>.</p><p><a href="${manageLink}">Manage booking</a></p>`,
    });

    return ok({ bookingCode: result.bookingCode });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_BOOKED") return fail("Slot already booked", 409);
    if (error instanceof Error && ["SERVICE_UNAVAILABLE", "SLOT_NOT_FOUND"].includes(error.message)) return fail("Invalid booking", 400);
    return fail("Booking failed", 500);
  }
}
