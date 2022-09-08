import { AppRouter } from ".";
import { trpc } from "../../utils/trpc";

type TQuery = keyof AppRouter["_def"]["queries"];

export const mutationOptimisticUpdates = (query: TQuery) => {
  const ctx = trpc.useContext();

  return {
    onMutate: () => {
      ctx.cancelQuery([query]);

      const optimisticUpdate = ctx.getQueryData([query]);
      if (optimisticUpdate) {
        ctx.setQueryData([query], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries([query]);
    },
  };
};
