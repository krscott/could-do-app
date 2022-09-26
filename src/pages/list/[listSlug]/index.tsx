import type { NextPage } from "next";
import { useRouter } from "next/router";
import { SessionLayout } from "../../../components/layout";
import { TasksView } from "../../../components/tasks-view";

export { getServerSideProps } from "../../../utils/auth-ssr";

const TaskList: NextPage = () => {
  const router = useRouter();

  const { listSlug } = router.query;

  return (
    <SessionLayout title="Could-Do List">
      <TasksView
        basePath={`/list/${listSlug}`}
        listSlug={typeof listSlug === "string" ? listSlug : undefined}
      />
    </SessionLayout>
  );
};

export default TaskList;
