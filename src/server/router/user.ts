import { z } from "zod";
import { createProtectedRouter } from "./context";

export const userRouter = createProtectedRouter()
  // .query("get", {
  //   async resolve({ ctx }) {
  //     try {
  //       return await ctx.prisma.task.findMany({
  //         where: {
  //           id: ctx.session.user.id,
  //         },
  //       });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  // })
  .mutation("updateUser", {
    input: z.object({
      name: z.string(),
    }),
    async resolve({ ctx, input: { name } }) {
      try {
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            name,
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
