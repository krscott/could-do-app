import myz from "../../utils/my-zod";
import { createProtectedRouter } from "./context";

export const taskListRouter = createProtectedRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.taskList.findMany({
          where: {
            ownerId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("createTaskList", {
    input: myz.taskListObject(),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.taskList.create({
          data: {
            ...input,
            ownerId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
