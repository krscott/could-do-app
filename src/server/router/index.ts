// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { taskRouter } from "./task";
import { userRouter } from "./user";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("task.", taskRouter)
  .merge("user.", userRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
