import { DurationUnit } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./context";

// TODO: Add handler for if *Many queries returned 0 results (e.g. record was deleted, user doesn't own) and display error
export const taskRouter = createProtectedRouter()
  .query("get", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input: { id } }) {
      try {
        return await ctx.prisma.task.findMany({
          where: {
            id,

            ownerId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  // .query("getAll", {
  //   async resolve({ ctx }) {
  //     try {
  //       return await ctx.prisma.task.findMany({
  //         where: {
  //          ownerId: ctx.session.user.id,
  //         },
  //       });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  // })
  .query("getUncompleted", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.task.findMany({
          where: {
            ownerId: ctx.session.user.id,
            done: false,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .query("getCompleted", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.task.findMany({
          where: {
            ownerId: ctx.session.user.id,
            done: true,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("createTask", {
    input: z.object({
      summary: z.string(),
    }),
    async resolve({ ctx, input: { summary } }) {
      try {
        await ctx.prisma.task.create({
          data: {
            ownerId: ctx.session.user.id,
            summary: summary,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("updateTask", {
    input: z.object({
      id: z.string(),
      summary: z.string(),
      dueAt: z.date(),
      repeatAmount: z.number().positive().nullable(),
      repeatUnit: z.nativeEnum(DurationUnit).nullable(),
      done: z.boolean(),
    }),
    async resolve({
      ctx,
      input: { id, summary, dueAt, repeatAmount, repeatUnit, done },
    }) {
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId: ctx.session.user.id,
            id,
          },
          data: {
            summary,
            dueAt,
            repeatAmount,
            repeatUnit,
            done,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("completeTask", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input: { id } }) {
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId: ctx.session.user.id,
            id,
          },
          data: {
            done: true,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("uncompleteTask", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input: { id } }) {
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId: ctx.session.user.id,
            id,
          },
          data: {
            done: false,
            dueAt: new Date(),
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("deleteTask", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input: { id } }) {
      try {
        // Delete task only if owned by current user
        await ctx.prisma.task.deleteMany({
          where: {
            id,

            ownerId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
