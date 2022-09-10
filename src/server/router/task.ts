import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionUserId } from "../../utils/get-session-user-id";
import { createRouter } from "./context";

// Shared select criteria between get and getAll
const selectTask = {
  id: true,
  createdAt: true,
  summary: true,
  dueAt: true,
  repeatAmount: true,
  repeatUnit: true,
};

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
          select: selectTask,
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
          select: selectTask,
          where: {
            ownerId,
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
    }),
    async resolve({ ctx, input: { id, summary } }) {
      const ownerId = getSessionUserId(ctx);
      try {
        await ctx.prisma.task.updateMany({
          where: {
            ownerId,
            id,
          },
          data: {
            summary: summary,
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
