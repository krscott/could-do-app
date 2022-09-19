import { trpc } from "../utils/trpc";
import {
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../server/router/util";
import { useEffect, useMemo, useState } from "react";
import { futureGroup, today } from "../utils/dayjs-util";
import dayjs from "dayjs";
import update from "immutability-helper";
import { Icon, IconHover } from "./icon";
import Link from "next/link";
import {
  datePlusRepeat,
  isRepeating,
  repeatView,
} from "../utils/task-repeat-util";
import type { Task } from "@prisma/client";
import SquareSvg from "../../lib/tabler-icons/square.svg";
import CheckboxSvg from "../../lib/tabler-icons/checkbox.svg";
import PencilSvg from "../../lib/tabler-icons/pencil.svg";
import TrashSvg from "../../lib/tabler-icons/trash-x.svg";
import DownSvg from "../../lib/tabler-icons/chevron-down.svg";
import RightSvg from "../../lib/tabler-icons/chevron-right.svg";

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
  key: string;
  header: string;
  cell: (group: RowGroup<T>, row: T) => React.ReactNode;
  className: string;
};

type TasksTableProps = {
  completed?: boolean;
};

export const TasksTable = ({ completed }: TasksTableProps): JSX.Element => {
  const columns: ColumnDef<Task>[] = useMemo(() => {
    const colDefs: ColumnDef<Task>[] = [
      {
        key: "done",
        header: "",
        cell: completed
          ? (group, row) => <RestartButton taskId={row.id} />
          : (group, row) =>
              group.index === 0 || !isRepeating(row) ? (
                <DoneButton task={row} />
              ) : (
                <></>
              ),
        className: "w-10 text-center",
      },
      {
        key: "task",
        header: "Task",
        cell: (group, row) => row.summary,
        className: "grow",
      },
      // {
      //   header: "Due",
      //   cell: (row) => futureDay(row.dueAt),
      //   className: "w-2/6 text-center text-gray-500",
      // },
    ];

    if (!completed) {
      colDefs.push({
        key: "repeat",
        header: "Repeat",
        cell: (group, row) => repeatView(row.repeatAmount, row.repeatUnit),
        className: "w-1/6 text-center text-gray-500",
      });
    }

    colDefs.push({
      key: "edit",
      header: "",
      cell: (group, row) => <EditTaskButton taskId={row.id} />,
      className: "w-8 text-start",
    });

    if (completed) {
      colDefs.push({
        key: "delete",
        header: "",
        cell: (group, row) => <DeleteTaskButton taskId={row.id} />,
        className: "w-8 text-start",
      });
    }

    return colDefs;
  }, [completed]);

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
      <div className="flex items-baseline w-full py-2 text-gray-500">
        {columns.map((col) => (
          <div className={col.className} key={col.key}>
            <div key={col.header}>{col.header}</div>
          </div>
        ))}
      </div>

      {groups.map((group, i) => (
        <div key={group.name}>
          {/* Skip first group label ("today") */}
          {i !== 0 && (
            <div className="px-2 py-2 text-gray-500">
              <label className="cursor-pointer flex flex-row">
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
                <Icon>
                  {group.collapsed ? (
                    <RightSvg className="scale-75" />
                  ) : (
                    <DownSvg className="scale-75" />
                  )}
                </Icon>
                <span className="px-2">{group.name}</span>
              </label>
            </div>
          )}

          {group.collapsed || (
            <div className="flex flex-col gap-1">
              {group.rows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-baseline w-full py-2 border border-gray-500 rounded-lg"
                >
                  {columns.map((col) => (
                    <div className={col.className} key={col.key}>
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

const DeleteTaskButton = ({ taskId }: { taskId: string }): JSX.Element => {
  const deleteTask = useDeleteTaskMutation();

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();

        deleteTask.mutate({
          id: taskId,
        });
      }}
    >
      <button type="submit" title="Delete" className="align-bottom">
        <IconHover>
          <TrashSvg className="scale-75" />
        </IconHover>
      </button>
    </form>
  );
};

type RestartButtonProps = {
  taskId: string;
};

const RestartButton = ({ taskId }: RestartButtonProps): JSX.Element => {
  const toggleTask = useUpdateTaskMutation("task.uncompleteTask");

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();

        toggleTask.mutate({
          id: taskId,
        });
      }}
    >
      {/* <button type="submit" title="Restart">
        <IconHover>✔</IconHover>
      </button> */}

      <button type="submit" title="Mark as not done" className="align-bottom">
        <IconHover>
          <CheckboxSvg className="scale-75" />
        </IconHover>
      </button>
    </form>
  );
};

type DoneButtonProps = {
  task: Task;
};

const DoneButton = ({ task }: DoneButtonProps): JSX.Element => {
  const updateTask = useUpdateTaskMutation("task.updateTask");

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
      <button type="submit" title="Mark as done" className="align-bottom">
        <IconHover>
          <SquareSvg className="scale-75" />
        </IconHover>
      </button>
    </form>
  );
};

const EditTaskButton = ({ taskId }: { taskId: string }): JSX.Element => {
  return (
    <div className="inline-block align-bottom">
      <IconHover>
        <Link href={`/edit/${taskId}`}>
          <a title="Edit">
            <PencilSvg className="scale-75" />
          </a>
        </Link>
      </IconHover>
    </div>
  );
};
