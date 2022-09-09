import { trpc } from "../utils/trpc";
import { mutationOptimisticUpdates } from "../server/router/util";
import { useEffect, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { futureDay } from "../utils/dayjs-util";
import dayjs from "dayjs";

// Typescript kung-fu to find query data type
const __dummyTaskQueryFn = () => (trpc.useQuery(["task.getAll"]).data || [])[0];
type Task = NonNullable<ReturnType<typeof __dummyTaskQueryFn>>;

const columnHelper = createColumnHelper<Task>();

const columns = [
  columnHelper.accessor("summary", {
    header: () => <div className="w-full text-left p-2">Summary</div>,
    cell: (x) => x.getValue(),
  }),
  columnHelper.accessor("dueAt", {
    header: () => <div className="w-full text-auto p-2">Due</div>,
    cell: (x) => (
      <div className="w-full text-center text-gray-500">
        {futureDay(x.getValue())}
      </div>
    ),
  }),
  columnHelper.accessor("id", {
    header: () => <div className="w-full text-auto p-2">Delete</div>,
    cell: (x) => (
      <div className="w-full text-center">
        <DeleteTaskButton taskId={x.getValue()} />
      </div>
    ),
  }),
];

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

export const TasksTable = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Query tasks from DB
  const { data: taskGetAllResponse, isLoading } = trpc.useQuery([
    "task.getAll",
  ]);

  // Update tasks state whenever query result changes
  useEffect(() => {
    if (taskGetAllResponse !== undefined) {
      // Apply the default sort (based on current date, so we can't use DB to sort)
      sortTasksArray(taskGetAllResponse);

      console.log(taskGetAllResponse);
      setTasks(taskGetAllResponse);
    }
  }, [taskGetAllResponse]);

  const table = useReactTable({
    columns,
    data: tasks || [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Retrieving tasks...</div>;

  return (
    <table className="w-full border-separate border-spacing-x-0 border-spacing-y-2">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-gray-500">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className="border-y first:border-l last:border-r
                  border-gray-500 px-4 py-2 first:rounded-l-lg last:rounded-r-lg"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
