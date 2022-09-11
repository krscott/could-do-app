import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionUserId } from "../../utils/get-session-user-id";
import { createRouter } from "./context";

// TODO: Replace `createRouter().middleware(...)` with createProtectedRouter()
// TODO: Add handler for if *Many queries returned 0 results (e.g. record was deleted, user doesn't own) and display error
export const taskRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("get", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input: { id } }) {
      const ownerId = getSessionUserId(ctx);
      try {
        return await ctx.prisma.task.findMany({
          where: {
            id,
            ownerId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      const ownerId = getSessionUserId(ctx);
      try {
        return await ctx.prisma.task.findMany({
          where: {
            ownerId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .query("getUncompleted", {
    async resolve({ ctx }) {
      const ownerId = getSessionUserId(ctx);
      try {
        return await ctx.prisma.task.findMany({
          where: {
            ownerId,
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
      const ownerId = getSessionUserId(ctx);
      try {
        return await ctx.prisma.task.findMany({
          where: {
            ownerId,
            done: true,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("postTask", {
    input: z.object({
      summary: z.string(),
    }),
    async resolve({ ctx, input: { summary } }) {
      const ownerId = getSessionUserId(ctx);
      try {
        await ctx.prisma.task.create({
          data: {
            ownerId,
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
      repeatAmount: z.number().nullable(),
      repeatUnit: z.string().nullable(),
      done: z.boolean(),
    }),
    async resolve({
      ctx,
      input: { id, summary, dueAt, repeatAmount, repeatUnit, done },
    }) {
      const ownerId = getSessionUserId(ctx);
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId,
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
      const ownerId = getSessionUserId(ctx);
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId,
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
      const ownerId = getSessionUserId(ctx);
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId,
            id,
          },
          data: {
            done: false,
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
      const ownerId = getSessionUserId(ctx);
      try {
        // Delete task only if owned by current user
        await ctx.prisma.task.deleteMany({
          where: {
            id,
            ownerId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
