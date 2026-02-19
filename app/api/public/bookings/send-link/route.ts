import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { generateToken, sha256 } from "@/lib/security";
import { enqueueEmail } from "@/lib/email";

const schema = z.object({ bookingCode: z.string().min(3), email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const booking = await prisma.booking.findFirst({ where: { bookingCode: parsed.data.bookingCode, applicantEmail: parsed.data.email } });
  if (!booking) return fail("Not found", 404);
  const token = generateToken();
  await prisma.bookingToken.create({
    data: { bookingId: booking.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + Number(process.env.BOOKING_TOKEN_TTL_HOURS ?? 168) * 3600 * 1000) },
  });
  const link = `${process.env.BASE_URL ?? "http://localhost:3000"}/${booking.locale}/manage/${token}`;
  await enqueueEmail({ toEmail: booking.applicantEmail, subject: "Booking manage link", bodyText: link });
  return ok({ success: true });
}
