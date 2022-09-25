import type { NextPage } from "next";
import { SessionLayout } from "../components/layout";
import { DoDoneTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

export { getServerSideProps } from "../utils/auth-ssr";

const Done: NextPage = () => {
  return (
    <SessionLayout title="Could-Do List">
      <DoDoneTabs />
      <TasksTable completed={true} />
    </SessionLayout>
  );
};

export default Done;
