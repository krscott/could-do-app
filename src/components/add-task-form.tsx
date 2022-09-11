import { trpc } from "../utils/trpc";
import { mutationOptimisticUpdates } from "../server/router/util";
import { useState } from "react";

const AddTaskForm = () => {
  const postTask = trpc.useMutation(
    "task.postTask",
    mutationOptimisticUpdates("task.getUncompleted"),
  );

  const [summary, setSummary] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        postTask.mutate({
          summary,
        });

        setSummary("");
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
      <button
        type="submit"
        className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
      >
        Add Task
      </button>
    </form>
  );
};

export default AddTaskForm;
