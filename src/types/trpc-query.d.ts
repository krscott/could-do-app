import { trpc } from "../utils/trpc";

// Typescript kung-fu to find query data type
const __dummyTaskQueryFn = () => (trpc.useQuery(["task.getAll"]).data || [])[0];
declare type Task = NonNullable<ReturnType<typeof __dummyTaskQueryFn>>;
