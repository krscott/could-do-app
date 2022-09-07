import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
      try {
        return await ctx.prisma.task.findMany({
          select: {
            createdAt: true,
            summary: true,
          },
          where: {
            ownerId: ctx.session?.user?.id,
          },
          orderBy: {
            createdAt: "asc",
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("postTask", {
    input: z.object({
      ownerId: z.string(),
      summary: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.task.create({
          data: {
            ownerId: input.ownerId,
            summary: input.summary,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
