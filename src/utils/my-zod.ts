import { DurationUnit } from "@prisma/client";
import { z } from "zod";

const myz = {
  summary: () => z.string().trim().min(1).max(40),
  userFullName: () => z.string().trim().min(1).max(60),
  taskSelect: () =>
    z.object({
      done: z.boolean(),
      listSlug: z.string().nullable(),
    }),
  taskObject: () =>
    z.object({
      id: z.string(),
      summary: myz.summary(),
      dueAt: z.date(),
      repeatAmount: z.number().positive().nullable(),
      repeatUnit: z.nativeEnum(DurationUnit).nullable(),
      done: z.boolean(),
      description: z.string().nullable(),
      listSlug: z.string().min(1).nullable(),
    }),
  updateUserObject: () =>
    z.object({
      name: myz.userFullName(),
    }),
  commentObject: () =>
    z.object({
      id: z.string(),
      taskId: z.string(),
      comment: z.string().min(1),
    }),
  taskListObject: () =>
    z.object({
      id: z.string(),
      name: z.string().min(1),
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9\-]+$/g),
    }),
};

export default myz;
