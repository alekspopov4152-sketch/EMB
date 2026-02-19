import bcrypt from "bcryptjs";
import { StaffRole } from "@prisma/client";
import { z } from "zod";
import { ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  await requireStaff([StaffRole.ADMIN]);
  const users = await prisma.staffUser.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ users: users.map((u) => ({ ...u, passwordHash: undefined })) });
}

export async function POST(req: Request) {
  const actor = await requireStaff([StaffRole.ADMIN]);
  const parsed = z.object({ email: z.string().email(), password: z.string().min(8), displayName: z.string().min(2), role: z.nativeEnum(StaffRole) }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.staffUser.create({ data: { ...parsed.data, passwordHash } });
  await prisma.auditLog.create({ data: { actorId: actor.id, action: "USER_CREATE", entityType: "StaffUser", entityId: user.id } });
  return ok({ id: user.id, email: user.email, displayName: user.displayName, role: user.role });
}
