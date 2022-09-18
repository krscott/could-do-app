import { DurationUnit } from "@prisma/client";
import { z } from "zod";

const myz = {
  summary: () => z.string().trim().min(1).max(40),
  userFullName: () => z.string().trim().min(1).max(60),
  updateTaskObject: () =>
    z.object({
      id: z.string(),
      summary: myz.summary(),
      dueAt: z.date(),
      repeatAmount: z.number().positive().nullable(),
      repeatUnit: z.nativeEnum(DurationUnit).nullable(),
      done: z.boolean(),
    }),
  updateUserObject: () =>
    z.object({
      name: myz.userFullName(),
    }),
};

export default myz;
