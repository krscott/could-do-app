import AddTaskForm from "./add-task-form";
import type { LinkTabProps } from "./link-tabs";
import { LinkTabs } from "./link-tabs";
import { TasksTable } from "./tasks-table";
import { ListSelect } from "./list-select";
import { useRouter } from "next/router";
import type { ChangeEventHandler } from "react";

type TasksViewProps = {
  basePath?: string;
  completed?: boolean;
  listSlug?: string;
};

const CREATE_NEW_LIST_ID = "__create_new_list";

const CREATE_NEW_LIST_EXTRA: [string, string][] = [
  [CREATE_NEW_LIST_ID, "Create New List..."],
];

export const TasksView = ({
  completed,
  listSlug,
  basePath,
}: TasksViewProps) => {
  const linkTabsDoDone: LinkTabProps[] = [
    ["Do", basePath || ""],
    ["Done", `${basePath || ""}/done`],
  ];

  const router = useRouter();

  const onListChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const changeListSlug = e.target.value;

    let targetUrl: string;
    {
      if (changeListSlug === CREATE_NEW_LIST_ID) {
        targetUrl = "/create-list";
      } else if (!changeListSlug) {
        targetUrl = "/";
      } else {
        targetUrl = `/list/${changeListSlug}`;
      }
    }

    router.push(targetUrl);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <ListSelect
        listSlug={listSlug || null}
        onChange={onListChange}
        extraFields={CREATE_NEW_LIST_EXTRA}
      />
      <AddTaskForm listSlug={listSlug || null} />
      <LinkTabs links={linkTabsDoDone} />
      <TasksTable completed={completed} listSlug={listSlug || null} />
    </div>
  );
};
