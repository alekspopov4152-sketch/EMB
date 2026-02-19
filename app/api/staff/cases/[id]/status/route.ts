import { CaseStatus, StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const caseItem = await prisma.case.findUnique({ where: { id: params.id }, include: { statusHistory: true, notes: true, booking: true } });
  if (!caseItem) return fail("Case not found", 404);
  return ok({ case: caseItem });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const staff = await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const parsed = z.object({ status: z.nativeEnum(CaseStatus) }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const existing = await prisma.case.findUnique({ where: { id: params.id } });
  if (!existing) return fail("Case not found", 404);
  await prisma.$transaction(async (tx) => {
    await tx.case.update({ where: { id: params.id }, data: { status: parsed.data.status } });
    await tx.caseStatusHistory.create({ data: { caseId: params.id, fromStatus: existing.status, toStatus: parsed.data.status, changedById: staff.id } });
    await tx.auditLog.create({ data: { actorId: staff.id, action: "CASE_STATUS_CHANGED", entityType: "Case", entityId: params.id } });
  });
  return ok({ success: true });
}
