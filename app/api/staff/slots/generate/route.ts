import { DateTime } from "luxon";
import { StaffRole } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

const schema = z.object({
  serviceId: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  weekdays: z.array(z.number().int().min(1).max(7)),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
  durationMin: z.number().int().positive(),
});

export async function POST(req: Request) {
  const staff = await requireStaff([StaffRole.CONSUL, StaffRole.ADMIN]);
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid input", 400);
  const p = parsed.data;
  const tz = "Africa/Cairo";
  const from = DateTime.fromISO(p.fromDate, { zone: tz }).startOf("day");
  const to = DateTime.fromISO(p.toDate, { zone: tz }).endOf("day");
  const creates = [] as { serviceId: string; startAtUtc: Date; endAtUtc: Date; createdById: string }[];

  for (let day = from; day <= to; day = day.plus({ days: 1 })) {
    if (!p.weekdays.includes(day.weekday)) continue;
    for (let h = p.startHour; h < p.endHour; ) {
      const start = day.set({ hour: h, minute: 0, second: 0 });
      const end = start.plus({ minutes: p.durationMin });
      creates.push({ serviceId: p.serviceId, startAtUtc: start.toUTC().toJSDate(), endAtUtc: end.toUTC().toJSDate(), createdById: staff.id });
      h += Math.ceil(p.durationMin / 60);
    }
  }

  const result = await prisma.appointmentSlot.createMany({ data: creates, skipDuplicates: true });
  return ok({ created: result.count });
}
