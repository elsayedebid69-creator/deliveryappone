import { z } from "zod";

export const WORK_SECONDS = 10 * 60 * 60;
export const BREAK_SECONDS = 60 * 60;
export const shiftAssignmentSchema = z.object({
  courier_id: z.string().uuid(),
  scheduled_start: z.string().datetime({ offset: true }),
  neighborhoods: z.array(z.string().trim().min(2).max(100)).length(3)
    .refine((areas) => new Set(areas).size === 3, "الأحياء يجب أن تكون مختلفة"),
  adjacent_confirmed: z.literal(true),
});

export function workedSeconds(start: number, end: number, breakStart?: number, breakEnd?: number) {
  const pause = breakStart === undefined || breakEnd === undefined ? 0 : Math.max(0, Math.min(end, breakEnd) - Math.max(start, breakStart));
  return Math.min(WORK_SECONDS, Math.max(0, Math.floor((end - start - pause) / 1000)));
}
export const salaryDayEligible = (seconds: number) => seconds >= WORK_SECONDS;