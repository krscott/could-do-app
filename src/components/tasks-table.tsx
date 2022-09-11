import { trpc } from "../utils/trpc";
import { mutationOptimisticUpdates } from "../server/router/util";
import { useEffect, useMemo, useState } from "react";
import { futureGroup, today } from "../utils/dayjs-util";
import dayjs from "dayjs";
import update from "immutability-helper";
import type { Task } from "../types/trpc-query";
import { Icon, IconHover } from "./icon";
import Link from "next/link";
import {
  datePlusRepeat,
  isRepeating,
  repeatView,
} from "../utils/task-repeat-util";

/**
 * Sort the task array: first all overdue tasks decending, then upcoming tasks ascending
 */
const sortTasksArray = (tasks: Task[]) => {
  const today = dayjs().startOf("day");

  tasks.sort((taskA: Task, taskB: Task) => {
    const a = dayjs(taskA.dueAt).startOf("day");
    const b = dayjs(taskB.dueAt).startOf("day");
    const diff = +a.toDate() - +b.toDate();

    if (a.isSameOrBefore(today) && b.isSameOrBefore(today)) {
      // Sort overdue tasks in descending order (latest overdue first)
      return -diff;
    }

    // Sort future tasks in ascending order (nearest due-date first)
    return diff;
  });
};

type RowGroup<T> = {
  index: number;
  name: string;
  rows: T[];
  collapsed: boolean;
};

const groupTasks = (tasks: Task[], singleGroup?: boolean): RowGroup<Task>[] => {
  const groups: RowGroup<Task>[] = [];

  for (const task of tasks) {
    const [name, index] = singleGroup ? ["", 0] : futureGroup(task.dueAt);

    const group = groups[index];

    if (group === undefined) {
      groups[index] = {
        index,
        name,
        rows: [task],
        collapsed: false,
      };
    } else {
      group.rows.push(task);
    }
  }

  return groups;
};

type ColumnDef<T> = {
  header: string;
  cell: (group: RowGroup<T>, row: T) => React.ReactNode;
  className: string;
};

type TasksTableProps = {
  completed?: boolean;
};

export const TasksTable = ({ completed }: TasksTableProps): JSX.Element => {
  const columns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        header: "",
        cell: completed
          ? (group, row) => <RestartButton taskId={row.id} />
          : (group, row) =>
              group.index === 0 || !isRepeating(row) ? (
                <DoneButton task={row} />
              ) : (
                <></>
              ),
        className: "w-1/12 text-center px-4 py-2",
      },
      {
        header: "Task",
        cell: (group, row) => row.summary,
        className: "grow px-2 py-2",
      },
      // {
      //   header: "Due",
      //   cell: (row) => futureDay(row.dueAt),
      //   className: "w-2/6 text-center px-4 py-2 text-gray-500",
      // },
      {
        header: "Repeat",
        cell: (group, row) => repeatView(row.repeatAmount, row.repeatUnit),
        className: "w-1/6 text-center px-4 py-2 text-gray-500",
      },
      {
        header: "",
        cell: (group, row) => <EditTaskButton taskId={row.id} />,
        className: "w-1/12 text-center px-2 py-2",
      },
      // {
      //   header: "Delete",
      //   cell: (row) => <DeleteTaskButton taskId={row.id} />,
      //   className: "w-1/6 text-center px-4 py-2",
      // },
    ],
    [completed],
  );

  // Table Data
  const [groups, setGroups] = useState<RowGroup<Task>[]>([]);

  // Query tasks from DB
  const { data: tasks, isLoading } = trpc.useQuery([
    completed ? "task.getCompleted" : "task.getUncompleted",
  ]);

  useEffect(() => {
    if (tasks === undefined) {
      return;
    }

    // Apply the default sort (based on current date, so we can't use DB to sort)
    sortTasksArray(tasks);

    // Group tasks by due-date bin
    setGroups(groupTasks(tasks, completed));
  }, [tasks, completed]);

  if (isLoading) {
    return (
      <div className="w-full text-center text-gray-500">
        Retrieving tasks...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full text-gray-500">
        {columns.map((col) => (
          <div className={col.className} key={col.header}>
            <div key={col.header}>{col.header}</div>
          </div>
        ))}
      </div>

      {groups.map((group, i) => (
        <div key={group.name}>
          {/* Skip first group label ("today") */}
          {i !== 0 && (
            <div className="px-2 pt-2 text-gray-500">
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={group.collapsed}
                  onChange={() =>
                    setGroups(
                      update(groups, {
                        [i]: { collapsed: { $set: !group.collapsed } },
                      }),
                    )
                  }
                />
                <Icon>{group.collapsed ? "▶" : "🔽"}</Icon>
                <span className="px-2">{group.name}</span>
              </label>
            </div>
          )}

          {group.collapsed || (
            <div>
              {group.rows.map((row) => (
                <div
                  key={row.id}
                  className="flex w-full border border-gray-500 rounded-lg my-1"
                >
                  {columns.map((col) => (
                    <div className={col.className} key={col.header}>
                      {col.cell(group, row)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// const DeleteTaskButton = ({ taskId }: { taskId: string }): JSX.Element => {
//   const deleteTask = trpc.useMutation(
//     "task.deleteTask",
//     mutationOptimisticUpdates("task.getUncompleted"),
//   );

//   return (
//     <form
//       onSubmit={(ev) => {
//         ev.preventDefault();

//         deleteTask.mutate({
//           id: taskId,
//         });
//       }}
//     >
//       <button type="submit" title="Delete">
//         <Icon>🗑️</Icon>
//       </button>
//     </form>
//   );
// };

type RestartButtonProps = {
  taskId: string;
};

const RestartButton = ({ taskId }: RestartButtonProps): JSX.Element => {
  const toggleTask = trpc.useMutation(
    "task.uncompleteTask",
    mutationOptimisticUpdates("task.getCompleted"),
  );

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();

        toggleTask.mutate({
          id: taskId,
        });
      }}
    >
      <button type="submit" title="Restart">
        <IconHover>✔</IconHover>
      </button>
    </form>
  );
};

type DoneButtonProps = {
  task: Task;
};

const DoneButton = ({ task }: DoneButtonProps): JSX.Element => {
  const updateTask = trpc.useMutation(
    "task.updateTask",
    mutationOptimisticUpdates("task.getUncompleted"),
  );

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();

        const newTask = { ...task, done: true };

        const newDueDate = datePlusRepeat(
          today(),
          task.repeatAmount,
          task.repeatUnit,
        );

        if (newDueDate) {
          newTask.done = false;
          newTask.dueAt = newDueDate;
        }

        updateTask.mutate(newTask);
      }}
    >
      <button type="submit" title="Done">
        <IconHover>🔳</IconHover>
      </button>
    </form>
  );
};

const EditTaskButton = ({ taskId }: { taskId: string }): JSX.Element => {
  return (
    <IconHover>
      <Link href={`/edit/${taskId}`}>✏</Link>
    </IconHover>
  );
};
