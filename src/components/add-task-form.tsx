import { useState } from "react";
import { Button } from "./button";
import { TextInput } from "./text-input";
import { useCreateTaskMutation } from "../server/router/util";
import cuid from "cuid";
import dayjs from "dayjs";
import { useRouter } from "next/router";

type AddTaskFormProps = {
  listSlug: string | null;
};

const AddTaskForm = ({ listSlug }: AddTaskFormProps) => {
  const createTask = useCreateTaskMutation({ listSlug });

  const [summary, setSummary] = useState("");

  const router = useRouter();

  return (
    <form
      className="flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault();

        const summaryTrimmed = summary.trim();

        if (!summaryTrimmed) {
          return;
        }

        // Go to where the task will show up
        const targetUrl = listSlug ? `/list/${listSlug}` : "/";
        if (router.pathname !== targetUrl) {
          await router.push(targetUrl);
        }

        createTask.mutate({
          id: cuid(),
          summary: summaryTrimmed,
          listSlug,
          done: false,
          dueAt: dayjs().startOf("day").toDate(),
          repeatAmount: null,
          repeatUnit: null,
          description: null,
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
