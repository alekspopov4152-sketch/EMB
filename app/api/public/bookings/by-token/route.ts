import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/security";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return fail("Missing token", 400);
  const tokenHash = sha256(token);
  const row = await prisma.bookingToken.findUnique({
    where: { tokenHash },
    include: { booking: { include: { slot: true, service: true } } },
  });
  if (!row || row.expiresAt < new Date()) return fail("Token invalid", 404);
  return ok({ booking: row.booking });
}
