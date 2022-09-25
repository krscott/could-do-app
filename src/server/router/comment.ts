import { z } from "zod";
import myz from "../../utils/my-zod";
import { createProtectedRouter } from "./context";

export const commentRouter = createProtectedRouter()
  .query("getFromTask", {
    input: z.object({
      taskId: z.string(),
    }),
    async resolve({ ctx, input: { taskId } }) {
      try {
        return await ctx.prisma.comment.findMany({
          where: {
            taskId,
          },
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("createComment", {
    input: myz.commentObject(),
    async resolve({ ctx, input: { taskId, comment } }) {
      try {
        // TODO: Add shared list permissions
        // Check that user has permission to post on this task
        const task = await ctx.prisma.task.findFirst({
          where: {
            id: taskId,
            ownerId: ctx.session.user.id,
          },
        });

        if (!task) {
          console.error(
            `User ${ctx.session.user.id} cannot comment on task ${taskId}`,
          );
          return;
        }

        await ctx.prisma.comment.create({
          data: {
            authorId: ctx.session.user.id,
            taskId,
            comment,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
