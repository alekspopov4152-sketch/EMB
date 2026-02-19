import { StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const staff = await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const parsed = z.object({ note: z.string().min(2) }).safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const note = await prisma.caseNote.create({ data: { caseId: params.id, note: parsed.data.note, createdById: staff.id } });
  await prisma.auditLog.create({ data: { actorId: staff.id, action: "CASE_NOTE_ADDED", entityType: "Case", entityId: params.id } });
  return ok({ note });
}
