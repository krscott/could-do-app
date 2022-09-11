import type { NextPage } from "next";
import AddTaskForm from "../components/add-task-form";
import { SessionLayout } from "../components/layout";
import { TaskTableTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

const Home: NextPage = () => {
  return (
    <SessionLayout title="Could-Do List">
      <TaskTableTabs currentHref="/" />

      <div className="pt-10 pt-6">
        <AddTaskForm />
      </div>

      <div className="w-full">
        <TasksTable />
      </div>
    </SessionLayout>
  );
};

export default Home;
