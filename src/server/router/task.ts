import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionUserId } from "../../utils/get-session-user-id";
import { createRouter } from "./context";

export const taskRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("getAll", {
    async resolve({ ctx }) {
      const ownerId = getSessionUserId(ctx);
      try {
        return await ctx.prisma.task.findMany({
          select: {
            id: true,
            createdAt: true,
            summary: true,
            dueAt: true,
            repeatAmount: true,
            repeatUnit: true,
          },
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
    async resolve({ ctx, input }) {
      const ownerId = getSessionUserId(ctx);
      try {
        await ctx.prisma.task.create({
          data: {
            ownerId,
            summary: input.summary,
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
    async resolve({ ctx, input }) {
      const ownerId = getSessionUserId(ctx);
      try {
        // Delete task only if owned by current user
        await ctx.prisma.task.deleteMany({
          where: {
            id: input.id,
            ownerId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
