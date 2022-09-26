import type { Prisma, PrismaClient, Task, TaskList } from "@prisma/client";
import { useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";

// type TQuery = keyof AppRouter["_def"]["queries"];

// const __getTrpcContextState = ({}: never) => trpc.useContext();
// type TrpcContextHookState = ReturnType<typeof __getTrpcContextState>;

type TaskWithList = Task & { list: TaskList | null };

const removeTaskFromLists = (
  targetTask: { id: string } & Partial<TaskWithList>,
  prevCompleted: TaskWithList[],
  prevUncompleted: TaskWithList[],
): [
  task: TaskWithList | undefined,
  completed: TaskWithList[],
  uncompleted: TaskWithList[],
] => {
  const completed: TaskWithList[] = [];
  const uncompleted: TaskWithList[] = [];

  // Sift through both lists...
  // - Remove target task from prev list
  // - Update target task data
  // - Insert target task into correct list based on new `done` status

  let outTask: TaskWithList | undefined = undefined;

  for (const task of prevCompleted) {
    if (task.id === targetTask.id) {
      outTask = { ...task, ...targetTask };
    } else {
      completed.push(task);
    }
  }
  for (const task of prevUncompleted) {
    if (task.id === targetTask.id) {
      outTask = { ...task, ...targetTask };
    } else {
      uncompleted.push(task);
    }
  }

  return [outTask, completed, uncompleted];
};

export const useUpdateTaskMutation = ({
  path,
  listSlug,
  taskId,
}: {
  path: "task.updateTask" | "task.uncompleteTask" | "task.completeTask";
  listSlug: string | null;
  taskId?: string;
}) => {
  const ctx = trpc.useContext();

  const updateTask = trpc.useMutation(path, {
    onMutate: async (targetTask) => {
      const taskGet = { id: targetTask.id };

      await Promise.all([
        ctx.cancelQuery(["task.getMany", { done: true, listSlug }]),
        ctx.cancelQuery(["task.getMany", { done: false, listSlug }]),
        ctx.cancelQuery(["task.get", taskGet]),
      ]);

      const prevCompleted =
        ctx.getQueryData(["task.getMany", { done: true, listSlug }]) || [];
      const prevUncompleted =
        ctx.getQueryData(["task.getMany", { done: false, listSlug }]) || [];

      const [prevTask, completed, uncompleted] = removeTaskFromLists(
        targetTask,
        prevCompleted,
        prevUncompleted,
      );

      if (prevTask) {
        const newTask = { ...prevTask };

        if (path === "task.completeTask") {
          newTask.done = true;
        } else if (path === "task.uncompleteTask") {
          newTask.done = false;
        }

        (newTask.done ? completed : uncompleted).push(newTask);

        console.log("set", ["task.get", taskGet], [newTask]);
        ctx.setQueryData(["task.get", taskGet], [newTask]);
      }

      console.log(uncompleted);
      ctx.setQueryData(["task.getMany", { done: true, listSlug }], completed);
      ctx.setQueryData(
        ["task.getMany", { done: false, listSlug }],
        uncompleted,
      );

      return { prevCompleted, prevUncompleted, prevTask };
    },

    onError: (err, newTask, context) => {
      ctx.setQueryData(
        ["task.getMany", { done: true, listSlug }],
        context?.prevCompleted,
      );
      ctx.setQueryData(
        ["task.getMany", { done: false, listSlug }],
        context?.prevUncompleted,
      );

      const prevTask = context?.prevTask;
      if (prevTask) {
        ctx.setQueryData(["task.get", { id: prevTask.id }], [prevTask]);
      }
    },

    onSettled: () => {
      ctx.invalidateQueries(["task.getMany", { done: true, listSlug }]);
      ctx.invalidateQueries(["task.getMany", { done: false, listSlug }]);

      if (taskId) {
        console.log("settled", ["task.get", { id: taskId }]);
        ctx.invalidateQueries(["task.get", { id: taskId }]);
      }
    },
  });

  return updateTask;
};

export const useDeleteTaskMutation = ({
  listSlug,
}: {
  listSlug: string | null;
}) => {
  const ctx = trpc.useContext();

  const updateTask = trpc.useMutation("task.deleteTask", {
    onMutate: async (targetTask) => {
      await Promise.all([
        ctx.cancelQuery(["task.getMany", { done: true, listSlug }]),
        ctx.cancelQuery(["task.getMany", { done: false, listSlug }]),
      ]);

      const prevCompleted =
        ctx.getQueryData(["task.getMany", { done: true, listSlug }]) || [];
      const prevUncompleted =
        ctx.getQueryData(["task.getMany", { done: false, listSlug }]) || [];

      const [, completed, uncompleted] = removeTaskFromLists(
        targetTask,
        prevCompleted,
        prevUncompleted,
      );

      ctx.setQueryData(["task.getMany", { done: true, listSlug }], completed);
      ctx.setQueryData(
        ["task.getMany", { done: false, listSlug }],
        uncompleted,
      );

      return { prevCompleted, prevUncompleted };
    },

    onError: (err, newTask, context) => {
      ctx.setQueryData(
        ["task.getMany", { done: true, listSlug }],
        context?.prevCompleted,
      );
      ctx.setQueryData(
        ["task.getMany", { done: false, listSlug }],
        context?.prevUncompleted,
      );
    },

    onSettled: () => {
      ctx.invalidateQueries(["task.getMany", { done: true, listSlug }]);
      ctx.invalidateQueries(["task.getMany", { done: false, listSlug }]);
    },
  });

  return updateTask;
};

export const useCreateTaskMutation = ({
  listSlug,
}: {
  listSlug: string | null;
}) => {
  const ctx = trpc.useContext();

  const createTask = trpc.useMutation("task.createTask", {
    onMutate: async (targetTask) => {
      await Promise.all([
        ctx.cancelQuery(["task.getMany", { done: false, listSlug }]),
      ]);

      const prevUncompleted =
        ctx.getQueryData(["task.getMany", { done: false, listSlug }]) || [];

      const newTask: TaskWithList = {
        // required by TS, but server will always ignore client ownerId
        ownerId: "",

        // since we put the task in the relevant listSlug query, setting list is not needed
        listId: null,
        list: listSlug
          ? {
              id: "",
              ownerId: "",
              name: "",
              slug: listSlug,
            }
          : null,

        createdAt: new Date(),
        ...targetTask,
      };

      ctx.setQueryData(
        ["task.getMany", { done: false, listSlug }],
        [...prevUncompleted, newTask],
      );

      return { prevUncompleted };
    },

    onError: (err, newTask, context) => {
      ctx.setQueryData(
        ["task.getMany", { done: false, listSlug }],
        context?.prevUncompleted,
      );
    },

    onSettled: () => {
      ctx.invalidateQueries(["task.getMany", { done: false, listSlug }]);
    },
  });

  return createTask;
};

export const useCreateCommentMutation = () => {
  const ctx = trpc.useContext();
  const { data: session } = useSession({ required: true });

  const createComment = trpc.useMutation("comment.createComment", {
    onMutate: async (targetComment) => {
      await ctx.cancelQuery([
        "comment.getFromTask",
        { taskId: targetComment.taskId },
      ]);

      const prevComments =
        ctx.getQueryData([
          "comment.getFromTask",
          { taskId: targetComment.taskId },
        ]) || [];

      const newComment = {
        authorId: session?.user?.id || "",
        createdAt: new Date(),
        author: {
          name: session?.user?.name || "",
          image: session?.user?.image || "",
        },
        ...targetComment,
      };

      ctx.setQueryData(
        ["comment.getFromTask", { taskId: targetComment.taskId }],
        [...prevComments, newComment],
      );
    },
  });

  return createComment;
};

export const useCreateTaskListMutation = () => {
  const ctx = trpc.useContext();
  const { data: session } = useSession({ required: true });

  const createComment = trpc.useMutation("tasklist.createTaskList", {
    onMutate: async (input) => {
      await ctx.cancelQuery(["tasklist.getAll"]);

      const privLists = ctx.getQueryData(["tasklist.getAll"]) || [];

      const newList: TaskList = {
        ownerId: session?.user?.id || "",
        ...input,
      };

      ctx.setQueryData(["tasklist.getAll"], [...privLists, newList]);
    },
  });

  return createComment;
};

/**
 *  Given a list's slug, find its ID
 */
export const findListId = async (
  ctx: {
    session: { user: { id: string } };
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  },
  slug: string | null,
) => {
  if (slug) {
    const list = await ctx.prisma.taskList.findFirst({
      where: {
        ownerId: ctx.session.user.id,
        slug,
      },
    });

    if (list) {
      return list.id;
    }
  }

  return null;
};
