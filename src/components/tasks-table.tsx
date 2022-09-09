import { trpc } from "../utils/trpc";
import { mutationOptimisticUpdates } from "../server/router/util";
import { useEffect, useState } from "react";
import { futureDay, futureGroup } from "../utils/dayjs-util";
import dayjs from "dayjs";
import update from "immutability-helper";

// Typescript kung-fu to find query data type
const __dummyTaskQueryFn = () => (trpc.useQuery(["task.getAll"]).data || [])[0];
type Task = NonNullable<ReturnType<typeof __dummyTaskQueryFn>>;

type TaskRow = {
  summary: string;
  id: string;
  createdAt: Date;
  dueAt: Date;
  dueGroup: string;
  repeat: string;
};

const taskToTaskRow = (task: Task): TaskRow => {
  const { summary, id, createdAt, dueAt, repeatAmount, repeatUnit } = task;

  // const dueGroup = futureGroup(dueAt);
  const dueGroup = summary.at(0) || "";

  const repeat =
    repeatAmount && repeatUnit
      ? `${repeatAmount}${repeatUnit.at(0)?.toLowerCase()}`
      : "";

  return {
    summary,
    id,
    createdAt,
    dueAt,
    dueGroup,
    repeat,
  };
};

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
  name: string;
  rows: T[];
  collapsed: boolean;
};

const groupTasksByDue = (tasks: Task[]): RowGroup<Task>[] => {
  const groups: RowGroup<Task>[] = [];

  for (const task of tasks) {
    const [name, i] = futureGroup(task.dueAt);

    const group = groups[i];

    if (group === undefined) {
      groups[i] = {
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
  cell: (row: T) => React.ReactNode;
  className: string;
};

const columns: ColumnDef<Task>[] = [
  {
    header: "Task",
    cell: (row) => row.summary,
    className: "grow px-4 py-2",
  },
  {
    header: "Due",
    cell: (row) => futureDay(row.dueAt),
    className: "w-2/6 text-center px-4 py-2 text-gray-500",
  },
  {
    header: "Delete",
    cell: (row) => <DeleteTaskButton taskId={row.id} />,
    className: "w-1/6 text-center px-4 py-2",
  },
];

export const TasksTable = (): JSX.Element => {
  // Table Data
  const [groups, setGroups] = useState<RowGroup<Task>[]>([]);

  // Query tasks from DB
  const { data: tasks, isLoading } = trpc.useQuery(["task.getAll"]);

  useEffect(() => {
    if (tasks === undefined) {
      return;
    }

    // Apply the default sort (based on current date, so we can't use DB to sort)
    sortTasksArray(tasks);

    // Group tasks by due-date bin
    setGroups(groupTasksByDue(tasks));
  }, [tasks]);

  if (isLoading) {
    return <div className="w-full text-center">Retrieving tasks...</div>;
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
                <span className="grayscale contrast-200 brightness-75">
                  {group.collapsed ? "▶" : "🔽"}
                </span>
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
                      {col.cell(row)}
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

const DeleteTaskButton = ({ taskId }: { taskId: string }) => {
  const deleteTask = trpc.useMutation(
    "task.deleteTask",
    mutationOptimisticUpdates("task.getAll"),
  );

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();

        deleteTask.mutate({
          id: taskId,
        });
      }}
    >
      <button type="submit">🗑️</button>
    </form>
  );
};
