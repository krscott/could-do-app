import { z } from "zod";
import myz from "../../utils/my-zod";
import { createProtectedRouter } from "./context";
import { findListId } from "./util";

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
          include: {
            list: true,
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
  .query("getMany", {
    input: myz.taskSelect(),
    async resolve({ ctx, input: { done, listSlug } }) {
      try {
        return await ctx.prisma.task.findMany({
          where: {
            ownerId: ctx.session.user.id,
            done,
            list: listSlug
              ? {
                  slug: {
                    equals: listSlug,
                  },
                }
              : null,
          },
          include: {
            list: true,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("createTask", {
    input: myz.taskObject(),
    async resolve({ ctx, input }) {
      try {
        const listId = await findListId(ctx, input.listSlug);

        await ctx.prisma.task.create({
          data: {
            ...input,
            ownerId: ctx.session.user.id,
            listId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  })
  .mutation("updateTask", {
    input: myz.taskObject(),
    async resolve({ ctx, input: { id, listSlug, ...data } }) {
      try {
        const listId = await findListId(ctx, listSlug);

        await ctx.prisma.task.updateMany({
          where: {
            ownerId: ctx.session.user.id,
            id,
          },
          data: {
            listId,
            ...data,
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
