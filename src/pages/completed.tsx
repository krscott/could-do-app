import type { NextPage } from "next";
import { SessionLayout } from "../components/layout";
import { TaskTableTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

const Home: NextPage = () => {
  return (
    <SessionLayout title="Could-Do List">
      <TaskTableTabs currentHref="/completed" />

      <div className="w-full">
        <TasksTable completed={true} />
      </div>
    </SessionLayout>
  );
};

export default Home;
