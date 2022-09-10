import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { SessionLayout } from "../../components/layout";
import { mutationOptimisticUpdates } from "../../server/router/util";
import { trpc } from "../../utils/trpc";

const GO_BACK_URL = "/";

const EditTask: NextPage = () => {
  const router = useRouter();
  const { taskId } = router.query;

  const updateTask = trpc.useMutation(
    "task.updateTask",
    mutationOptimisticUpdates("task.getAll"),
  );

  const [summary, setSummary] = useState("");

  // TODO: Use API route to return 4xx code?
  if (typeof taskId !== "string") {
    throw new Error(`Invalid taskID: ${taskId}`);
  }

  return (
    <SessionLayout title="Edit Task">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();

          updateTask.mutate({
            id: taskId,
            summary,
          });

          setSummary("");

          // Go back to task list view
          router.push(GO_BACK_URL);
        }}
      >
        <input
          className="flex-auto px-4 py-2 rounded-md border-2 border-zinc-800
          bg-neutral-900 focus:outline-none"
          type="text"
          value={summary}
          placeholder="Task"
          onChange={(ev) => setSummary(ev.target.value)}
        />
        <Link href={GO_BACK_URL}>Cancel</Link>
        <button
          type="submit"
          className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
        >
          Save
        </button>
      </form>
    </SessionLayout>
  );
};

export default EditTask;
