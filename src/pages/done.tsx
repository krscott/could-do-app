import type { NextPage } from "next";
import { SessionLayout } from "../components/layout";
import { TasksView } from "../components/tasks-view";

export { getServerSideProps } from "../utils/auth-ssr";

const Done: NextPage = () => {
  return (
    <SessionLayout title="Could-Do List">
      <TasksView completed={true} />
    </SessionLayout>
  );
};

export default Done;
