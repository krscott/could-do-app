import { trpc } from "../utils/trpc";
import { mutationOptimisticUpdates } from "../server/router/util";
import { useState } from "react";
import { Button } from "./button";
import TextInput from "./text-input";

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
      <div className="flex-auto">
        <TextInput
          value={summary}
          placeholder="Task"
          onChange={(ev) => setSummary(ev.target.value)}
        />
      </div>
      <Button type="submit">Add Task</Button>
    </form>
  );
};

export default AddTaskForm;
