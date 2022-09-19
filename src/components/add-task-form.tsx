import { useState } from "react";
import { Button } from "./button";
import TextInput from "./text-input";
import { useCreateTaskMutation } from "../server/router/util";

const AddTaskForm = () => {
  const createTask = useCreateTaskMutation();

  const [summary, setSummary] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        createTask.mutate({
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
