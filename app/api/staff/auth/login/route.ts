import bcrypt from "bcryptjs";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createStaffSession } from "@/lib/auth";

export async function POST(req: Request) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const user = await prisma.staffUser.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive) return fail("Invalid credentials", 401);
  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return fail("Invalid credentials", 401);
  await createStaffSession(user.id);
  return ok({ id: user.id, role: user.role, displayName: user.displayName });
}
