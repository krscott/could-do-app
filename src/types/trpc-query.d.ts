import { trpc } from "../utils/trpc";

// TODO: Use this method? https://github.com/maticzav/prisma2/blob/master/docs/prisma-client-js/generated-types.md
// Typescript kung-fu to find query data type
const __dummyTaskQueryFn = () => (trpc.useQuery(["task.getAll"]).data || [])[0];
declare type Task = NonNullable<ReturnType<typeof __dummyTaskQueryFn>>;
