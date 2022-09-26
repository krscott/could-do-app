import { trpc } from "../utils/trpc";
import {
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../server/router/util";
import type { MouseEventHandler } from "react";
import { useEffect, useMemo, useState } from "react";
import { futureGroup, today } from "../utils/dayjs-util";
import dayjs from "dayjs";
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
import { motion } from "framer-motion";
import { AddCommentForm, Comments } from "./comments";

const animationExpandVariants = {
  show: {
    opacity: 1,
    height: "auto",
  },
  hide: {
    opacity: 0,
    height: 0,
    overflow: "hidden",
  },
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
  index: number;
  name: string;
  rows: T[];
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
  cell: (group: RowGroup<T>, row: T, isExpanded: boolean) => React.ReactNode;
  className: string;
};

type TasksTableProps = {
  completed?: boolean;
  listSlug: string | null;
};

export const TasksTable = ({
  completed,
  listSlug,
}: TasksTableProps): JSX.Element => {
  const columns: ColumnDef<Task>[] = useMemo(() => {
    const colDefs: ColumnDef<Task>[] = [
      {
        key: "done",
        header: "",
        cell: completed
          ? (group, row) => (
              <RestartButton taskId={row.id} listSlug={listSlug} />
            )
          : (group, row) =>
              group.index === 0 || !isRepeating(row) ? (
                <DoneButton task={row} listSlug={listSlug} />
              ) : (
                <></>
              ),
        className: "shrink-0 w-10 text-center",
      },
      {
        key: "task",
        header: "Task",
        cell: (group, row, isExpanded) => {
          return (
            <div className="flex gap-4 cursor-pointer">
              <span>{row.summary}</span>
              <motion.span
                className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500"
                animate={{ opacity: isExpanded ? 0 : 1 }}
                transition={{ duration: 0.1 }}
              >
                {row.description?.trimStart()}
              </motion.span>
            </div>
          );
        },
        className: "grow overflow-hidden",
      },
      // {
      //   header: "Due",
      //   cell: (row) => futureDay(row.dueAt),
      //   className: "shrink-0 w-2/6 text-center text-gray-500",
      // },
    ];

    if (!completed) {
      colDefs.push({
        key: "repeat",
        header: "Repeat",
        cell: (group, row) => repeatView(row.repeatAmount, row.repeatUnit),
        className: "shrink-0 w-1/6 text-center text-gray-500",
      });
    }

    colDefs.push({
      key: "edit",
      header: "",
      cell: (group, row) => <EditTaskButton taskId={row.id} />,
      className: "shrink-0 w-8 text-start",
    });

    if (completed) {
      colDefs.push({
        key: "delete",
        header: "",
        cell: (group, row) => (
          <DeleteTaskButton taskId={row.id} listSlug={listSlug} />
        ),
        className: "shrink-0 w-8 text-start",
      });
    }

    return colDefs;
  }, [completed, listSlug]);

  // Table Data
  const [groups, setGroups] = useState<RowGroup<Task>[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<{
    [i: number]: boolean;
  }>({});

  // Query tasks from DB
  const { data: tasks, isLoading } = trpc.useQuery([
    "task.getMany",
    { done: !!completed, listSlug },
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

      {groups.map((group, i) => {
        const collapsed = collapsedGroups[group.index] || false;
        return (
          <div key={group.name}>
            {/* Skip first group label ("today") */}
            {i !== 0 && (
              <div className="px-2 py-2 text-gray-500">
                <label className="cursor-pointer flex flex-row">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={collapsed}
                    onChange={() =>
                      setCollapsedGroups({
                        ...collapsedGroups,
                        [group.index]: !collapsed,
                      })
                    }
                  />
                  <Icon>
                    {collapsed ? (
                      <RightSvg className="scale-75" />
                    ) : (
                      <DownSvg className="scale-75" />
                    )}
                  </Icon>
                  <span className="px-2">{group.name}</span>
                </label>
              </div>
            )}

            <motion.div
              className="flex flex-col gap-1"
              initial={collapsed ? "hide" : "show"}
              animate={collapsed ? "hide" : "show"}
              inherit={false}
              transition={{ ease: "easeIn", duration: 0.1 }}
              variants={animationExpandVariants}
            >
              {group.rows.map((task) => (
                <TaskRow
                  key={task.id}
                  columns={columns}
                  group={group}
                  task={task}
                />
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

type TaskRowProps = {
  columns: ColumnDef<Task>[];
  group: RowGroup<Task>;
  task: Task;
};

const TaskRow = ({ columns, group, task }: TaskRowProps): JSX.Element => {
  const [isExpanded, setExpanded] = useState(false);

  const toggleShow: MouseEventHandler<HTMLDivElement> = (ev) => {
    ev.stopPropagation();
    setExpanded(!isExpanded);
  };

  return (
    <div className="w-full py-2 border border-gray-500 rounded-lg">
      <div className="flex items-baseline">
        {columns.map((col) => (
          <div
            onClick={col.key === "task" ? toggleShow : undefined}
            className={col.className}
            key={col.key}
          >
            {col.cell(group, task, isExpanded)}
          </div>
        ))}
      </div>
      <motion.div
        className="overflow-hidden"
        initial={isExpanded ? "show" : "hide"}
        animate={isExpanded ? "show" : "hide"}
        inherit={false}
        transition={{ ease: "easeIn", duration: 0.1 }}
        variants={animationExpandVariants}
      >
        <div className="px-6 py-1 text-gray-400">
          {task.description?.split("\n").map((s, i) => (
            <div key={i}>{s}&nbsp;</div>
          ))}
        </div>

        <div className="border-t border-gray-500 px-6 py-2 flex flex-col gap-2">
          <Comments taskId={task.id} />
          <AddCommentForm taskId={task.id} />
        </div>
      </motion.div>
    </div>
  );
};

const DeleteTaskButton = ({
  taskId,
  listSlug,
}: {
  taskId: string;
  listSlug: string | null;
}): JSX.Element => {
  const deleteTask = useDeleteTaskMutation({ listSlug });

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
  listSlug: string | null;
};

const RestartButton = ({
  taskId,
  listSlug,
}: RestartButtonProps): JSX.Element => {
  const toggleTask = useUpdateTaskMutation({
    path: "task.uncompleteTask",
    listSlug,
  });

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
  listSlug: string | null;
};

const DoneButton = ({ task, listSlug }: DoneButtonProps): JSX.Element => {
  const updateTask = useUpdateTaskMutation({
    path: "task.updateTask",
    listSlug,
  });

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
