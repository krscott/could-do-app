import type { Task } from "@prisma/client";
import dayjs from "dayjs";
import { trpc } from "../../utils/trpc";
import { v4 as uuidv4 } from "uuid";

// type TQuery = keyof AppRouter["_def"]["queries"];

// const __getTrpcContextState = ({}: never) => trpc.useContext();
// type TrpcContextHookState = ReturnType<typeof __getTrpcContextState>;

const removeTaskFromLists = (
  targetTask: { id: string } & Partial<Task>,
  prevCompleted: Task[],
  prevUncompleted: Task[],
): [task: Task | undefined, completed: Task[], uncompleted: Task[]] => {
  const completed: Task[] = [];
  const uncompleted: Task[] = [];

  // Sift through both lists...
  // - Remove target task from prev list
  // - Update target task data
  // - Insert target task into correct list based on new `done` status

  let outTask: Task | undefined = undefined;

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

export const useUpdateTaskMutation = (
  path: "task.updateTask" | "task.uncompleteTask" | "task.completeTask",
  taskId?: string,
) => {
  const ctx = trpc.useContext();

  const updateTask = trpc.useMutation(path, {
    onMutate: async (targetTask) => {
      const taskGet = { id: targetTask.id };

      await Promise.all([
        ctx.cancelQuery(["task.getCompleted"]),
        ctx.cancelQuery(["task.getUncompleted"]),
        ctx.cancelQuery(["task.get", taskGet]),
      ]);

      const prevCompleted = ctx.getQueryData(["task.getCompleted"]) || [];
      const prevUncompleted = ctx.getQueryData(["task.getUncompleted"]) || [];

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
      ctx.setQueryData(["task.getCompleted"], completed);
      ctx.setQueryData(["task.getUncompleted"], uncompleted);

      return { prevCompleted, prevUncompleted, prevTask };
    },

    onError: (err, newTask, context) => {
      ctx.setQueryData(["task.getCompleted"], context?.prevCompleted);
      ctx.setQueryData(["task.getCompleted"], context?.prevUncompleted);

      const prevTask = context?.prevTask;
      if (prevTask) {
        ctx.setQueryData(["task.get", { id: prevTask.id }], [prevTask]);
      }
    },

    onSettled: () => {
      ctx.invalidateQueries(["task.getCompleted"]);
      ctx.invalidateQueries(["task.getUncompleted"]);

      if (taskId) {
        console.log("settled", ["task.get", { id: taskId }]);
        ctx.invalidateQueries(["task.get", { id: taskId }]);
      }
    },
  });

  return updateTask;
};

export const useDeleteTaskMutation = () => {
  const ctx = trpc.useContext();

  const updateTask = trpc.useMutation("task.deleteTask", {
    onMutate: async (targetTask) => {
      await Promise.all([
        ctx.cancelQuery(["task.getCompleted"]),
        ctx.cancelQuery(["task.getUncompleted"]),
      ]);

      const prevCompleted = ctx.getQueryData(["task.getCompleted"]) || [];
      const prevUncompleted = ctx.getQueryData(["task.getUncompleted"]) || [];

      const [, completed, uncompleted] = removeTaskFromLists(
        targetTask,
        prevCompleted,
        prevUncompleted,
      );

      ctx.setQueryData(["task.getCompleted"], completed);
      ctx.setQueryData(["task.getUncompleted"], uncompleted);

      return { prevCompleted, prevUncompleted };
    },

    onError: (err, newTask, context) => {
      ctx.setQueryData(["task.getCompleted"], context?.prevCompleted);
      ctx.setQueryData(["task.getCompleted"], context?.prevUncompleted);
    },

    onSettled: () => {
      ctx.invalidateQueries(["task.getCompleted"]);
      ctx.invalidateQueries(["task.getUncompleted"]);
    },
  });

  return updateTask;
};

export const useCreateTaskMutation = () => {
  const ctx = trpc.useContext();

  const updateTask = trpc.useMutation("task.createTask", {
    onMutate: async (targetTask) => {
      await Promise.all([ctx.cancelQuery(["task.getUncompleted"])]);

      const prevUncompleted = ctx.getQueryData(["task.getUncompleted"]) || [];

      // Create a fake task that is "close enough" to what the server will give us
      const newTask: Task = {
        id: uuidv4(),
        createdAt: new Date(),
        ownerId: "",
        done: false,
        dueAt: dayjs().startOf("day").toDate(),
        repeatAmount: null,
        repeatUnit: null,
        ...targetTask,
      };

      ctx.setQueryData(["task.getUncompleted"], [...prevUncompleted, newTask]);

      return { prevUncompleted };
    },

    onError: (err, newTask, context) => {
      ctx.setQueryData(["task.getCompleted"], context?.prevUncompleted);
    },

    onSettled: () => {
      ctx.invalidateQueries(["task.getUncompleted"]);
    },
  });

  return updateTask;
};
