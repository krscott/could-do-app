import type { NextPage } from "next";
import AddTaskForm from "../components/add-task-form";
import { SessionLayout } from "../components/layout";
import { DoDoneTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

const Home: NextPage = () => {
  return (
    <SessionLayout>
      <DoDoneTabs />
      <AddTaskForm />
      <TasksTable />
    </SessionLayout>
  );
};

export default Home;
