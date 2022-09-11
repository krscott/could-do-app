import type { NextPage } from "next";
import { SessionLayout } from "../components/layout";
import { DoDoneTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

const Done: NextPage = () => {
  return (
    <SessionLayout title="Could-Do List">
      <DoDoneTabs />

      <div className="w-full">
        <TasksTable completed={true} />
      </div>
    </SessionLayout>
  );
};

export default Done;
