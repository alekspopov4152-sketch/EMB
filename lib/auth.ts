import { cookies } from "next/headers";
import { StaffRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateToken, sha256 } from "@/lib/security";

const COOKIE_NAME = "staff_session";

export async function createStaffSession(userId: string) {
  const raw = generateToken();
  const tokenHash = sha256(raw);
  const expiresAt = new Date(Date.now() + Number(process.env.STAFF_SESSION_DAYS ?? 7) * 86400000);
  await prisma.auditLog.create({ data: { actorId: userId, action: "AUTH_LOGIN", entityType: "StaffSession", entityId: userId } });
  cookies().set(COOKIE_NAME, `${userId}.${raw}`, { httpOnly: true, secure: true, sameSite: "lax", expires: expiresAt });
  await prisma.setting.upsert({
    where: { key: `SESSION_${userId}` },
    update: { value: { tokenHash, expiresAt } },
    create: { key: `SESSION_${userId}`, value: { tokenHash, expiresAt } },
  });
}

export async function requireStaff(roles?: StaffRole[]) {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) throw new Error("Unauthorized");
  const [userId, raw] = cookie.split(".");
  if (!userId || !raw) throw new Error("Unauthorized");
  const session = await prisma.setting.findUnique({ where: { key: `SESSION_${userId}` } });
  const data = session?.value as { tokenHash?: string; expiresAt?: string } | null;
  if (!data?.tokenHash || data.tokenHash !== sha256(raw) || new Date(data.expiresAt || 0) < new Date()) throw new Error("Unauthorized");
  const user = await prisma.staffUser.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new Error("Unauthorized");
  if (roles && !roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
