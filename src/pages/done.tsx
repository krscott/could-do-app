import type { NextPage } from "next";
import { SessionLayout } from "../components/layout";
import { DoDoneTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

const Done: NextPage = () => {
  return (
    <SessionLayout>
      <DoDoneTabs />
      <TasksTable completed={true} />
    </SessionLayout>
  );
};

export default Done;
