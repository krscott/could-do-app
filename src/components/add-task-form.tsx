import { useState } from "react";
import { Button } from "./button";
import TextInput from "./text-input";
import { useCreateTaskMutation } from "../server/router/util";
import cuid from "cuid";
import dayjs from "dayjs";

const AddTaskForm = () => {
  const createTask = useCreateTaskMutation();

  const [summary, setSummary] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        createTask.mutate({
          id: cuid(),
          summary,
          done: false,
          dueAt: dayjs().startOf("day").toDate(),
          repeatAmount: null,
          repeatUnit: null,
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
      <Button type="submit">Add</Button>
    </form>
  );
};

export default AddTaskForm;
