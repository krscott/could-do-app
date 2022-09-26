// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { taskRouter } from "./task";
import { userRouter } from "./user";
import { commentRouter } from "./comment";
import { taskListRouter } from "./tasklist";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("task.", taskRouter)
  .merge("user.", userRouter)
  .merge("comment.", commentRouter)
  .merge("tasklist.", taskListRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
